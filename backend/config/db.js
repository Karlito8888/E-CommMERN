// backend/config/db.js

import mongoose from "mongoose";
import logger from '../utils/logger.js';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    logger.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`Successfully connected to MongoDB: ${conn.connection.name} 👍`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
