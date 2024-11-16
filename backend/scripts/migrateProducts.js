// scripts/migrateProducts.js

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configuration
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('📦 Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Schéma temporaire pour lire les anciennes données
const OldProductSchema = new mongoose.Schema({}, { strict: false });
const OldProduct = mongoose.model('Product', OldProductSchema, 'products');

// Fonction principale
async function migrateProducts() {
  try {
    // 1. Backup des données existantes
    console.log('🔄 Sauvegarde des données existantes...');
    const products = await OldProduct.find({});
    const backup = {
      date: new Date(),
      products: products
    };

    const backupPath = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    fs.writeFileSync(
      path.join(backupPath, `products_backup_${Date.now()}.json`),
      JSON.stringify(backup, null, 2)
    );
    console.log('✅ Sauvegarde terminée');

    // 2. Migration des données
    console.log('🔄 Migration des produits...');
    for (const product of products) {
      // Conversion en objet simple
      const oldData = product.toObject();

      // Préparation des nouvelles données
      const newData = {
        name: oldData.name || 'Produit sans nom',
        price: oldData.price || 0,
        description: oldData.description || 'Aucune description',
        image: oldData.image || '/uploads/default.webp',
        thumbnail: oldData.thumbnail || '/uploads/thumbnails/default.webp',
        brand: oldData.brand || 'Marque non spécifiée',
        category: oldData.category || null,
        quantity: 0, // Nouveau champ
        stock: oldData.countInStock || 0, // Migration du stock
        priceHT: +(oldData.price / 1.2 || 0).toFixed(2),
        taxAmount: +((oldData.price || 0) - (oldData.price / 1.2 || 0)).toFixed(2),
        currency: oldData.currency || 'EUR',
        stripeProductId: oldData.stripeProductId || `temp_${Date.now()}_${oldData._id}`
      };

      // Mise à jour du document
      await OldProduct.updateOne(
        { _id: oldData._id },
        { $set: newData },
        { upsert: true }
      );
    }

    console.log('✅ Migration terminée avec succès!');
    console.log(`📊 ${products.length} produits migrés`);

  } catch (error) {
    console.error('❌ Erreur pendant la migration:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Exécution
migrateProducts()
  .then(() => {
    console.log('🎉 Migration terminée!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
