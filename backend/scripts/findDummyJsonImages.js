import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const findDummyJsonImages = async () => {
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

    const dummyJsonProducts = await Product.find({
      image: { $regex: 'dummyjson.com', $options: 'i' }
    });

    if (dummyJsonProducts.length > 0) {
      console.log('\nProduits utilisant des images de dummyjson.com :');
      dummyJsonProducts.forEach(product => {
        console.log(`- ${product.name}`);
        console.log(`  Image: ${product.image}\n`);
      });
      console.log(`Total : ${dummyJsonProducts.length} produits`);
    } else {
      console.log('Aucun produit n\'utilise d\'images de dummyjson.com');
    }
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

findDummyJsonImages();
