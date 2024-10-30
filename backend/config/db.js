// backend/config/ds.js

import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Successfully connected to MongoDB: ${conn.connection.name} 👍`
    );
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

export default connectDB;
