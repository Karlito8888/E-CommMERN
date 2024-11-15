import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import PriceService from '../services/priceService.js';

dotenv.config();

const updateProductPrices = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupération de tous les produits
    const products = await Product.find({});
    console.log(`${products.length} produits trouvés`);

    // Mise à jour de chaque produit
    for (const product of products) {
      const { priceHT, taxAmount } = PriceService.extractTaxFromTTC(product.price);
      
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          priceHT: priceHT,
          taxAmount: taxAmount
        }
      });

      console.log(`Produit mis à jour: ${product.name}`);
      console.log(`  Prix TTC: ${PriceService.formatPrice(product.price)}`);
      console.log(`  Prix HT: ${PriceService.formatPrice(priceHT)}`);
      console.log(`  TVA: ${PriceService.formatPrice(taxAmount)}`);
      console.log('---');
    }

    console.log('Mise à jour terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
};

updateProductPrices();
