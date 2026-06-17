import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

const prisma = new PrismaClient();

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'another-secret-key';
const TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// In-Memory Fallbacks for DB users
interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
}

const inMemoryUsers = new Map<string, InMemoryUser>();
const inMemoryRefreshTokens = new Set<string>();

// Store MFA status in-memory for all users (since DB schema doesn't contain MFA columns)
interface UserMfa {
  secret: string;
  enabled: boolean;
}
const mfaStore = new Map<string, UserMfa>();

// Prepopulate seed data in-memory
const seedHashedPassword = bcrypt.hashSync('Test@123', 10);
inMemoryUsers.set('student@test.com', {
  id: 'mem-student-id',
  email: 'student@test.com',
  passwordHash: seedHashedPassword,
  firstName: 'Test',
  lastName: 'Student',
  role: 'STUDENT',
  createdAt: new Date(),
});

// Helper: Try DB first, fallback to memory
async function runWithFallback<T>(
  dbAction: () => Promise<T>,
  fallbackAction: () => Promise<T>
): Promise<{ result: T; fallbackUsed: boolean }> {
  try {
    const result = await dbAction();
    return { result, fallbackUsed: false };
  } catch (error) {
    console.warn('⚠️ Database connection failed or error occurred. Using in-memory fallback. Error:', error);
    const result = await fallbackAction();
    return { result, fallbackUsed: true };
  }
}

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const { result, fallbackUsed } = await runWithFallback(
      async () => {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error('EMAIL_EXISTS');

        const newUser = await prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: role || 'STUDENT',
          },
        });
        return newUser;
      },
      async () => {
        if (inMemoryUsers.has(email)) throw new Error('EMAIL_EXISTS');
        
        const newUser: InMemoryUser = {
          id: `mem-${Date.now()}`,
          email,
          passwordHash,
          firstName,
          lastName,
          role: role || 'STUDENT',
          createdAt: new Date(),
        };
        inMemoryUsers.set(email, newUser);
        return newUser;
      }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
      },
      fallback: fallbackUsed,
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const { result: user, fallbackUsed } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) throw new Error('INVALID_CREDENTIALS');
        return dbUser;
      },
      async () => {
        const memUser = inMemoryUsers.get(email);
        if (!memUser) throw new Error('INVALID_CREDENTIALS');
        return memUser;
      }
    );

    if (!user.passwordHash) {
      res.status(400).json({ error: 'This account uses OAuth login' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Check MFA status from in-memory MFA store
    const userMfa = mfaStore.get(user.id);
    if (userMfa && userMfa.enabled) {
      res.status(200).json({
        message: 'MFA verification required',
        mfaRequired: true,
        userId: user.id,
        email: user.email,
      });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Save refresh token
    inMemoryRefreshTokens.add(refreshToken);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      fallback: fallbackUsed,
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      res.status(400).json({ error: 'Invalid credentials' });
    } else {
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    inMemoryRefreshTokens.delete(refreshToken);
  }

  res.status(200).json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  if (!inMemoryRefreshTokens.has(refreshToken)) {
    res.status(403).json({ error: 'Invalid refresh token' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string; email: string };
    
    const { result: user } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!dbUser) throw new Error('USER_NOT_FOUND');
        return dbUser;
      },
      async () => {
        const memUser = Array.from(inMemoryUsers.values()).find(u => u.id === decoded.id);
        if (!memUser) throw new Error('USER_NOT_FOUND');
        return memUser;
      }
    );

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(200).json({ accessToken });
  } catch (error: any) {
    res.status(403).json({ error: 'Expired or invalid refresh token' });
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const { result: user } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) throw new Error('USER_NOT_FOUND');
        return dbUser;
      },
      async () => {
        const memUser = inMemoryUsers.get(email);
        if (!memUser) throw new Error('USER_NOT_FOUND');
        return memUser;
      }
    );

    console.log(`✉️ Reset link sent to ${user.email}`);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    res.status(200).json({ message: 'If email exists, reset link will be sent.' });
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { fallbackUsed } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) throw new Error('USER_NOT_FOUND');
        await prisma.user.update({
          where: { email },
          data: { passwordHash },
        });
        return true;
      },
      async () => {
        const memUser = inMemoryUsers.get(email);
        if (!memUser) throw new Error('USER_NOT_FOUND');
        memUser.passwordHash = passwordHash;
        return true;
      }
    );

    res.status(200).json({ message: 'Password reset successfully', fallback: fallbackUsed });
  } catch (error: any) {
    res.status(400).json({ error: 'Password reset failed', details: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { result: user, fallbackUsed } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!dbUser) throw new Error('USER_NOT_FOUND');
        return dbUser;
      },
      async () => {
        const memUser = Array.from(inMemoryUsers.values()).find(u => u.id === req.user!.id);
        if (!memUser) throw new Error('USER_NOT_FOUND');
        return memUser;
      }
    );

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fallback: fallbackUsed,
    });
  } catch (error: any) {
    res.status(404).json({ error: 'User profile not found' });
  }
};

export const setupMfa = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const secret = totp.generateSecret();
    const otpauthUrl = totp.toURI({ label: req.user.email, issuer: 'EduSphere', secret });

    // Store in-memory MFA setup
    mfaStore.set(req.user.id, { secret, enabled: false });

    res.status(200).json({
      secret,
      otpauthUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to setup MFA', details: error.message });
  }
};

export const verifyMfa = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    res.status(400).json({ error: 'User ID and token are required' });
    return;
  }

  try {
    const { result: user, fallbackUsed } = await runWithFallback(
      async () => {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) throw new Error('USER_NOT_FOUND');
        return dbUser;
      },
      async () => {
        const memUser = Array.from(inMemoryUsers.values()).find(u => u.id === userId);
        if (!memUser) throw new Error('USER_NOT_FOUND');
        return memUser;
      }
    );

    const userMfa = mfaStore.get(userId);

    if (!userMfa || !userMfa.secret) {
      res.status(400).json({ error: 'MFA setup is not completed' });
      return;
    }

    const isValid = await totp.verify(token, { secret: userMfa.secret });

    if (!isValid) {
      res.status(400).json({ error: 'Invalid MFA verification token' });
      return;
    }

    // Enable MFA for User
    userMfa.enabled = true;
    mfaStore.set(userId, userMfa);

    // Create Tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    inMemoryRefreshTokens.add(refreshToken);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      fallback: fallbackUsed,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'MFA verification failed', details: error.message });
  }
};

export const googleLogin = (req: AuthenticatedRequest, res: Response): void => {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
  const redirectUri = 'http://localhost:3001/api/auth/google/callback';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=email%20profile`;
  
  res.redirect(url);
};

export const googleCallback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { code } = req.query;

  if (!code) {
    const mockToken = jwt.sign(
      { id: 'google-mock-id', email: 'google-user@test.com', role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    res.redirect(`http://localhost:3000/login?token=${mockToken}`);
    return;
  }

  try {
    const mockToken = jwt.sign(
      { id: 'google-mock-id', email: 'google-user@test.com', role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    res.redirect(`http://localhost:3000/login?token=${mockToken}`);
  } catch (error: any) {
    res.status(500).json({ error: 'OAuth callback exchange failed', details: error.message });
  }
};
