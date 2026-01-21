// SMS Service using Twilio
let twilioClient;

// Initialize Twilio client
const initializeTwilio = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Twilio credentials not configured. SMS features will be disabled.');
    return null;
  }

  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
    return twilioClient;
  } catch (error) {
    console.error('❌ Failed to initialize Twilio:', error.message);
    return null;
  }
};

// Get or initialize client
const getClient = () => {
  if (!twilioClient) {
    twilioClient = initializeTwilio();
  }
  return twilioClient;
};

// Send SMS function
const sendSMS = async (to, message) => {
  const client = getClient();
  
  if (!client) {
    console.log('📱 SMS not sent (Twilio not configured):', { to, message });
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Ensure phone number has country code
    const phoneNumber = to.startsWith('+') ? to : `+1${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send bulk SMS
const sendBulkSMS = async (recipients, message) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient, message);
    results.push({ recipient, ...result });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// SMS templates
const templates = {
  appointmentConfirmation: (data) => 
    `CareSync: Your appointment with Dr. ${data.doctorName} is confirmed for ${new Date(data.date).toLocaleDateString()} at ${data.time}. Thank you!`,
  
  appointmentReminder: (data) => 
    `CareSync Reminder: You have an appointment with Dr. ${data.doctorName} tomorrow at ${data.time}. See you soon!`,
  
  appointmentCancelled: (data) => 
    `CareSync: Your appointment on ${new Date(data.date).toLocaleDateString()} at ${data.time} has been cancelled. Contact us for rescheduling.`,
  
  prescriptionReady: (patientName) => 
    `Hi ${patientName}, your prescription is ready for pickup at CareSync Pharmacy. Please bring your ID.`,
  
  labResultReady: (patientName) => 
    `Hi ${patientName}, your lab results are now available. Login to CareSync to view them.`,
  
  criticalLabResult: (patientName) => 
    `URGENT: ${patientName}, your lab results require immediate attention. Please contact your doctor or visit the emergency room.`,
  
  paymentConfirmation: (amount) => 
    `CareSync: Payment of $${amount} received successfully. Thank you!`,
  
  videoCallLink: (data) => 
    `CareSync: Your video consultation starts in 15 minutes. Join here: ${data.link}`,
  
  doctorApproved: (doctorName) => 
    `Congratulations Dr. ${doctorName}! Your CareSync account has been approved. Login to start managing appointments.`,
  
  accountSuspended: (name) => 
    `Hi ${name}, your CareSync account has been suspended. Please contact support for assistance.`,
  
  passwordReset: (code) => 
    `CareSync: Your password reset code is ${code}. Valid for 15 minutes. Do not share this code.`,
  
  verificationCode: (code) => 
    `CareSync: Your verification code is ${code}. Enter this code to verify your phone number.`
};

// Export functions
module.exports = {
  sendSMS,
  sendBulkSMS,
  
  // Specific SMS functions
  sendAppointmentConfirmation: async (phone, data) => {
    return sendSMS(phone, templates.appointmentConfirmation(data));
  },

  sendAppointmentReminder: async (phone, data) => {
    return sendSMS(phone, templates.appointmentReminder(data));
  },

  sendAppointmentCancellation: async (phone, data) => {
    return sendSMS(phone, templates.appointmentCancelled(data));
  },

  sendPrescriptionReady: async (phone, patientName) => {
    return sendSMS(phone, templates.prescriptionReady(patientName));
  },

  sendLabResultNotification: async (phone, patientName, isCritical = false) => {
    const message = isCritical 
      ? templates.criticalLabResult(patientName)
      : templates.labResultReady(patientName);
    return sendSMS(phone, message);
  },

  sendPaymentConfirmation: async (phone, amount) => {
    return sendSMS(phone, templates.paymentConfirmation(amount));
  },

  sendVideoCallLink: async (phone, data) => {
    return sendSMS(phone, templates.videoCallLink(data));
  },

  sendDoctorApproval: async (phone, doctorName) => {
    return sendSMS(phone, templates.doctorApproved(doctorName));
  },

  sendAccountSuspension: async (phone, name) => {
    return sendSMS(phone, templates.accountSuspended(name));
  },

  sendPasswordResetCode: async (phone, code) => {
    return sendSMS(phone, templates.passwordReset(code));
  },

  sendVerificationCode: async (phone, code) => {
    return sendSMS(phone, templates.verificationCode(code));
  }
};