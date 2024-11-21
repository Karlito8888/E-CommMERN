import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const updateStockAndCurrency = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Mise à jour simple de tous les produits
    const result = await Product.updateMany(
      {}, // tous les produits
      { 
        $set: { 
          countInStock: 20, // valeur temporaire
        } 
      }
    );

    console.log(`\nPremière mise à jour terminée !`);
    console.log(`${result.modifiedCount} produits ont été mis à jour avec succès.`);

    // Maintenant, mettre à jour le stock avec des valeurs aléatoires un par un
    const products = await Product.find({});
    let randomUpdatedCount = 0;

    for (const product of products) {
      const randomStock = Math.floor(Math.random() * (35 - 5 + 1)) + 5;
      await Product.updateOne(
        { _id: product._id },
        { $set: { countInStock: randomStock } }
      );
      randomUpdatedCount++;
    }

    console.log(`\nMise à jour des stocks aléatoires terminée !`);
    console.log(`${randomUpdatedCount} produits ont reçu un stock aléatoire.`);

    // Vérification finale
    const checkProducts = await Product.find({ countInStock: null });
    console.log(`\nVérification finale : ${checkProducts.length} produits ont encore des champs manquants.`);

    if (checkProducts.length > 0) {
      console.log('\nExemples de produits avec des champs manquants :');
      for (let i = 0; i < Math.min(5, checkProducts.length); i++) {
        const p = checkProducts[i];
        console.log(`\nProduit: ${p.name}`);
        console.log('ID:', p._id);
        console.log('Stock:', p.countInStock);
      }
    }

    // Afficher quelques exemples de produits mis à jour
    const updatedProducts = await Product.find({}).limit(5);
    console.log('\nExemples de produits mis à jour :');
    for (const p of updatedProducts) {
      console.log(`\nProduit: ${p.name}`);
      console.log('ID:', p._id);
      console.log('Stock:', p.countInStock);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur :', error);
    mongoose.disconnect();
  }
};

updateStockAndCurrency();
