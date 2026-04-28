import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { normalizePrice, makeProductSlug } from '../utils/helpers';

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const requiredEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Error: Missing Cloudinary credentials in .env: ${missingEnv.join(', ')}`);
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadImage(imagePath: string, categoryName: string) {
  return await cloudinary.uploader.upload(imagePath, {
    folder: `hone_store/${categoryName}`,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    transformation: [
      { width: 1200, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' }
    ]
  });
}

const uploadProducts = async () => {
  const inputFile = path.join(__dirname, 'products-to-upload.json');
  const outputFile = path.join(__dirname, 'products-ready-for-db.json');
  const imageDir = path.join(__dirname, '../../../product-images');

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: ${inputFile} not found. Run generate-registry first.`);
    return;
  }

  const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  const finalProducts = [];

  console.log(`🚀 Starting Bulk Upload to Cloudinary for ${products.length} product(s)...\n`);

  for (const product of products) {
    try {
      const price = normalizePrice(product.price);
      const imageUrls: string[] = [];

      const localImages = Array.isArray(product.localImage)
        ? product.localImage
        : [product.localImage];

      for (const imgRelPath of localImages) {
        const imagePath = path.join(imageDir, imgRelPath);

        if (!fs.existsSync(imagePath)) {
          console.warn(`  ⚠️  Image not found: ${imagePath}. Skipping.`);
          continue;
        }

        const result = await uploadImage(imagePath, product.category || 'Uncategorized');
        imageUrls.push(result.secure_url);
        console.log(`  ✅ Uploaded: ${imgRelPath}`);
      }

      finalProducts.push({
        name: product.model,
        slug: makeProductSlug(product.model, product.sku),
        price,
        description: product.description || '',
        categoryName: product.category,
        condition: product.condition || 'New',
        images: imageUrls,
        sku: product.sku || `SKU-${Date.now()}`
      });

      console.log(`✔️  Done: ${product.model} (${imageUrls.length} image(s))\n`);

    } catch (error: any) {
      console.error(`❌ Failed: ${product.model} — ${error.message}\n`);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(finalProducts, null, 2));
  console.log(`\n✨ Done! ${finalProducts.length} products processed.`);
  console.log(`📂 Ready for DB: ${outputFile}`);
};

uploadProducts().catch(console.error);
