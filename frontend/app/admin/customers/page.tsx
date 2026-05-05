'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { AdminCustomer } from '@/lib/admin-types';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import { useAuthStore } from '@/lib/auth-store';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { isOwner } = useAuthStore();

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12
      };

      // Add search by name if search term exists
      if (search) {
        params.search = search;
      }

      const res = await adminAPI.getCustomers(params);
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sync with customer database.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleAdmin = async (customer: AdminCustomer) => {
    const customerId = customer._id;
    if (!customerId || !customer.userId) return;

    const action = customer.userId.role === 'admin' ? 'remove' : 'grant';
    if (confirm(`Are you sure you want to ${action} admin access for ${customer.name}?`)) {
      setIsUpdating(customerId);
      try {
        await adminAPI.toggleAdminRole(customerId);
        toast.success(`Role updated for ${customer.name}`);
        fetchCustomers();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to update user role');
      } finally {
        setIsUpdating(null);
      }
    }
  };

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchCustomers} /></div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search verified users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Total Residents<br />
              <span className="text-sm text-slate-900">{totalItems} Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Customers List Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8"><TableSkeleton rows={10} cols={4} /></div>
        ) : customers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No customers found"
              description={search ? "No customers match your search criteria." : "New user registrations will appear here automatically."}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Customer Information</th>
                    <th className="px-6 py-4 text-left">Contact & Verified Identity</th>
                    <th className="px-6 py-4 text-left">Administrative Status</th>
                    <th className="px-6 py-4 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-lg italic shadow-lg shadow-slate-200">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm italic uppercase tracking-tight">{customer.name}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              <Calendar size={10} /> Joined {new Date(customer.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Mail size={14} className="text-slate-300" />
                          <span className="text-sm">{customer.userId?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-medium mt-1">
                          <Phone size={14} className="text-slate-200" />
                          <span className="text-xs">{customer.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.userId?.role === 'owner' ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                              <Shield size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">OWNER</span>
                            </div>
                          ) : customer.userId?.role === 'admin' ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-xl shadow-md shadow-orange-100">
                              <Shield size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">ADMIN</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                              <ShieldAlert size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">STORE MEMBER</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          {isOwner() && customer.userId?.role !== 'owner' && (
                            <button
                              onClick={() => handleToggleAdmin(customer)}
                              disabled={isUpdating === customer._id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${customer.userId?.role === 'admin'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-blue-500 hover:bg-blue-50'
                                }`}
                              title={customer.userId?.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                            >
                              {isUpdating === customer._id ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <Shield size={14} />
                              )}
                              <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                {customer.userId?.role === 'admin' ? 'Revoke Admin' : 'Promote to Admin'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">
                Nexus Registry<br />
                <span className="text-slate-900">Page {page} of {totalPages} Units</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all border border-transparent active:scale-95"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex gap-1 px-4 py-2 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${page === i + 1 ? 'bg-orange-600' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                    />
                  )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2.5 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all border border-transparent active:scale-95"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}