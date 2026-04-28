import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Registry Generator (TypeScript version)
 * Scans the product-images folder recursively and creates a mapping for upload.
 */

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const IMAGE_DIR = path.join(__dirname, '../../../product-images');
const OUTPUT_FILE = path.join(__dirname, 'products-to-upload.json');

async function generateRegistry() {
  console.log('🔍 Scanning images recursively in:', IMAGE_DIR);

  if (!fs.existsSync(IMAGE_DIR)) {
    console.error(`❌ Error: product-images folder not found at ${IMAGE_DIR}!`);
    process.exit(1);
  }

  // Get all files recursively
  const allFiles = fs.readdirSync(IMAGE_DIR, { recursive: true }) as string[];
  
  // Filter only images and ensure they are files
  const imageFiles = allFiles.filter(item => {
    const fullPath = path.join(IMAGE_DIR, item);
    return fs.statSync(fullPath).isFile() && 
           ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(item).toLowerCase());
  });

  console.log(`📦 Found ${imageFiles.length} total image files.`);

  // Group files by category and base identity
  const productGroups: Record<string, { main: string | null; thumb: string | null; category: string }> = {};

  imageFiles.forEach(file => {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    const dirname = path.dirname(file); 
    
    // Normalize path separators to forward slash
    let category = dirname === '.' ? 'Uncategorized' : dirname.replace(/\\/g, '/');

    // Check if it's a thumbnail
    const isThumb = basename.toLowerCase().endsWith('_thumb');
    const identity = isThumb ? basename.slice(0, -6) : basename;

    // Use a unique key per category + identity
    const groupKey = `${category}---${identity}`;

    if (!productGroups[groupKey]) {
      productGroups[groupKey] = {
        main: null,
        thumb: null,
        category: category
      };
    }

    // Path needs to be stored with forward slashes
    const relativePath = file.replace(/\\/g, '/');

    if (isThumb) {
      productGroups[groupKey].thumb = relativePath;
    } else {
      productGroups[groupKey].main = relativePath;
    }
  });

  const registry = Object.keys(productGroups).map((groupKey, index) => {
    const group = productGroups[groupKey];
    // Prefer main, but fallback to thumb if it's the only one
    const localImage = group.main || group.thumb;
    
    // Category Name is the last folder in the path (or 'Uncategorized')
    const categoryName = group.category !== 'Uncategorized' ? group.category.split('/').pop() || 'Uncategorized' : 'Uncategorized';

    return {
      model: categoryName,
      condition: "New",
      price: "🤙 Birr",
      category: categoryName,
      localImage: localImage,
      description: "", 
      sku: `PROD-${1000 + index}`
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));

  console.log(`✅ Success! Generated ${registry.length} product entries.`);
  console.log(`📂 Registry saved to: ${OUTPUT_FILE}`);
}

generateRegistry().catch(console.error);
