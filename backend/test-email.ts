import dotenv from 'dotenv';
// Load environment variables before importing services
dotenv.config();

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAttendanceAlert,
  sendAssignmentReminder,
  sendCertificateEmail,
} from './src/services/email.service';

async function testEmailDispatch() {
  console.log('🧪 Starting Email Notification System Verification...');
  
  const mockUser = {
    email: 'student@test.com',
    firstName: 'Hari',
    lastName: 'Prasad',
  };

  try {
    // 1. Welcome Email
    console.log('\n1. Sending Welcome Email...');
    await sendWelcomeEmail(mockUser);

    // 2. Password Reset Email
    console.log('\n2. Sending Password Reset Email...');
    await sendPasswordResetEmail(mockUser, 'mock-reset-token-xyz-123');

    // 3. Attendance Alert Email
    console.log('\n3. Sending Attendance Warning Alert...');
    await sendAttendanceAlert(mockUser, 64.5, 'Introduction to Computer Science');

    // 4. Assignment Reminder Email (uses template fallback)
    console.log('\n4. Sending Assignment Reminder (Template Fallback)...');
    await sendAssignmentReminder(mockUser, {
      title: 'Lab Exercise 3: Binary Search Trees',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      courseTitle: 'Data Structures and Algorithms',
    });

    // 5. Certificate Email (uses template fallback)
    console.log('\n5. Sending Certificate Notification (Template Fallback)...');
    await sendCertificateEmail(mockUser, {
      serialNumber: 'CERT-2026-9821-X',
      courseTitle: 'Responsive Web Design Basics',
      pdfUrl: 'http://localhost:3001/certificates/CERT-2026-9821-X.pdf',
    });

    console.log('\n✅ Verification Script Completed successfully!');
  } catch (error) {
    console.error('\n❌ Email Verification failed with error:', error);
  }
}

testEmailDispatch();
