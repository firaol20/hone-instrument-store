"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { useCartStore } from '@/lib/cart-store';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function ProductsContent({ initialProducts, initialCategories }: { initialProducts: any[], initialCategories: any[] }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const { addItem } = useCartStore();
  const isFirstRender = useRef(true);

  // Always re-fetch categories fresh on mount so newly added ones (via Telegram) appear immediately
  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => {
        const fresh = res.data?.data || res.data || [];
        if (fresh.length > 0) setCategories(fresh);
      })
      .catch(err => console.error('Failed to refresh categories:', err));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (searchQuery) {
        const searchResponse = await productsAPI.search(searchQuery);
        setProducts(searchResponse.data?.data || searchResponse.data || []);
      } else {
        const params: any = {
          limit: 50,
          sort: sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? '-price' : '-createdAt',
        };
        if (selectedCategory) params.category = selectedCategory;
        const response = await productsAPI.getAll(params);
        setProducts(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Could not reach the server. Please check if the backend is running.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => { 
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadProducts(); 
  }, [loadProducts]);

  const handleReset = () => {
    setSelectedCategory(null);
    setPriceRange([0, 5000000]);
    setSearchQuery('');
    setSortBy('newest');
  };

  const productPrices = products.map(p => p.price).filter(p => p > 0);
  const dynamicMin = productPrices.length > 0 ? Math.min(...productPrices) : 0;
  const dynamicMax = productPrices.length > 0 ? Math.max(...productPrices) : 5000000;

  const filteredProducts = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 py-6 md:px-6">
          <div className="mb-6 px-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Products<span className="text-orange-600">.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {loading ? '...' : filteredProducts.length} Items Available
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
            <aside className="lg:col-span-3">
              <FilterSidebar
                categories={categories}
                minPrice={dynamicMin}
                maxPrice={dynamicMax}
                onCategoryChange={(slug) => setSelectedCategory(selectedCategory === slug ? null : slug)}
                onPriceChange={(min, max) => setPriceRange([min, max])}
                onReset={handleReset}
              />
            </aside>

            <section className="lg:col-span-9">
              <div className="flex justify-between items-center mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter ml-1">
                  {loading ? 'Fetching...' : `Results (${filteredProducts.length})`}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold uppercase outline-none focus:border-orange-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="w-full h-32 md:h-48 rounded-xl" />
                      <Skeleton className="w-3/4 h-3 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  <h2 className="text-xs font-black text-slate-900 uppercase">No results</h2>
                  <Button onClick={handleReset} className="mt-3 h-7 text-[9px] bg-slate-900 px-4 uppercase rounded-md">Reset</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="w-full">
                      <ProductCard
                        id={product._id}
                        name={product.name}
                        slug={product.slug}
                        price={product.price}
                        image={product.images?.[0] || '/placeholder.jpg'}
                        category={product.categoryId?.name || 'Instrument'}
                        rating={product.rating}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
            &copy; {new Date().getFullYear()} Hone Instruments Store
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsClient({ initialProducts, initialCategories }: { initialProducts: any[], initialCategories: any[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Catalog...</p>
        </div>
      </div>
    }>
      <ProductsContent initialProducts={initialProducts} initialCategories={initialCategories} />
    </Suspense>
  );
}
