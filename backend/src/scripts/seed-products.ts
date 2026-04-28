import mongoose from 'mongoose';
import Category from '../models/Category';
import Product from '../models/Product';
import fs from 'fs';
import path from 'path';
import { slugify } from '../utils/helpers';

// New MongoDB connection
const MONGODB_URI = 'mongodb+srv://minasehonestore_db_user:gLV5hk5B5TaAoZVJ@cluster0.wm6cj2j.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority';

async function seedProducts() {
  await mongoose.connect(MONGODB_URI);
  
  const inputFile = path.join(__dirname, 'products-ready-for-db.json');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ ${inputFile} not found`);
    process.exit(1);
  }
  
  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`📦 Seeding ${products.length} products...`);
  
  // Create categories from products
  const categoryMap: Record<string, any> = {};
  const allCategoryNames = [...new Set(products.map((p: any) => p.categoryName).filter(Boolean))] as string[];
  
  for (const name of allCategoryNames) {
    const slug = slugify(name);
    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug, description: '', image: '' },
      { upsert: true, new: true }
    );
    categoryMap[name] = category._id;
    console.log(`📂 Category: "${name}" → ${category._id}`);
  }
  
  // Create products
  for (const product of products) {
    const categoryId = categoryMap[product.categoryName];
    
    const productDoc = {
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description || '',
      categoryId,
      images: product.images || [],
      condition: product.condition || 'New',
      sku: product.sku,
    };
    
    await Product.findOneAndUpdate({ sku: product.sku }, productDoc, { upsert: true, new: true });
    console.log(`✓ Product: ${product.name}`);
  }
  
  console.log(`\n✅ Seed complete!`);
  console.log(`Products: ${await Product.countDocuments()}`);
  console.log(`Categories: ${await Category.countDocuments()}`);
  
  await mongoose.disconnect();
  process.exit(0);
}

seedProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});