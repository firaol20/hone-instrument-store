'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Edit2, Trash2, Calendar, AlertCircle, CheckCircle2,
  Clock, Sparkles, ImageIcon, LayoutGrid, List,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromotionsListPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getPromotions();
      if (response.data?.success) setPromotions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      toast.error('Could not load promotions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Delete this special offer?')) return;
    try {
      await adminAPI.deletePromotion(id);
      toast.success('Special offer deleted');
      setPromotions(prev => prev.filter(p => p._id !== id));
    } catch {
      toast.error('Failed to delete special offer');
    }
  };

  const getStatusInfo = (p: any) => {
    const isExpired = new Date(p.expiryDate) < new Date();
    if (isExpired) return { label: 'Expired', icon: <Clock size={9} />, cls: 'bg-slate-800/80 text-slate-300' };
    if (p.status === 'active') return { label: 'Active', icon: <CheckCircle2 size={9} />, cls: 'bg-emerald-500/20 text-emerald-400' };
    return { label: 'Inactive', icon: <AlertCircle size={9} />, cls: 'bg-orange-500/20 text-orange-400' };
  };

  const typeColors: Record<string, string> = {
    banner: 'bg-blue-100 text-blue-700',
    holiday: 'bg-purple-100 text-purple-700',
    'price-drop': 'bg-red-100 text-red-700',
    'special offer': 'bg-emerald-100 text-emerald-700',
  };

  // ─── Skeleton ────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-2 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Grid Card ───────────────────────────────────────────────
  const GridCard = ({ promo, idx }: { promo: any; idx: number }) => {
    const status = getStatusInfo(promo);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: idx * 0.06 }}
        key={promo._id}
        className="group relative bg-white rounded-2xl lg:rounded-3xl border border-slate-100 overflow-hidden flex flex-col hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60 transition-all duration-300"
      >
        {/* Thumbnail */}
        <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/8 transition-colors duration-400 z-10" />

          {promo.bannerImage ? (
            <img
              src={promo.bannerImage}
              alt={promo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-800 font-black uppercase text-sm group-hover:scale-105 transition-transform duration-500">
              HONE<span className="text-orange-500/60">.</span>
            </div>
          )}

          {/* Status pill on image */}
          <div className="absolute bottom-2 left-2 z-20">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border border-white/10 ${status.cls}`}>
              {status.icon}{status.label}
            </span>
          </div>

          {/* Type pill */}
          <div className="absolute top-2 right-2 z-20">
            <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${typeColors[promo.type] || 'bg-white/20 text-white'}`}>
              {promo.type || 'Banner'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex-1 flex flex-col gap-1">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
            {promo.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium line-clamp-1 flex-1">
            {promo.description || 'No description'}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-1 text-orange-500">
              <Calendar className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {new Date(promo.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={`/admin/promotions/form?id=${promo._id}`}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-orange-600 hover:text-white transition-all active:scale-90 border border-slate-100"
              >
                <Edit2 className="w-3 h-3" />
              </Link>
              <button
                onClick={(e) => handleDelete(promo._id, e)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── List Row (mobile-first, no hidden columns) ───────────────
  const ListRow = ({ promo }: { promo: any }) => {
    const status = getStatusInfo(promo);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        key={promo._id}
        className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-orange-50/40 border border-transparent hover:border-orange-100 transition-all duration-200 active:scale-[0.99]"
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
          {promo.bannerImage ? (
            <img src={promo.bannerImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-slate-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate group-hover:text-orange-600 transition-colors">{promo.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${status.cls}`}>
              {status.icon}{status.label}
            </span>
            <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${typeColors[promo.type] || 'bg-slate-100 text-slate-600'}`}>
              {promo.type || 'Banner'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-orange-400" />
            Expires {new Date(promo.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            href={`/admin/promotions/form?id=${promo._id}`}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-600 hover:text-white transition-all active:scale-90 border border-slate-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={(e) => handleDelete(promo._id, e)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5 lg:space-y-8 relative">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] bg-orange-100/20 rounded-full blur-[120px] -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] lg:w-[400px] lg:h-[400px] bg-slate-100 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-950 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 overflow-hidden shadow-2xl shadow-slate-950/20 border border-white/5"
      >
        <div className="absolute top-0 right-0 w-[200px] h-[200px] lg:w-[400px] lg:h-[400px] bg-orange-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/25 rotate-3">
                <Sparkles className="text-white h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter">
                Special Offers<span className="text-orange-600">.</span>
              </h1>
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
              Drive sales with high-impact promotions
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* View toggle */}
            <div className="flex bg-slate-800 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>

            <Link
              href="/admin/promotions/form"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-2.5 sm:py-3 bg-orange-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-600/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Offer</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats strip ── */}
      {!isLoading && promotions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Total', value: promotions.length, color: 'text-slate-900' },
            { label: 'Active', value: promotions.filter(p => p.status === 'active' && new Date(p.expiryDate) >= new Date()).length, color: 'text-emerald-600' },
            { label: 'Expired', value: promotions.filter(p => new Date(p.expiryDate) < new Date()).length, color: 'text-slate-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-center shadow-sm">
              <p className={`text-xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <Skeleton />
      ) : promotions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 py-20 px-8 text-center shadow-xl shadow-slate-100/60"
        >
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-orange-600 rotate-3 shadow-inner">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Special Offers Yet</h3>
          <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto leading-relaxed">
            Create your first banner to drive traffic and boost sales.
          </p>
          <Link
            href="/admin/promotions/form"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <Plus size={14} />
            Create Special Offer
          </Link>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View: 2 cols mobile, 3 md, 4 lg ── */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <AnimatePresence>
            {promotions.map((promo, idx) => (
              <GridCard key={promo._id} promo={promo} idx={idx} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── List View: Mobile-first, no hidden columns ── */
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/40">
          {/* List header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {promotions.length} Special Offer{promotions.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50 p-2">
            <AnimatePresence>
              {promotions.map(promo => (
                <ListRow key={promo._id} promo={promo} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}