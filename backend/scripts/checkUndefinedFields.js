import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

const checkUndefinedFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    const totalProducts = products.length;
    const stats = {
      name: 0,
      price: 0,
      description: 0,
      image: 0,
      brand: 0,
      category: 0,
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      currency: 0
    };

    products.forEach(product => {
      if (!product.name) stats.name++;
      if (!product.price) stats.price++;
      if (!product.description) stats.description++;
      if (!product.image) stats.image++;
      if (!product.brand) stats.brand++;
      if (!product.category) stats.category++;
      if (product.countInStock === undefined || product.countInStock === null) stats.countInStock++;
      if (!product.rating) stats.rating++;
      if (!product.numReviews) stats.numReviews++;
      if (!product.currency) stats.currency++;
    });

    console.log('\nAnalyse des champs manquants :');
    console.log('Total des produits :', totalProducts);
    console.log('\nNombre de produits avec champs manquants :');
    for (const [field, count] of Object.entries(stats)) {
      const percentage = ((count / totalProducts) * 100).toFixed(2);
      console.log(`${field}: ${count} (${percentage}%)`);
    }

    // Afficher quelques exemples de produits avec des champs manquants
    console.log('\nExemples de produits avec des champs manquants :');
    const productsWithMissing = products.filter(p => 
      !p.name || !p.price || !p.description || !p.image || 
      !p.brand || !p.category || p.countInStock === undefined || p.countInStock === null || !p.rating || 
      !p.numReviews || !p.currency
    ).slice(0, 5);

    productsWithMissing.forEach(p => {
      console.log(`\nProduit: ${p.name || 'Nom manquant'}`);
      console.log('Champs manquants :');
      if (!p.name) console.log('- name');
      if (!p.price) console.log('- price');
      if (!p.description) console.log('- description');
      if (!p.image) console.log('- image');
      if (!p.brand) console.log('- brand');
      if (!p.category) console.log('- category');
      if (p.countInStock === undefined || p.countInStock === null) console.log('- countInStock');
      if (!p.rating) console.log('- rating');
      if (!p.numReviews) console.log('- numReviews');
      if (!p.currency) console.log('- currency');
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur :', error);
    mongoose.disconnect();
  }
};

checkUndefinedFields();
