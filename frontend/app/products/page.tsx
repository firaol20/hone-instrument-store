import ProductsClient from "@/components/ProductsClient";

async function getInitialData(searchParams: { category?: string, search?: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const category = searchParams?.category;
  const search = searchParams?.search;
  
  let productsUrl = `${apiUrl}/api/products?limit=50&sort=-createdAt`;
  if (search) {
    productsUrl = `${apiUrl}/api/products/search?q=${search}&limit=50`;
  } else if (category) {
    productsUrl += `&category=${category}`;
  }

  try {
    const [prodRes, catRes] = await Promise.all([
      fetch(productsUrl, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/categories`, { next: { revalidate: 60 } })
    ]);

    const productsData = prodRes.ok ? await prodRes.json() : { data: [] };
    const categoriesData = catRes.ok ? await catRes.json() : { data: [] };

    return {
      products: productsData.data || [],
      categories: categoriesData.data || []
    };
  } catch (error) {
    console.error("Failed to fetch initial products data:", error);
    return { products: [], categories: [] };
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string, search?: string }> }) {
  // Await the searchParams promise in Next.js 15+
  const params = await searchParams;
  const data = await getInitialData(params);
  
  return <ProductsClient initialProducts={data.products} initialCategories={data.categories} />;
}