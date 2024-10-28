import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined.");
    process.exit(1);
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(
      `Successfully connected to MongoDB: ${conn.connection.name} 👍`
    );
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    console.error(error.stack); // Affiche la pile d'erreur pour plus de détails
    process.exit(1);
  }
};

export default connectDB;
