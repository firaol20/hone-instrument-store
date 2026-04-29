'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Globe, 
  Bell, 
  Save, 
  Activity, 
  HardDrive, 
  Server, 
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { CardSkeleton } from '@/components/admin/SkeletonLoader';
import ErrorState from '@/components/admin/ErrorState';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    storeName: 'Hone Instrumental Store',
    contactEmail: 'support@hone.com',
    maintenanceMode: false,
    orderPrefix: 'HN-',
    currency: 'USD'
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sync with configuration engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Global configuration propagated successfully');
    } catch (err) {
      toast.error('Failed to sync settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchSettings} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 -mr-32 -mt-32 rounded-full group-hover:scale-110 transition-transform duration-700" />
        <div>
          <h1 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">
            System <span className="text-orange-600">Core.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Global Configuration & Logistics Management</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-3xl text-slate-400 border border-slate-100">
           <Settings size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="md:col-span-2 space-y-8">
          {loading ? (
             <CardSkeleton />
          ) : (
            <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-50 mb-6">
                  <Globe className="text-orange-600" size={20} />
                  <span className="text-[10px] font-black uppercase text-slate-950 tracking-widest">Storefront Identity</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 text-xs">Trading Name</label>
                    <input 
                      value={settings.storeName} 
                      onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 text-xs">Primary Contact Vector</label>
                    <input 
                      value={settings.contactEmail} 
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-50 mb-6">
                  <Shield className="text-orange-600" size={20} />
                  <span className="text-[10px] font-black uppercase text-slate-950 tracking-widest">Protocol Guard</span>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <div className="text-sm font-black text-slate-900 uppercase italic">Maintenance Override</div>
                    <div className="text-[10px] font-medium text-slate-400 tracking-wide mt-0.5 uppercase">Disable public access during logistics adjustments</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${settings.maintenanceMode ? 'bg-orange-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-950 text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-orange-600 disabled:bg-slate-400 transition-all text-xs flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <Save size={18} />
                    Synchronize Core
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* System Health Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <Activity className="text-emerald-500" size={20} />
                <span className="text-[10px] font-black uppercase text-slate-950 tracking-widest">Network Health</span>
             </div>
             
             <div className="space-y-6">
                {[
                  { label: 'Cloud API', status: 'Optimal', icon: <Server size={14} />, color: 'emerald' },
                  { label: 'Database', status: 'Synchronized', icon: <HardDrive size={14} />, color: 'emerald' },
                  { label: 'CDN Cluster', status: 'Operational', icon: <Globe size={14} />, color: 'emerald' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl bg-${item.color}-50 text-${item.color}-500 border border-${item.color}-100`}>
                        {item.icon}
                     </div>
                     <div className="flex-1">
                        <div className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{item.label}</div>
                        <div className={`text-[10px] font-bold text-${item.color}-600 uppercase tracking-tighter`}>{item.status}</div>
                     </div>
                     <CheckCircle size={14} className={`text-${item.color}-500`} />
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-6">
               <AlertTriangle className="text-orange-500" size={20} />
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Emergency Protocols</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-6 leading-relaxed">
              In case of critical system failure or logistics breach, please contact head office immediately.
            </p>
            <button 
              onClick={async () => {
                try {
                  const res = await adminAPI.syncTelegramWebhook();
                  if (res.data.success) {
                    toast.success('Telegram bot synchronized with Hone Cloud');
                  }
                } catch {
                  toast.error('Failed to sync Telegram bot');
                }
              }}
              className="w-full py-4 bg-orange-600/10 text-orange-500 border border-orange-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all mb-4"
            >
              Sync Telegram Bot
            </button>
            <button className="w-full py-4 bg-red-600/10 text-red-500 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              Initiate Lockdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}