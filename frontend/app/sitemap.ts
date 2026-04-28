import { MetadataRoute } from 'next';
import { productsAPI, categoriesAPI } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://honestore.com';
  
  // Static routes
  const routes = [
    '',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/products' ? 1.0 : 0.8,
  }));

  try {
    // Get all products
    const productsResponse = await productsAPI.getAll({ limit: 1000 });
    const products = productsResponse.data?.data || productsResponse.data || [];
    
    // Add product routes
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt || product.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // Get all categories
    const categoriesResponse = await categoriesAPI.getAll();
    const categories = categoriesResponse.data?.data || categoriesResponse.data || [];
    
    // Add category routes
    const categoryRoutes = categories.map((category: any) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updatedAt || category.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...routes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error fetching data for sitemap:', error);
    return routes;
  }
}