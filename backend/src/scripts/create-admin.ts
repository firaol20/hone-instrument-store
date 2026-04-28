import mongoose from 'mongoose';
import User from '../models/User';
import Customer from '../models/Customer';
import bcrypt from 'bcryptjs';

// New MongoDB connection - with database name
const MONGODB_URI = 'mongodb+srv://minasehonestore_db_user:gLV5hk5B5TaAoZVJ@cluster0.wm6cj2j.mongodb.net/hone_store?appName=Cluster0&retryWrites=true&w=majority';

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  const email = process.argv[2] || 'admin@hone.com';
  const name = process.argv[3] || 'Admin';
  const password = process.argv[4] || 'admin123';
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin'
  });
  
  // Create customer profile
  await Customer.create({
    userId: user._id,
    name: name,
    phone: '+251900000000',
    addresses: []
  });
  
  console.log(`✓ Admin created: ${email} / ${password}`);
  console.log(`✓ User ID: ${user._id}`);
  console.log(`✓ Database: hone_store`);
  
  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});