'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  CreditCard,
  ClipboardList
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { TableSkeleton } from '@/components/admin/SkeletonLoader';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getOrderById(id as string);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retrieve order data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await adminAPI.updateOrderStatus(id as string, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'shipped': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'paid': return <CreditCard size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (loading) return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-12 w-48 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
          <div className="h-48 bg-slate-100 rounded-[2.5rem]" />
        </div>
        <div className="space-y-8">
          <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
          <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
      <div className="p-6 bg-red-50 rounded-full text-red-500 mb-6">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Registry Error.</h2>
      <p className="text-slate-500 text-sm font-medium mb-8 max-w-md">{error || 'Order not found in system database.'}</p>
      <button 
        onClick={() => router.push('/admin/orders')}
        className="px-8 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
      >
        Return to Registry
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-slate-50 z-0" />
        
        <div className="relative z-10 flex flex-col gap-1">
          <button 
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
          >
            <ChevronLeft size={14} /> Back to Registry
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 uppercase italic tracking-tighter">
              Order <span className="text-orange-600">#{order._id.slice(-6).toUpperCase()}</span>
            </h1>
            <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Registered on {format(new Date(order.createdAt), 'MMMM dd, yyyy • HH:mm')}
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <button 
            onClick={() => window.print()}
            className="p-4 bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-white border border-slate-100 rounded-2xl transition-all shadow-sm"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Left) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 uppercase italic tracking-tight">Ordered Items.</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.items.length} units in this order</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4">Instrument Details</th>
                    <th className="px-8 py-4">Price (ETB)</th>
                    <th className="px-8 py-4">Quantity</th>
                    <th className="px-8 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.items.map((item: any, i: number) => (
                    <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                            {item.productId?.images?.[0] ? (
                              <img src={item.productId.images[0]} alt={item.productId.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.productId?.name || 'Unknown Product'}</div>
                            <div className="text-[10px] text-slate-400 font-mono italic">UNIT-ID: {item.productId?._id.slice(-6).toUpperCase() || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800">ETB {item.price.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-900">
                            {item.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="font-black text-slate-950 italic">ETB {(item.price * item.quantity).toLocaleString()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Order Subtotal</span>
                <span className="text-slate-900 font-bold italic">ETB {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Shipping & Logistics</span>
                <span className="text-slate-900 font-bold italic">ETB {order.shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-950 font-black uppercase italic tracking-tighter text-xl">Grand Total.</span>
                <span className="text-orange-600 font-black italic text-2xl tracking-tighter">ETB {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          {order.notes && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Clock size={20} />
                </div>
                <h3 className="font-black text-slate-950 uppercase italic tracking-tight">Customer Directive.</h3>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl text-sm font-medium text-slate-600 italic leading-relaxed">
                "{order.notes}"
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info (Right) */}
        <div className="space-y-8">
          {/* Status Management */}
          <div className="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-white space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Management</h3>
            </div>

            <div className="relative z-10 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Update Order Phase</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'pending', label: 'Pending', icon: <Clock size={14} />, color: 'amber' },
                  { id: 'paid', label: 'Paid / Confirmed', icon: <CreditCard size={14} />, color: 'blue' },
                  { id: 'processing', label: 'Processing', icon: <Package size={14} />, color: 'indigo' },
                  { id: 'shipped', label: 'In Transit', icon: <Truck size={14} />, color: 'sky' },
                  { id: 'delivered', label: 'Delivered', icon: <CheckCircle size={14} />, color: 'emerald' },
                ].map((status) => (
                  <button
                    key={status.id}
                    disabled={isUpdating || order.status === status.id}
                    onClick={() => handleStatusUpdate(status.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${
                      order.status === status.id 
                        ? `bg-orange-600 text-white shadow-lg shadow-orange-950/20` 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status.icon}
                      {status.label}
                    </div>
                    {order.status === status.id && <CheckCircle size={14} />}
                  </button>
                ))}
              </div>
            </div>
            
            {isUpdating && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
                <Loader2 className="animate-spin" size={14} />
                Synchronizing Logistics...
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-950 uppercase italic tracking-tight text-lg">Customer Profiling.</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-all border border-slate-100">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Contact</div>
                  <div className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{order.customerId?.name || 'Unknown Client'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-slate-100">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Communications</div>
                  <div className="text-sm font-bold text-slate-900 truncate" title={order.customerId?.email}>{order.customerId?.email || 'No email registered'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-slate-100">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Logistic Phone</div>
                  <div className="text-sm font-black text-slate-900">{order.customerId?.phone || 'No phone provided'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery Location */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-950 uppercase italic tracking-tight text-lg">Logistics Destination.</h3>
            
            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-orange-600 mt-1 flex-shrink-0" size={18} />
                <div className="text-sm font-medium text-slate-600 leading-relaxed italic">
                  {order.address?.city}, {order.address?.street}<br />
                  {order.address?.apartment && `Apt/Suite: ${order.address.apartment}`}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Truck size={14} />
                {order.deliveryOption.replace('_', ' ')} Delivery
              </div>
            </div>

            {order.address?.coordinates && (
              <a 
                href={`https://www.google.com/maps?q=${order.address.coordinates.lat},${order.address.coordinates.lng}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-950 font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-950 hover:text-white transition-all text-[10px] group shadow-sm"
              >
                Open Geolocation Hub <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
