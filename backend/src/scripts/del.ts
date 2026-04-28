import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables correctly
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { connectDB } from '../utils/db';
import Product from '../models/Product';

async function deleteDuplicate() {
  try {
    await connectDB();
    const result = await Product.deleteOne({ _id: '69d9eac9c528ffd3aacf1806' });
    console.log('Successfully deleted the duplicate Scarlet product. Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

deleteDuplicate();
