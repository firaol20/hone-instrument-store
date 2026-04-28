import mongoose from 'mongoose';
import User from '../models/User';

// New MongoDB connection
const MONGODB_URI = 'mongodb+srv://minasehonestore_db_user:gLV5hk5B5TaAoZVJ@cluster0.wm6cj2j.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority';

async function makeAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: npm run make-admin <email>');
    process.exit(1);
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    console.log(`User not found: ${email}`);
    console.log('Make sure you have logged in first!');
    process.exit(1);
  }
  
  console.log(`Current role: ${user.role}`);
  
  user.role = 'admin';
  await user.save();
  
  console.log(`✓ SUCCESS! ${email} is now an ADMIN`);
  
  await mongoose.disconnect();
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});