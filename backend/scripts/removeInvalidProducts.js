import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const productsToRemove = [
  'Green and Black Glasses',
  'Pacifica Touring',
  'Wooden Bathroom Sink With Mirror',
  '300 Touring',
  'Calvin Klein CK One',
  'Watch Gold for Women',
  'Rolex Datejust Women',
  'Calvin Klein Heel Shoes',
  'MotoGP CI.H1',
  'Prada Women Bag',
  'Women Handbag Black',
  'Dior J\'adore',
  'Lenovo Yoga 920',
  'Pampi Shoes',
  'Sports Sneakers Off White & Red'
];

const removeInvalidProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String
    }));

    const result = await Product.deleteMany({
      name: { $in: productsToRemove }
    });

    console.log(`Deleted ${result.deletedCount} products with invalid images`);
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeInvalidProducts();
