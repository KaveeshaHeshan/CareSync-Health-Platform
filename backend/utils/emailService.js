const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    console.log('⚠️  Using development email (emails will not be sent)');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.password'
      }
    });
  }

  // Production email configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'CareSync Health'} <${process.env.EMAIL_FROM || 'noreply@caresync.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const templates = {
  // Welcome email
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to CareSync Health Platform!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with CareSync. We're excited to have you on board!</p>
      <p>You can now:</p>
      <ul>
        <li>Book appointments with verified doctors</li>
        <li>Access your medical records</li>
        <li>View lab results and prescriptions</li>
        <li>Join video consultations</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Appointment confirmation
  appointmentConfirmation: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Appointment Confirmed</h2>
      <p>Hi ${data.patientName},</p>
      <p>Your appointment has been confirmed!</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> ${data.doctorName}</p>
        <p><strong>Specialization:</strong> ${data.specialization || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Type:</strong> ${data.type === 'online' ? 'Video Consultation' : 'In-Person'}</p>
        <p><strong>Amount Paid:</strong> $${data.amount}</p>
      </div>
      ${data.type === 'online' ? '<p>You will receive a video call link before your appointment time.</p>' : '<p>Please arrive 10 minutes before your scheduled time.</p>'}
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Appointment reminder
  appointmentReminder: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Appointment Reminder</h2>
      <p>Hi ${data.patientName},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> ${data.doctorName}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.time}</p>
      </div>
      <p>See you soon!</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Password reset
  passwordReset: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Doctor approval
  doctorApproved: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Account Approved!</h2>
      <p>Hi Dr. ${name},</p>
      <p>Congratulations! Your doctor account has been approved by our admin team.</p>
      <p>You can now:</p>
      <ul>
        <li>Manage your appointment schedule</li>
        <li>View patient appointments</li>
        <li>Conduct video consultations</li>
        <li>Generate prescriptions</li>
      </ul>
      <p>Login to your account to get started!</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Doctor rejection
  doctorRejected: (name, reason) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Account Application Update</h2>
      <p>Hi Dr. ${name},</p>
      <p>Thank you for your interest in joining CareSync Health Platform.</p>
      <p>Unfortunately, we are unable to approve your account at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Lab result ready
  labResultReady: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Lab Results Available</h2>
      <p>Hi ${data.patientName},</p>
      <p>Your lab test results are now available.</p>
      <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Test Type:</strong> ${data.testType}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
      </div>
      <p>Login to your account to view the complete results.</p>
      ${data.isCritical ? '<p style="color: #EF4444;"><strong>⚠️ This result requires immediate attention. Please contact your doctor.</strong></p>' : ''}
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Prescription ready
  prescriptionReady: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">New Prescription</h2>
      <p>Hi ${data.patientName},</p>
      <p>Dr. ${data.doctorName} has issued a new prescription for you.</p>
      <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Medication:</strong> ${data.medication}</p>
        <p><strong>Dosage:</strong> ${data.dosage}</p>
        <p><strong>Frequency:</strong> ${data.frequency}</p>
        <p><strong>Duration:</strong> ${data.duration}</p>
      </div>
      <p>You can view and download your prescription from your account.</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `,

  // Payment confirmation
  paymentConfirmation: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Payment Successful</h2>
      <p>Hi ${data.name},</p>
      <p>Your payment has been processed successfully.</p>
      <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
      </div>
      <p>Thank you for your payment!</p>
      <p>Best regards,<br>CareSync Team</p>
    </div>
  `
};

// Export functions
module.exports = {
  sendEmail,
  
  // Specific email functions
  sendWelcomeEmail: async (email, name) => {
    return sendEmail({
      to: email,
      subject: 'Welcome to CareSync Health Platform',
      html: templates.welcome(name)
    });
  },

  sendAppointmentConfirmation: async (email, data) => {
    return sendEmail({
      to: email,
      subject: 'Appointment Confirmed - CareSync',
      html: templates.appointmentConfirmation(data)
    });
  },

  sendAppointmentReminder: async (email, data) => {
    return sendEmail({
      to: email,
      subject: 'Appointment Reminder - CareSync',
      html: templates.appointmentReminder(data)
    });
  },

  sendPasswordResetEmail: async (email, name, resetUrl) => {
    return sendEmail({
      to: email,
      subject: 'Password Reset - CareSync',
      html: templates.passwordReset(name, resetUrl)
    });
  },

  sendDoctorApprovalEmail: async (email, name) => {
    return sendEmail({
      to: email,
      subject: 'Doctor Account Approved - CareSync',
      html: templates.doctorApproved(name)
    });
  },

  sendDoctorRejectionEmail: async (email, name, reason) => {
    return sendEmail({
      to: email,
      subject: 'Doctor Account Application Update - CareSync',
      html: templates.doctorRejected(name, reason)
    });
  },

  sendLabResultNotification: async (email, data) => {
    return sendEmail({
      to: email,
      subject: 'Lab Results Available - CareSync',
      html: templates.labResultReady(data)
    });
  },

  sendPrescriptionNotification: async (email, data) => {
    return sendEmail({
      to: email,
      subject: 'New Prescription - CareSync',
      html: templates.prescriptionReady(data)
    });
  },

  sendPaymentConfirmation: async (email, data) => {
    return sendEmail({
      to: email,
      subject: 'Payment Confirmation - CareSync',
      html: templates.paymentConfirmation(data)
    });
  }
};