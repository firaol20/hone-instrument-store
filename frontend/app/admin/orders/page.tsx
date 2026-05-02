'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  MapPin,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrders({
        page,
        limit: 12,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalItems(res.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to order processing engine.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';

    if (!nextStatus) return;

    setIsUpdating(id);
    try {
      await adminAPI.updateOrderStatus(id, nextStatus);
      toast.success(`Order advanced to ${nextStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Logistics update failed');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm('This action is permanent. Delete delivered order from registry?')) {
      setIsUpdating(id);
      try {
        await adminAPI.deleteOrder(id);
        toast.success('Order is deleted successfully');
        fetchOrders();
      } catch (err) {
        toast.error('Deletion failed');
      } finally {
        setIsUpdating(null);
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchOrders} /></div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Search and Filters Hub */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Tracker ID or Customer..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 hidden md:block" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 md:flex-none bg-slate-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Live Registry</option>
            <option value="pending">Pending Dispatch</option>
            <option value="shipped">In Transit</option>
            <option value="delivered">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8"><TableSkeleton rows={10} cols={5} /></div>
        ) : orders.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description={statusFilter === 'all' ? "New instrument orders will appear here automatically." : `No orders currently in ${statusFilter} status.`}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Tracking ID & Source</th>
                    <th className="px-6 py-4 text-left">Customer Information</th>
                    <th className="px-6 py-4 text-left">Financial Units</th>
                    <th className="px-6 py-4 text-left">Logistics Status</th>
                    <th className="px-6 py-4 text-left">Fulfillment</th>
                    <th className="px-6 py-4 text-left">Delivery Location</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900 uppercase italic tracking-tighter">#{order._id.slice(-6)}</span>
                          <button className="p-1 text-slate-300 hover:text-orange-600 transition-colors"><Copy size={12} /></button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{new Date(order.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 uppercase tracking-tight text-xs">{order.customerId?.name || 'Guest User'}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[120px]" title={`${order.address?.city}, ${order.address?.street}`}>
                          {order.address?.city}, {order.address?.street}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm">ETB {order.total.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.items.length} Instruments</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'pending')}
                              disabled={isUpdating === order._id}
                              className="flex items-center gap-2 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                              title="Mark as Shipped"
                            >
                              {isUpdating === order._id ? <Loader2 className="animate-spin" size={14} /> : <Truck size={14} />}
                              Mark as Shipped
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'shipped')}
                              disabled={isUpdating === order._id}
                              className="flex items-center gap-2 px-3 py-1.5 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                              title="Mark as Delivered"
                            >
                              {isUpdating === order._id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                              Mark as Delivered
                            </button>
                          )}
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              disabled={isUpdating === order._id}
                              className="flex items-center gap-2 px-3 py-1.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                              title="Delete Order"
                            >
                              {isUpdating === order._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                              Delete Order
                            </button>
                          )}

                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition-opacity">
                          <a
                            href={`https://www.google.com/maps?q=${order.address?.coordinates?.lat},${order.address?.coordinates?.lng}`}
                            target="_blank"
                            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            title="View Logistics Pin"
                          >
                            <MapPin size={18} />
                          </a>
                          {/* Share Location Button */}
                          <button
                            onClick={() => {
                              const locationUrl = `https://www.google.com/maps?q=${order.address?.coordinates?.lat},${order.address?.coordinates?.lng}`;
                              if (navigator.share) {
                                navigator.share({
                                  title: `Order Location: ${order.customerId?.name}`,
                                  text: `Logistics Pin for Order #${order._id.slice(-6)}`,
                                  url: locationUrl,
                                }).catch(() => {
                                  // Fallback to copy if share is cancelled or fails
                                  navigator.clipboard.writeText(locationUrl);
                                  toast.success('Location link copied');
                                });
                              } else {
                                navigator.clipboard.writeText(locationUrl);
                                toast.success('Location link copied to clipboard');
                              }
                            }}
                            className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                            title="Share Location with Driver"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                          className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                          title="View Complete Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Hub */}
            <div className="px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">
                Logistics Hub<br />
                <span className="text-slate-900">Page {page} of {totalPages} Units</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"
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
                  className="p-2.5 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"
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