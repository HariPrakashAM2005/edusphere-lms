"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCertificateEmail = exports.sendAssignmentReminder = exports.sendAttendanceAlert = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
let transporter = null;
const getTransporter = async () => {
    if (transporter)
        return transporter;
    const isConfigured = process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        !process.env.SMTP_PASS.includes('your-api-key');
    if (isConfigured) {
        console.log('✉️ Initializing SMTP Transporter for SendGrid/AWS SES');
        const tempTransporter = nodemailer_1.default.createTransport({
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
        }
        catch (verifyError) {
            console.warn('⚠️ SMTP connection verification failed. Falling back to Ethereal. Error:', verifyError);
        }
    }
    console.warn('⚠️ SMTP credentials are not configured or invalid. Setting up Ethereal test transporter.');
    try {
        const testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`✉️ Ethereal SMTP account initialized. User: ${testAccount.user}`);
    }
    catch (err) {
        console.error('❌ Failed to create Ethereal test account. Falling back to stdout logger.', err);
        // Mock transporter that logs to console
        transporter = {
            sendMail: async (mailOptions) => {
                console.log('📬 [EMAIL MOCK LOG]:', JSON.stringify(mailOptions, null, 2));
                return { messageId: 'mock-id', previewUrl: 'http://localhost:3001/mock-email' };
            }
        };
    }
    return transporter;
};
/**
 * Loads an HTML template file from templates directory and substitutes placeholder variables.
 */
const loadTemplate = async (templateName, replacements) => {
    // dirname is src/services, templates is src/templates/email
    const templatePath = path_1.default.join(__dirname, '..', 'templates', 'email', `${templateName}.html`);
    try {
        let content = await promises_1.default.readFile(templatePath, 'utf8');
        for (const [key, value] of Object.entries(replacements)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return content;
    }
    catch (err) {
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
const sendWelcomeEmail = async (user) => {
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
    const preview = nodemailer_1.default.getTestMessageUrl(info);
    if (preview)
        console.log(`🔗 Welcome Email sent. Preview URL: ${preview}`);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
/**
 * Send password reset link to user.
 */
const sendPasswordResetEmail = async (user, token) => {
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
    const preview = nodemailer_1.default.getTestMessageUrl(info);
    if (preview)
        console.log(`🔗 Password Reset Email sent. Preview URL: ${preview}`);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Send warning alert for low attendance.
 */
const sendAttendanceAlert = async (student, percentage, courseTitle) => {
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
    const preview = nodemailer_1.default.getTestMessageUrl(info);
    if (preview)
        console.log(`🔗 Attendance Warning Email sent. Preview URL: ${preview}`);
};
exports.sendAttendanceAlert = sendAttendanceAlert;
/**
 * Send deadline reminder for upcoming assignments.
 */
const sendAssignmentReminder = async (student, assignment) => {
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
    const preview = nodemailer_1.default.getTestMessageUrl(info);
    if (preview)
        console.log(`🔗 Assignment Reminder Email sent. Preview URL: ${preview}`);
};
exports.sendAssignmentReminder = sendAssignmentReminder;
/**
 * Send certificate delivery email.
 */
const sendCertificateEmail = async (student, certificate) => {
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
    const preview = nodemailer_1.default.getTestMessageUrl(info);
    if (preview)
        console.log(`🔗 Certificate Notification Email sent. Preview URL: ${preview}`);
};
exports.sendCertificateEmail = sendCertificateEmail;
