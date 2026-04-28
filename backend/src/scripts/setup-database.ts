import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Customer from '../models/Customer';
import Category from '../models/Category';
import Product from '../models/Product';
import bcrypt from 'bcryptjs';

// Use environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to:', mongoose.connection.db.databaseName);
  
  // Create admin user if not exists
  const adminEmail = 'admin@hone.com';
  let adminUser = await User.findOne({ email: adminEmail });
  
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    adminUser = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✓ Admin user created');
  } else {
    console.log('✓ Admin user already exists');
  }
  
  // Create customer profile
  let customer = await Customer.findOne({ userId: adminUser._id });
  if (!customer) {
    await Customer.create({
      userId: adminUser._id,
      name: 'Admin',
      phone: '+251900000000',
      addresses: []
    });
    console.log('✓ Customer profile created');
  }
  
  // Seed categories
  const categories = [
    { name: 'Guitars', slug: 'guitars' },
    { name: 'Keyboards', slug: 'keyboards' },
    { name: 'Drums', slug: 'drums' },
    { name: 'Bass', slug: 'bass' },
    { name: 'Microphones', slug: 'microphones' },
    { name: 'Studio Equipment', slug: 'studio-equipment' },
    { name: 'Amplifiers', slug: 'amplifiers' },
    { name: 'Accessories', slug: 'accessories' }
  ];
  
  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { name: cat.name, slug: cat.slug, description: '', image: '' },
      { upsert: true, new: true }
    );
  }
  console.log('✓ Categories created');
  
  // Check products
  const productCount = await Product.countDocuments();
  console.log('✓ Products in DB:', productCount);
  
  // Summary
  const userCount = await User.countDocuments();
  const custCount = await Customer.countDocuments();
  const catCount = await Category.countDocuments();
  
  console.log('\n========== DATABASE SUMMARY ==========');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Users:', userCount);
  console.log('Customers:', custCount);
  console.log('Categories:', catCount);
  console.log('Products:', productCount);
  console.log('========================================');
  
  await mongoose.disconnect();
  console.log('\n✓ Setup complete!');
}

setupDatabase().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});