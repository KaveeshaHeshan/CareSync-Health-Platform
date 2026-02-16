const mongoose = require('mongoose');

const connectDB = async () => {
  const exitOnFail = (process.env.DB_EXIT_ON_FAIL || '').toLowerCase() === 'true'
    ? true
    : (process.env.DB_EXIT_ON_FAIL || '').toLowerCase() === 'false'
      ? false
      : (process.env.NODE_ENV || 'development') === 'production';

  const localFallbackUri = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/caresync';
  const mongooseOptions = {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
  };

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const shouldTryFallback = !exitOnFail && !!localFallbackUri && localFallbackUri !== process.env.MONGODB_URI;

    if (shouldTryFallback) {
      try {
        console.warn(`⚠️ MongoDB connect failed (${error.message}). Trying fallback URI...`);
        const fallbackConn = await mongoose.connect(localFallbackUri, mongooseOptions);
        console.log(`✅ MongoDB Connected (fallback): ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ MongoDB fallback connect failed: ${fallbackError.message}`);
      }
    }

    console.error(`❌ MongoDB connect failed: ${error.message}`);
    if (exitOnFail) process.exit(1);
    console.warn('⚠️ Continuing without MongoDB connection (development mode). Set DB_EXIT_ON_FAIL=true to force exit.');
  }
};

module.exports = connectDB;
