import HomeClient from "@/components/HomeClient";

async function getInitialProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Use next: { revalidate: 60 } to cache the products for 60 seconds
    const res = await fetch(`${apiUrl}/api/products?limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    // Shuffle directly here like it did on the client
    const allProducts = data.data || [];
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
    return [];
  }
}

export default async function Home() {
  const initialProducts = await getInitialProducts();
  
  return <HomeClient initialProducts={initialProducts} />;
}