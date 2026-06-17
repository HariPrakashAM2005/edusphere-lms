'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldAlert, Sun, Moon, Sparkles, BookOpen, Award, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ParticleBackground from '../../components/animations/ParticleBackground';
import { useTheme } from 'next-themes';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verifyMfa, error, clearError, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MFA states
  const [mfaActive, setMfaActive] = useState(false);
  const [mfaToken, setMfaToken] = useState('');

  // Check URL params for redirect tokens
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      router.push('/dashboard/student');
    }
  }, [searchParams, router]);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'STUDENT') {
        router.push('/dashboard/student');
      } else {
        router.push('/faculty/attendance/reports');
      }
    }
  }, [user, router]);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    clearError();

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.mfaRequired) {
        setMfaActive(true);
      } else {
        router.push('/dashboard/student');
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;

    setIsSubmitting(true);
    clearError();

    const res = await verifyMfa(mfaToken);
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard/student');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Left Section - Interactive Particle Showcase (lg:col-span-7) */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 relative flex-col justify-between p-12 text-white overflow-hidden select-none">
        <ParticleBackground color="rgba(99, 102, 241, " particleCount={60} />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center space-x-2">
          <span className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white font-black text-xl">E</span>
          <span className="text-xl font-black tracking-tight">EduSphere</span>
        </div>

        {/* Center Marketing Panel */}
        <div className="max-w-lg mx-auto my-auto space-y-8 relative z-10">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-blue-100 to-teal-200 bg-clip-text text-transparent">
              Empowering Education Across India
            </h1>
            <p className="mt-4 text-sm text-indigo-200 leading-relaxed font-medium">
              Join the nation's next-generation academic portal. Access courses, track attendance, and secure certifications effortlessly.
            </p>
          </motion.div>

          {/* Floating Visual Cards */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5"
            >
              <div className="p-2 w-max rounded-xl bg-blue-500/20 text-blue-300">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black">AI Proctoring</h4>
              <p className="text-[10px] text-indigo-200">Face recognition validation secures assessment authenticity.</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5"
            >
              <div className="p-2 w-max rounded-xl bg-teal-500/20 text-teal-300">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black">Verifiable Credentials</h4>
              <p className="text-[10px] text-indigo-200">Tamper-proof academic certificates logged on the blockchain.</p>
            </motion.div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 text-[10px] text-indigo-300/60">
          © 2026 EduSphere LMS. All rights reserved.
        </div>
      </div>

      {/* Right Section - Glass Login Card (lg:col-span-5) */}
      <div className="lg:col-span-5 relative flex flex-col justify-between py-12 px-6 sm:px-12 z-10 overflow-hidden bg-gray-50 dark:bg-gray-950">
        
        {/* Header bar */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="lg:hidden flex items-center space-x-2">
            <span className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">E</span>
            <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">EduSphere</span>
          </div>
          <div className="hidden lg:block" />

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850 transition"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
          </button>
        </div>

        {/* Credentials Form Box */}
        <div className="my-auto sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card glass className="p-8 border border-gray-200/50 dark:border-gray-850/60 !rounded-3xl shadow-xl">
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="mt-1.5 text-xs text-gray-500">
                  Sign in to your learning dashboard
                </p>
              </div>

              {/* Error Popup */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-150 dark:border-rose-900/40"
                  >
                    <div className="flex items-center">
                      <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 mr-2.5 flex-shrink-0" />
                      <p className="text-xs font-semibold text-rose-800 dark:text-rose-350 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Render (MFA or standard) */}
              {mfaActive ? (
                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-sm font-bold mb-1">MFA Security Check</h3>
                    <p className="text-[10px] text-gray-500">
                      Enter the 6-digit confirmation code from your authenticator app
                    </p>
                  </div>

                  <Input
                    label="One-Time Passcode"
                    type="text"
                    id="token"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    className="text-center text-xl font-mono tracking-widest"
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setMfaActive(false)}
                      className="text-xs font-bold text-gray-500 hover:text-blue-600 transition"
                    >
                      Back to Credentials
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                  />

                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-650 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <div className="text-right">
                    <a href="#" className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                    {isSubmitting ? 'Signing In...' : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
                  </Button>

                  {/* Google OAuth Option */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-[9px] font-bold uppercase tracking-wider">or continue with</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/80 text-xs font-black shadow-sm transition"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Google Workspace
                  </button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-center text-[10px] text-gray-400">
          © 2026 EduSphere LMS. All institutional access audited.
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
