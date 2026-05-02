'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import NotificationBell from '@/components/admin/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, isAuthenticated, isLoading, checkAuth, clearAuth, isAdmin } = useAuthStore();

  // 1. Initial Auth Check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Redirect if not authorized or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error('Session expired. Please login again.');
        router.push('/login?redirect=' + pathname);
      } else if (!isAdmin()) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      clearAuth();
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, href: '/admin/overview' },
    { name: 'Products', icon: <Box size={20} />, href: '/admin/products' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, href: '/admin/orders' },
    { name: 'Customers', icon: <Users size={20} />, href: '/admin/customers' },
    { name: 'Campaigns', icon: <ImageIcon size={20} />, href: '/admin/promotions' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/admin/settings' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin/overview') return pathname === href;
    return pathname.startsWith(href);
  };

  const currentPageName = menuItems.find(item => isActiveRoute(item.href))?.name || 'Dashboard';

  // 3. Loading State
  if (isLoading || (!isAuthenticated && pathname.startsWith('/admin'))) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="font-black text-3xl italic uppercase text-slate-950">HONE<span className="text-orange-600">.</span></h1>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <Loader2 className="animate-spin" size={16} />
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  // 4. If not admin (and not loading), don't show children while redirecting
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#FDFDFD]">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-cyan-200/30 bg-cyan-50/60 z-50">
        <div className="flex flex-col">
          <h1 className="font-black text-lg italic uppercase text-slate-950">HONE<span className="text-orange-600">.</span></h1>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-xl">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] bg-slate-950 transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:w-72 p-6 flex flex-col justify-between
        ${isMobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Close Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <span className="text-xl font-black tracking-tighter text-white uppercase">
              HONE<span className="text-orange-600">.</span>
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="hidden lg:block mb-10 px-2">
            <h1 className="font-black text-2xl italic text-white uppercase">HONE<span className="text-orange-600">.</span></h1>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[8px] font-black text-slate-500 tracking-[0.3em]">ADMINISTRATION</span>
              <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase">{user.name?.split(' ')[0] || 'Admin'}</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span className="text-sm tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
            <Link href="/" className="w-full flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white font-bold hover:bg-white/5 rounded-2xl transition-all">
              <Box size={20} />
              <span className="text-sm tracking-tight">Veiw Storefront</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-red-400 font-bold hover:bg-red-500/10 rounded-2xl transition-all">
              <LogOut size={20} />
              <span className="text-sm tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#FDFDFD] p-4 md:p-10">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 uppercase tracking-tighter">
            {currentPageName}<span className="text-orange-600">.</span>
          </h2>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}