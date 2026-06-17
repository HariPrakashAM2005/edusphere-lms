import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const isConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS &&
    !process.env.SMTP_PASS.includes('your-api-key');

  if (isConfigured) {
    console.log('✉️ Initializing SMTP Transporter for SendGrid/AWS SES');
    const tempTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await tempTransporter.verify();
      transporter = tempTransporter;
      console.log('✅ SMTP connection verified successfully');
      return transporter;
    } catch (verifyError) {
      console.warn('⚠️ SMTP connection verification failed. Falling back to Ethereal. Error:', verifyError);
    }
  }

  console.warn('⚠️ SMTP credentials are not configured or invalid. Setting up Ethereal test transporter.');
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✉️ Ethereal SMTP account initialized. User: ${testAccount.user}`);
  } catch (err) {
    console.error('❌ Failed to create Ethereal test account. Falling back to stdout logger.', err);
    // Mock transporter that logs to console
    transporter = {
      sendMail: async (mailOptions: any) => {
        console.log('📬 [EMAIL MOCK LOG]:', JSON.stringify(mailOptions, null, 2));
        return { messageId: 'mock-id', previewUrl: 'http://localhost:3001/mock-email' };
      }
    } as any;
  }

  return transporter!;
};

/**
 * Loads an HTML template file from templates directory and substitutes placeholder variables.
 */
const loadTemplate = async (templateName: string, replacements: Record<string, string>): Promise<string> => {
  // dirname is src/services, templates is src/templates/email
  const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
  try {
    let content = await fs.readFile(templatePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return content;
  } catch (err) {
    console.warn(`⚠️ Template ${templateName} not found at ${templatePath}. Using text fallback.`);
    // Default fallback HTML structure
    let body = `<h2>EduSphere Notification</h2>`;
    for (const [key, value] of Object.entries(replacements)) {
      body += `<p><strong>${key}:</strong> ${value}</p>`;
    }
    return `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        ${body}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 EduSphere LMS</p>
      </div>
    `;
  }
};

/**
 * Send welcome email to a new user.
 */
export const sendWelcomeEmail = async (user: { email: string; firstName: string; lastName: string }): Promise<void> => {
  const mailer = await getTransporter();
  const html = await loadTemplate('welcome', {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@edusphere.com',
    to: user.email,
    subject: 'Welcome to EduSphere! 🚀',
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`🔗 Welcome Email sent. Preview URL: ${preview}`);
};

/**
 * Send password reset link to user.
 */
export const sendPasswordResetEmail = async (
  user: { email: string; firstName: string; lastName: string },
  token: string
): Promise<void> => {
  const mailer = await getTransporter();
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  const html = await loadTemplate('reset-password', {
    firstName: user.firstName,
    lastName: user.lastName,
    resetUrl,
  });

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@edusphere.com',
    to: user.email,
    subject: 'Reset Your EduSphere Password',
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`🔗 Password Reset Email sent. Preview URL: ${preview}`);
};

/**
 * Send warning alert for low attendance.
 */
export const sendAttendanceAlert = async (
  student: { email: string; firstName: string; lastName: string },
  percentage: number,
  courseTitle: string
): Promise<void> => {
  const mailer = await getTransporter();
  const html = await loadTemplate('attendance-alert', {
    firstName: student.firstName,
    lastName: student.lastName,
    percentage: percentage.toFixed(1),
    courseTitle,
  });

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@edusphere.com',
    to: student.email,
    subject: `⚠️ Urgent: Attendance Alert - ${courseTitle}`,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`🔗 Attendance Warning Email sent. Preview URL: ${preview}`);
};

/**
 * Send deadline reminder for upcoming assignments.
 */
export const sendAssignmentReminder = async (
  student: { email: string; firstName: string; lastName: string },
  assignment: { title: string; dueDate: string; courseTitle: string }
): Promise<void> => {
  const mailer = await getTransporter();
  const formattedDate = new Date(assignment.dueDate).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Uses fallback template loader
  const html = await loadTemplate('assignment-reminder', {
    firstName: student.firstName,
    lastName: student.lastName,
    assignmentTitle: assignment.title,
    dueDate: formattedDate,
    courseTitle: assignment.courseTitle,
  });

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@edusphere.com',
    to: student.email,
    subject: `⏱️ Deadline Reminder: ${assignment.title}`,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`🔗 Assignment Reminder Email sent. Preview URL: ${preview}`);
};

/**
 * Send certificate delivery email.
 */
export const sendCertificateEmail = async (
  student: { email: string; firstName: string; lastName: string },
  certificate: { serialNumber: string; courseTitle: string; pdfUrl: string }
): Promise<void> => {
  const mailer = await getTransporter();
  
  // Uses fallback template loader
  const html = await loadTemplate('certificate-notification', {
    firstName: student.firstName,
    lastName: student.lastName,
    courseTitle: certificate.courseTitle,
    serialNumber: certificate.serialNumber,
    pdfUrl: certificate.pdfUrl,
  });

  const info = await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@edusphere.com',
    to: student.email,
    subject: `🎓 Congratulations! Your Certificate for ${certificate.courseTitle} is ready`,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log(`🔗 Certificate Notification Email sent. Preview URL: ${preview}`);
};
