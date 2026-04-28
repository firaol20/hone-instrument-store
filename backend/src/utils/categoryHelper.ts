import Category from '../models/Category';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getOrCreateCategory(categoryName: string): Promise<any> {
  const slug = slugify(categoryName);

  let category = await Category.findOne({ slug });

  if (!category) {
    category = await Category.create({
      name: categoryName,
      slug,
      description: '',
      image: '',
    });
  }

  return category;
}

export async function getCategoryByName(categoryName: string): Promise<any> {
  const slug = slugify(categoryName);
  return await Category.findOne({ slug });
}