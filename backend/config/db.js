/**
 * Database connection setup supporting MongoDB / Mongoose with in-memory fallback.
 */

const mongoose = require('mongoose');

// In-memory data store for fallback mode when MongoDB server is offline
const memoryDb = {
  scans: [],
  vulnerabilities: [],
  rules: []
};

let isConnected = false;

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jocky_code_detective';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${connString}`);
  } catch (err) {
    isConnected = false;
    console.log('[MongoDB] Local MongoDB server not detected. Running with In-Memory Database Fallback.');
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected, memoryDb };
