const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const LabResult = require('../models/LabResult');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Consultation = require('../models/Consultation');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Clear all data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await LabResult.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});
    await Consultation.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      // Admin
      {
        name: 'Admin User',
        email: 'admin@caresync.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+1234567890',
        age: 35,
        gender: 'Male',
        isActive: true
      },
      
      // Doctors
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567891',
        age: 42,
        gender: 'Female',
        specialization: 'Cardiologist',
        experience: '15 years',
        fees: 150,
        rating: 4.8,
        isActive: true,
        isApproved: true
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567892',
        age: 38,
        gender: 'Male',
        specialization: 'Pediatrician',
        experience: '12 years',
        fees: 120,
        rating: 4.9,
        isActive: true,
        isApproved: true
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567893',
        age: 35,
        gender: 'Female',
        specialization: 'Dermatologist',
        experience: '10 years',
        fees: 130,
        rating: 4.7,
        isActive: true,
        isApproved: true
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567894',
        age: 50,
        gender: 'Male',
        specialization: 'Orthopedic Surgeon',
        experience: '20 years',
        fees: 200,
        rating: 4.9,
        isActive: true,
        isApproved: true
      },
      {
        name: 'Dr. Priya Patel',
        email: 'priya.patel@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567895',
        age: 33,
        gender: 'Female',
        specialization: 'General Physician',
        experience: '8 years',
        fees: 100,
        rating: 4.6,
        isActive: true,
        isApproved: true
      },
      
      // Pending Doctor (not approved)
      {
        name: 'Dr. Robert Brown',
        email: 'robert.brown@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        phone: '+1234567896',
        age: 40,
        gender: 'Male',
        specialization: 'Neurologist',
        experience: '14 years',
        fees: 180,
        rating: 0,
        isActive: true,
        isApproved: false
      },
      
      // Patients
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567897',
        age: 45,
        gender: 'Male',
        isActive: true
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567898',
        age: 32,
        gender: 'Female',
        isActive: true
      },
      {
        name: 'David Martinez',
        email: 'david.martinez@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567899',
        age: 28,
        gender: 'Male',
        isActive: true
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567800',
        age: 38,
        gender: 'Female',
        isActive: true
      },
      {
        name: 'Tom Wilson',
        email: 'tom.wilson@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567801',
        age: 55,
        gender: 'Male',
        isActive: true
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed Appointments
const seedAppointments = async (users) => {
  try {
    const patients = users.filter(u => u.role === 'PATIENT');
    const doctors = users.filter(u => u.role === 'DOCTOR' && u.isApproved);

    const appointments = [
      // Completed appointments
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        time: '10:00 AM',
        type: 'in-person',
        status: 'completed',
        reason: 'Regular checkup',
        notes: 'Patient is healthy, all vitals normal',
        isPaid: true,
        amount: 150
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        time: '2:00 PM',
        type: 'online',
        status: 'completed',
        reason: 'Consultation for child vaccination',
        notes: 'Scheduled vaccinations discussed',
        isPaid: true,
        amount: 120
      },
      
      // Confirmed appointments (upcoming)
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '11:00 AM',
        type: 'in-person',
        status: 'confirmed',
        reason: 'Skin rash examination',
        isPaid: true,
        amount: 130
      },
      {
        patient: patients[3]._id,
        doctor: doctors[3]._id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '3:00 PM',
        type: 'online',
        status: 'confirmed',
        reason: 'Knee pain consultation',
        isPaid: true,
        amount: 200
      },
      {
        patient: patients[4]._id,
        doctor: doctors[4]._id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '9:00 AM',
        type: 'in-person',
        status: 'confirmed',
        reason: 'Fever and cold',
        isPaid: true,
        amount: 100
      },
      
      // Pending appointments
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        time: '4:00 PM',
        type: 'online',
        status: 'pending',
        reason: 'Follow-up consultation',
        isPaid: false,
        amount: 120
      },
      
      // Cancelled appointment
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        time: '1:00 PM',
        type: 'in-person',
        status: 'cancelled',
        reason: 'Heart checkup',
        notes: 'Cancelled by patient',
        isPaid: false,
        amount: 150
      }
    ];

    const createdAppointments = await Appointment.create(appointments);
    console.log(`✅ ${createdAppointments.length} appointments created`);
    return createdAppointments;
  } catch (error) {
    console.error('Error seeding appointments:', error);
    throw error;
  }
};

// Seed Prescriptions
const seedPrescriptions = async (appointments, users) => {
  try {
    const completedAppointments = appointments.filter(a => a.status === 'completed');

    const prescriptions = [
      {
        appointment: completedAppointments[0]._id,
        patient: completedAppointments[0].patient,
        doctor: completedAppointments[0].doctor,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning with food',
        status: 'active'
      },
      {
        appointment: completedAppointments[1]._id,
        patient: completedAppointments[1].patient,
        doctor: completedAppointments[1].doctor,
        medication: 'Amoxicillin',
        dosage: '250mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Complete the full course',
        status: 'dispensed',
        dispensedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdPrescriptions = await Prescription.create(prescriptions);
    console.log(`✅ ${createdPrescriptions.length} prescriptions created`);
    return createdPrescriptions;
  } catch (error) {
    console.error('Error seeding prescriptions:', error);
    throw error;
  }
};

// Seed Lab Results
const seedLabResults = async (appointments, users) => {
  try {
    const patients = users.filter(u => u.role === 'PATIENT');
    const doctors = users.filter(u => u.role === 'DOCTOR' && u.isApproved);

    const labResults = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        testType: 'Complete Blood Count (CBC)',
        testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        results: 'All values within normal range',
        interpretation: 'Normal',
        isCritical: false,
        isAbnormal: false,
        urgency: 'routine'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointment: appointments[1]._id,
        testType: 'Lipid Panel',
        testDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        results: 'Cholesterol: 220 mg/dL (High)',
        interpretation: 'Elevated cholesterol levels',
        isCritical: false,
        isAbnormal: true,
        urgency: 'routine'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[4]._id,
        testType: 'Thyroid Function Test',
        testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        urgency: 'urgent'
      }
    ];

    const createdLabResults = await LabResult.create(labResults);
    console.log(`✅ ${createdLabResults.length} lab results created`);
    return createdLabResults;
  } catch (error) {
    console.error('Error seeding lab results:', error);
    throw error;
  }
};

// Seed Payments
const seedPayments = async (appointments) => {
  try {
    const paidAppointments = appointments.filter(a => a.isPaid);

    const payments = paidAppointments.map((appointment, index) => ({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      amount: appointment.amount,
      status: 'succeeded',
      paymentMethod: 'card',
      stripePaymentIntentId: `pi_test_${Date.now()}_${index}`,
      transactionDate: appointment.date
    }));

    const createdPayments = await Payment.create(payments);
    console.log(`✅ ${createdPayments.length} payments created`);
    return createdPayments;
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};

// Seed Notifications
const seedNotifications = async (users, appointments) => {
  try {
    const patients = users.filter(u => u.role === 'PATIENT');
    const doctors = users.filter(u => u.role === 'DOCTOR' && u.isApproved);

    const notifications = [
      {
        user: patients[0]._id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Sarah Johnson has been confirmed',
        priority: 'medium',
        isRead: true
      },
      {
        user: patients[1]._id,
        type: 'LAB_RESULT_READY',
        title: 'Lab Results Available',
        message: 'Your Lipid Panel results are now available',
        priority: 'high',
        isRead: false
      },
      {
        user: patients[2]._id,
        type: 'APPOINTMENT_REMINDER',
        title: 'Appointment Reminder',
        message: 'You have an appointment with Dr. Emily Rodriguez in 2 days',
        priority: 'high',
        isRead: false
      },
      {
        user: doctors[0]._id,
        type: 'APPOINTMENT_BOOKED',
        title: 'New Appointment',
        message: 'John Smith has booked an appointment with you',
        priority: 'medium',
        isRead: true
      },
      {
        user: doctors[1]._id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: 'Payment of $120 received for appointment',
        priority: 'low',
        isRead: false
      }
    ];

    const createdNotifications = await Notification.create(notifications);
    console.log(`✅ ${createdNotifications.length} notifications created`);
    return createdNotifications;
  } catch (error) {
    console.error('Error seeding notifications:', error);
    throw error;
  }
};

// Seed Consultations
const seedConsultations = async (appointments) => {
  try {
    const onlineAppointments = appointments.filter(a => a.type === 'online' && a.status === 'completed');

    const consultations = onlineAppointments.map((appointment, index) => ({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      roomId: `caresync-room-${Date.now()}-${index}`,
      roomPassword: Math.random().toString(36).substring(7),
      startTime: new Date(appointment.date.getTime() + 10 * 60 * 1000), // 10 mins after appointment time
      endTime: new Date(appointment.date.getTime() + 40 * 60 * 1000), // 30 mins duration
      duration: 30,
      status: 'completed',
      platform: 'jitsi',
      notes: 'Consultation completed successfully',
      feedback: [
        {
          user: appointment.patient,
          rating: 5,
          comment: 'Great consultation, very helpful',
          createdAt: new Date()
        }
      ]
    }));

    const createdConsultations = await Consultation.create(consultations);
    console.log(`✅ ${createdConsultations.length} consultations created`);
    return createdConsultations;
  } catch (error) {
    console.error('Error seeding consultations:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const appointments = await seedAppointments(users);
    const prescriptions = await seedPrescriptions(appointments, users);
    const labResults = await seedLabResults(appointments, users);
    const payments = await seedPayments(appointments);
    const notifications = await seedNotifications(users, appointments);
    const consultations = await seedConsultations(appointments);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   - Admin: 1`);
    console.log(`   - Doctors: ${users.filter(u => u.role === 'DOCTOR').length}`);
    console.log(`   - Patients: ${users.filter(u => u.role === 'PATIENT').length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Prescriptions: ${prescriptions.length}`);
    console.log(`   Lab Results: ${labResults.length}`);
    console.log(`   Payments: ${payments.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log(`   Consultations: ${consultations.length}`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@caresync.com / password123');
    console.log('   Doctor: sarah.johnson@caresync.com / password123');
    console.log('   Patient: john.smith@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();