import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const removeDummyJsonProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      image: String
    }));

    const result = await Product.deleteMany({
      image: { $regex: 'dummyjson.com', $options: 'i' }
    });

    console.log(`Supprimé ${result.deletedCount} produits avec des images de dummyjson.com`);
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeDummyJsonProducts();
