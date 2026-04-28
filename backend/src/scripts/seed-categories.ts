import mongoose from 'mongoose';
import Category from '../models/Category';

// New MongoDB connection
const MONGODB_URI = 'mongodb+srv://minasehonestore_db_user:gLV5hk5B5TaAoZVJ@cluster0.wm6cj2j.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority';

const categories = [
  { name: 'Guitars', description: 'Acoustic and electric guitars' },
  { name: 'Keyboards', description: 'Digital and piano keyboards' },
  { name: 'Drums', description: 'Drum kits and percussion' },
  { name: 'Bass', description: 'Electric and acoustic bass guitars' },
  { name: 'Microphones', description: 'Professional microphones' },
  { name: 'Studio Equipment', description: 'Recording studio equipment' },
  { name: 'Amplifiers', description: 'Guitar and bass amplifiers' },
  { name: 'Accessories', description: 'Musical accessories' }
];

async function seedCategories() {
  await mongoose.connect(MONGODB_URI);
  
  for (const cat of categories) {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
    await Category.findOneAndUpdate(
      { slug },
      { name: cat.name, slug, description: cat.description, image: '' },
      { upsert: true, new: true }
    );
    console.log(`✓ Category: ${cat.name}`);
  }
  
  console.log(`\n✓ Created ${categories.length} categories`);
  
  await mongoose.disconnect();
  process.exit(0);
}

seedCategories().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});