require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@caresync.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1234567890'
    });

    const doctors = await User.insertMany([
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        specialization: 'Cardiology',
        phone: '+1234567891'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        specialization: 'Pediatrics',
        phone: '+1234567892'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        specialization: 'Neurology',
        phone: '+1234567893'
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@caresync.com',
        password: hashedPassword,
        role: 'DOCTOR',
        specialization: 'General Medicine',
        phone: '+1234567894'
      }
    ]);

    const patients = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567895'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567896'
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        password: hashedPassword,
        role: 'PATIENT',
        phone: '+1234567897'
      }
    ]);

    // Create sample appointments
    console.log('📅 Creating sample appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Appointment.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: today,
        time: '09:00',
        reason: 'Regular checkup',
        type: 'in-person',
        status: 'confirmed'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        date: today,
        time: '10:00',
        reason: 'Follow-up consultation',
        type: 'tele-consultation',
        status: 'pending'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        date: tomorrow,
        time: '14:00',
        reason: 'Initial consultation',
        type: 'in-person',
        status: 'pending'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@caresync.com');
    console.log('  Password: password123');
    console.log('\nDoctors:');
    doctors.forEach(doc => {
      console.log(`  ${doc.name} (${doc.specialization})`);
      console.log(`    Email: ${doc.email}`);
      console.log(`    Password: password123`);
    });
    console.log('\nPatients:');
    patients.forEach(patient => {
      console.log(`  ${patient.name}`);
      console.log(`    Email: ${patient.email}`);
      console.log(`    Password: password123`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
