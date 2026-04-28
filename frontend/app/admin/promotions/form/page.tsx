'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, Save, Loader2, Calendar, Layout, Type,
  AlignLeft, ImageIcon, Upload, X, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { adminAPI, uploadAPI } from '@/lib/api';
import { toast } from 'sonner';

// ─── Input / Textarea wrappers for consistent styling ───────────
const FieldLabel = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-slate-400">{icon}</span>
    <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.18em]">{children}</label>
  </div>
);

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all';

// ─── Main Form Component ─────────────────────────────────────────
function PromotionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [isLoading, setIsLoading]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [uploadingImage, setUploading] = useState(false);
  const [bannerImage, setBannerImage]  = useState('');
  const [showPreview, setShowPreview]  = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner',
    expiryDate: '',
    status: 'inactive',
  });

  const patch = (key: string, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  // Load existing promotion
  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const res = await adminAPI.getPromotions();
        if (res.data?.success) {
          const promo = res.data.data.find((p: any) => p._id === id);
          if (promo) {
            setFormData({
              title: promo.title,
              description: promo.description || '',
              type: promo.type || 'banner',
              expiryDate: promo.expiryDate
                ? new Date(promo.expiryDate).toISOString().split('T')[0]
                : '',
              status: promo.status || 'inactive',
            });
            setBannerImage(promo.bannerImage || '');
          }
        }
      } catch {
        toast.error('Failed to load promotion');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadFile(file, 'promotions');
      if (res.data?.data?.url) {
        setBannerImage(res.data.data.url);
        toast.success('Image uploaded');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => { setBannerImage(''); toast.success('Image removed'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, bannerImage: bannerImage || undefined };
      if (id) {
        await adminAPI.updatePromotion(id, payload);
        toast.success('Promotion updated');
      } else {
        await adminAPI.createPromotion(payload);
        toast.success('Campaign launched!');
      }
      router.push('/admin/promotions');
    } catch {
      toast.error('Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-orange-600" size={28} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Loading campaign...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      {/* Subtle decorators */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-100/20 rounded-full blur-[80px] -z-10 -translate-y-1/4 translate-x-1/4 pointer-events-none" />

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link
          href="/admin/promotions"
          className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles className="text-orange-500 w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Marketing Hub</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            {id ? 'Edit' : 'New'} <span className="text-orange-600">Campaign.</span>
          </h1>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Top row: title + type (2-col on sm+) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <FieldLabel icon={<Type className="w-3.5 h-3.5" />}>Campaign Title</FieldLabel>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => patch('title', e.target.value)}
              className={inputCls}
              placeholder="e.g., Summer Festival 2026"
            />
          </div>

          {/* Type */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <FieldLabel icon={<Layout className="w-3.5 h-3.5" />}>Campaign Type</FieldLabel>
            <select
              value={formData.type}
              onChange={e => patch('type', e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer font-bold`}
            >
              <option value="banner">Standard Banner</option>
              <option value="holiday">Holiday Sale</option>
              <option value="price-drop">Flash Sale / Price Drop</option>
              <option value="special offer">Special Limited Offer</option>
            </select>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <FieldLabel icon={<AlignLeft className="w-3.5 h-3.5" />}>Description</FieldLabel>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => patch('description', e.target.value)}
            className={`${inputCls} resize-none leading-relaxed`}
            placeholder="Short, punchy description for the banner..."
          />
        </div>

        {/* ── Banner Image ── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel icon={<ImageIcon className="w-3.5 h-3.5 text-orange-500" />}>
              Banner Creative
            </FieldLabel>
            {bannerImage && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-colors"
                >
                  {showPreview ? <EyeOff size={11} /> : <Eye size={11} />}
                  {showPreview ? 'Collapse' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={11} /> Remove
                </button>
              </div>
            )}
          </div>

          {bannerImage ? (
            <div
              className={`relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800 transition-all duration-500 ${
                showPreview ? 'aspect-[21/9]' : 'h-24 sm:h-32'
              }`}
            >
              <img
                src={bannerImage}
                alt="Banner"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  showPreview ? '' : 'scale-110 blur-sm opacity-50'
                }`}
              />
              {!showPreview && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all"
                  >
                    Inspect Creative
                  </button>
                </div>
              )}
            </div>
          ) : (
            <label className="group flex flex-col items-center justify-center w-full aspect-[21/9] border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50/30 transition-all duration-300">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-orange-600 w-7 h-7" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Uploading...</span>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white group-hover:rotate-6 transition-all duration-400 mb-3 shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Upload Banner Image</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG or JPG · Recommended 1200×600px</span>
                </>
              )}
            </label>
          )}
        </div>

        {/* ── Bottom row: end date + status + submit ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* End date */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <FieldLabel icon={<Calendar className="w-3.5 h-3.5" />}>End Date</FieldLabel>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={e => patch('expiryDate', e.target.value)}
              className={`${inputCls} font-bold`}
            />
          </div>

          {/* Status */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <FieldLabel icon={<span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">◎</span>}>
              Visibility
            </FieldLabel>
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patch('status', s)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    formData.status === s
                      ? s === 'active'
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                        : 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center font-medium">
              {formData.status === 'inactive' ? 'Will not show on storefront' : 'Visible to all visitors'}
            </p>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSaving}
          className="group relative w-full h-14 sm:h-16 bg-slate-950 text-white rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
        >
          <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
          <div className="relative z-10 flex items-center justify-center gap-2.5">
            {isSaving
              ? <Loader2 className="animate-spin w-5 h-5" />
              : <Save className="w-5 h-5 group-hover:rotate-[-6deg] transition-transform duration-300" />
            }
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">
              {isSaving ? 'Saving...' : id ? 'Commit Changes' : 'Launch Campaign'}
            </span>
          </div>
        </button>
      </form>
    </div>
  );
}

// ─── Suspense wrapper ────────────────────────────────────────────
export default function PromotionFormPage() {
  return (
    <Suspense fallback={
      <div className="h-72 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-orange-600" size={28} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading...</span>
      </div>
    }>
      <PromotionForm />
    </Suspense>
  );
}