const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Uses the MONGO_URI from your .env file.
 */
const connectDB = async () => {
  try {
    // 1. Attempt Connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure stable connection behavior in modern Mongoose
      autoIndex: true, 
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // 2. Handle Connection Errors
    console.error(`❌ Database Connection Error: ${err.message}`);

    // Bubble up so server.js can decide whether to exit.
    throw err;
  }
};

module.exports = connectDB;