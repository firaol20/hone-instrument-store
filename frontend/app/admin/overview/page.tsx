'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingBag, Users, Eye, MapPin, Share2, CheckCircle, RotateCcw, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/admin/SkeletonLoader';
import ErrorState from '@/components/admin/ErrorState';

export default function OverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, revRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRevenueStats('90d', 'week')
      ]);

      if (dashRes.data.success) setStats(dashRes.data.data);
      if (revRes.data.success) {
        setRevenueData(revRes.data.data.revenueByDay);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sync with Hone Cloud Engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchData} /></div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Prime Statistics Hub */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          [
            { label: 'Cumulative Revenue', value: `ETB ${stats?.stats.totalRevenue?.toLocaleString() || 0}`, trend: `${stats?.stats.revenueChangePercentage > 0 ? '+' : ''}${stats?.stats.revenueChangePercentage || 0}%`, icon: <TrendingUp size={24} />, color: 'emerald' },
            { label: 'Instrument Registry', value: stats?.stats.totalProducts || 0, trend: 'Live', icon: <ShoppingBag size={24} />, color: 'orange' },
            { label: 'Active Residents', value: stats?.stats.totalCustomers || 0, trend: `+${stats?.stats.newCustomersThisMonth || 0}`, icon: <Users size={24} />, color: 'blue' },
            { label: 'Unfulfilled Orders', value: stats?.stats.totalOrders || 0, trend: 'Priority', icon: <Eye size={24} />, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-${stat.color}-500/5 transition-transform group-hover:scale-150 duration-700`} />
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className={`p-2.5 md:p-4 rounded-2xl md:rounded-3xl bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`}>
                  {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 18, className: 'md:w-6 md:h-6' })}
                </div>
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
              <div className="text-lg md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{stat.value}</div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Revenue Chronograph */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-8 md:mb-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-1">Revenue <span className="text-orange-600">Chronograph.</span></h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-Week Performance Analysis</p>
            </div>
            <div className="p-3 md:p-4 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
              <TrendingUp size={18} className="md:w-5 md:h-5" />
            </div>
          </div>

          <div className="h-[250px] md:h-[350px] w-full">
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={32}>
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#f97316' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Operations */}
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">Recent <span className="text-orange-600">Orders.</span></h2>
              <button onClick={() => router.push('/admin/orders')} className="text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-colors tracking-widest">View Details</button>
            </div>

            <div className="space-y-6">
              {loading ? (
                <TableSkeleton rows={5} cols={1} />
              ) : stats?.recentOrders.length === 0 ? (
                <div className="py-20 text-center uppercase tracking-widest text-[10px] font-black text-slate-300">Registry Empty</div>
              ) : (
                stats?.recentOrders.map((order: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-950 flex items-center justify-center text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs italic shadow-lg shadow-slate-200 group-hover:bg-orange-600 transition-all">
                        {order.status === 'delivered' ? <CheckCircle size={14} /> : order._id.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[10px] md:text-xs font-black uppercase italic tracking-tight text-slate-900">#{order._id.slice(-6)}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{order.customerId?.name || 'Store Guest'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] md:text-xs font-black text-slate-900">ETB {order.total.toLocaleString()}</div>
                      <div className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0.5 rounded-md mt-1 ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-950 rounded-[2rem] shadow-2xl shadow-slate-200 group overflow-hidden relative flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Note For Admin</span>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
              You have {stats?.stats.totalUnpaidOrders} unpaid and {stats?.stats.totalPaidOrders} paid orders to check and update their delivery and confirm payment status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}