import mongoose from "mongoose";
import { connectDB } from "../utils/db";
import Category from "../models/Category";
import Product from "../models/Product";
import fs from "fs";
import path from "path";
import { slugify } from "../utils/helpers";

/**
 * Mongoose Seeding Script
 * Reads products-ready-for-db.json and upserts into MongoDB using Mongoose models.
 */

const seedData = async () => {
  // Ensure we are using the correct connection details
  await connectDB();

  const inputFile = path.join(__dirname, "products-ready-for-db.json");

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ ${inputFile} not found. Run upload-products script first.`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  console.log(`📦 Seeding ${products.length} products with Mongoose models...`);

  // Step 1: Create/Update categories
  const categoryMap: Record<string, any> = {};
  const allCategoryNames = [
    ...new Set(products.map((p: any) => p.categoryName).filter(Boolean)),
  ] as string[];

  for (const name of allCategoryNames) {
    const slug = slugify(name);

    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug, description: "", image: "" },
      { upsert: true, new: true },
    );

    categoryMap[name] = category._id;
    console.log(`📂 Category: "${name}" (${slug}) → ${category._id}`);
  }

  // Step 2: Create/Update products
  const updatePromises = products.map(async (product: any) => {
    const categoryId = categoryMap[product.categoryName];

    const productDoc = {
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description || "",
      categoryId,
      images: product.images || [],
      condition: product.condition || "New",
      sku: product.sku,
    };

    return Product.findOneAndUpdate({ sku: product.sku }, productDoc, {
      upsert: true,
      new: true,
    });
  });

  const updatedProducts = await Promise.all(updatePromises);

  console.log(
    `✨ Seeding complete! Updated ${updatedProducts.length} products`,
  );
  console.log("Products count:", await Product.countDocuments());
  console.log("Categories count:", await Category.countDocuments());

  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
