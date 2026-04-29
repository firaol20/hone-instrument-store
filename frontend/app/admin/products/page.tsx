'use client';

import React, { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle, Package, Loader2 } from 'lucide-react';
import { adminAPI, categoriesAPI, uploadAPI } from '@/lib/api';
import { AdminProduct } from '@/lib/admin-types';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '',
    categoryId: '', 
    price: '', 
    description: '',
    sku: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { 
        page, 
        limit: 10
      };
      
      // Add category filter if selected
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const res = await adminAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load catalogue.');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Handle auto-slug creation
  useEffect(() => {
    if (!editingProduct && formData.name) {
      setFormData(prev => ({ 
        ...prev, 
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
      }));
    }
  }, [formData.name, editingProduct]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setSelectedFile(null);
    setFormData({ name: '', slug: '', categoryId: categories[0]?._id || '', price: '', description: '', sku: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setImagePreview(product.images?.[0] || null);
    setSelectedFile(null);
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId?._id || '',
      price: product.price.toString(),
      description: product.description || '',
      sku: product.sku || '',
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this instrument? This action is permanent.')) {
      try {
        await adminAPI.deleteProduct(id);
        toast.success(`Product deleted successfully`);
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls = editingProduct?.images || [];

      // 1. Handle image upload if new file selected
      if (selectedFile) {
        const uploadRes = await uploadAPI.uploadFile(selectedFile, 'products');
        if (uploadRes.data.success) {
          imageUrls = [uploadRes.data.url];
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        images: imageUrls
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, payload);
        toast.success(`${formData.name} updated successfully`);
      } else {
        await adminAPI.createProduct(payload);
        toast.success(`${formData.name} added to catalogue`);
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchProducts} /></div>;

  return (
    <div className="relative p-2 sm:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 sm:p-4 rounded-[1rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="flex-1 md:flex-none flex items-center gap-4">
          <div className="relative w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button onClick={handleOpenAdd} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8"><TableSkeleton rows={8} cols={4} /></div>
        ) : products.length === 0 ? (
          <div className="p-12">
           <EmptyState 
             icon={Package} 
             title="No products found" 
             description={selectedCategory ? "No products found in this category." : "Your catalogue is empty. Click 'Add Product' to get started."}
             actionLabel={selectedCategory ? "Show All" : "Add Product"}
             onAction={selectedCategory ? () => setSelectedCategory(null) : handleOpenAdd}
           />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left">Instrument</th>
                    <th className="px-3 sm:px-6 py-4 text-left">Category</th>
                    <th className="px-3 sm:px-6 py-4 text-left">Price</th>
                    <th className="px-3 sm:px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-3 sm:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 flex-shrink-0 overflow-hidden border border-slate-50">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono italic">{product.sku || 'NO-SKU'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                          {product.categoryId?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3">
                        <div className="font-black text-slate-900">${product.price.toLocaleString()}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{(page-1)*10 + 1} to {Math.min(page*10, totalItems)}</span> of {totalItems} Instruments
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  disabled={page === 1}
                  className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${page === i + 1
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-200'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page-3), Math.min(totalPages, page+2))}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={page === totalPages}
                  className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal - Add/Edit Form */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl bg-white z-50 shadow-2xl rounded-[2.5rem] border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-8 pb-4 border-b border-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase italic">
                  {editingProduct ? 'Update' : 'New'} <span className="text-orange-600">Instrument.</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Catalogue Management System</p>
              </div>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {/* Image Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Product Visual</label>
                <div
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className="group relative h-48 w-full rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all overflow-hidden"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={24} />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Replace Highlight</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-3xl text-slate-400 border border-slate-100 shadow-sm">
                        <Upload size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-widest">Drop Product Photography</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Name</label>
                  <input required placeholder="Gibson Les Paul..." type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Slug</label>
                  <input required placeholder="gibson-les-paul" type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[10px] font-mono font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Price ($)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none">
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">SKU Identifier</label>
                  <input placeholder="HN-LTD-001" type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[10px] font-mono font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none resize-none" placeholder="Enter instrument technical details and story..." />
              </div>
            </form>

            <div className="p-8 pt-4 border-t border-slate-50 bg-white">
              <button 
                type="submit" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-950 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-orange-600 disabled:bg-slate-400 disabled:shadow-none transition-all text-xs flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing Catalogue...
                  </>
                ) : (
                  editingProduct ? 'Propagate Updates' : 'Publish to Catalogue'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}