'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Mail, Phone, MapPin, ArrowUpRight, Copy, Camera, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { HONE_SHOWROOM } from '@/lib/store-location';

const LocationPicker = dynamic(() => import('@/components/LocationPicker').then(mod => mod.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-slate-50 animate-pulse rounded-[2rem] flex items-center justify-center text-slate-300 font-black uppercase tracking-widest text-[9px]">Loading Map…</div>
});

import { getDirectionsUrl } from '@/lib/store-location';

export default function Contact() {
  const router = useRouter();
  const storeLocations = [
    {
      id: HONE_SHOWROOM.id,
      name: HONE_SHOWROOM.name,
      city: HONE_SHOWROOM.city,
      state: HONE_SHOWROOM.state,
      latitude: HONE_SHOWROOM.lat,
      longitude: HONE_SHOWROOM.lng,
    }
  ];

  // Manager data – start with null image (empty)
  const [manager, setManager] = useState({
    name: 'Minase Endashaw',
    role: 'Store Manager',
    description: 'With many years in the music industry, Minase ensures every musician finds their perfect sound. Visit us for a professional consultation.',
    phone: '+251 982616263',
    image: null as string | null, // Start empty
  });

  // Load saved image from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem('managerImage');
    if (savedImage) {
      setManager(prev => ({ ...prev, image: savedImage }));
    }
  }, []);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('Phone number copied');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setManager(prev => ({ ...prev, image: base64 }));
      localStorage.setItem('managerImage', base64);
      toast.success('Manager image updated');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-orange-100">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Section Header – reduced text sizes */}
        <header className="mb-12 lg:mb-16">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
          </button>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-[1.1]">
            Get in <span className="text-orange-600">Touch.</span>
          </h1>
          <p className="mt-4 text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] max-w-xl leading-relaxed">
            Visit our showroom in Megenagna or connect with our specialized team for professional guidance.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left: Contact Hub – reduced spacing */}
          <div className="lg:col-span-5 space-y-8">

            <div className="grid grid-cols-1 gap-6">
              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl group-hover:border-orange-500 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
                </div>
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Digital Correspondence</h3>
                  <a href="mailto:honemusicinstruments@gmail.com" className="font-black text-slate-900 uppercase text-sm hover:text-orange-600 transition">
                    honemusicinstruments@gmail.com
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl group-hover:border-orange-500 transition-colors">
                  <Phone className="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
                </div>
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Direct Line</h3>
                  <div className="flex items-center gap-2">
                    <a href="tel:+251 982616263" className="font-black text-slate-900 uppercase text-sm hover:text-orange-600 transition">
                      +251 982616263
                    </a>
                    <button
                      onClick={() => handleCopyPhone('+251 943 198 305')}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      title="Copy phone number"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-slate-100 rounded-xl group-hover:border-orange-500 transition-colors">
                  <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
                </div>
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Our Location</h3>
                  <p className="font-black text-slate-900 uppercase text-sm leading-tight">
                    {HONE_SHOWROOM.street}<br />
                    {HONE_SHOWROOM.city}, {HONE_SHOWROOM.country === 'ET' ? 'Ethiopia' : HONE_SHOWROOM.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Integration */}
            <div className="pt-6 border-t border-slate-50 group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Showroom Coordinates</h3>
                <button
                  onClick={() => window.open(getDirectionsUrl(HONE_SHOWROOM.lat, HONE_SHOWROOM.lng), '_blank')}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Get Directions <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="rounded-3xl border-2 border-slate-100 p-2 bg-white shadow-xl shadow-slate-100/50 relative">
                <LocationPicker mode="pickup" onLocationSelect={() => { }} />
              </div>
            </div>
          </div>

          {/* Right: Manager Card – compact and image empty by default */}
          <div className="lg:col-span-7">
            <div className="relative bg-white border border-slate-100 rounded-3xl p-6 md:p-8 lg:p-10 overflow-hidden group hover:border-slate-200 transition-all duration-500">

              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-50 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative z-10 flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-6">

                {/* Manager Image – empty with upload button */}
                <div className="relative w-32 h-32 md:w-36 md:h-36 flex-shrink-0 group/image">
                  <div className="absolute inset-0 bg-orange-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-100 rounded-xl overflow-hidden border border-white flex items-center justify-center">
                    {manager.image ? (
                      <img
                        src={manager.image}
                        alt={manager.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                        <Camera size={24} strokeWidth={1.5} />
                        <span className="text-[8px] font-black mt-1 uppercase">No Image</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="text-white" size={24} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Content – smaller text */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.3em]">Hone Management</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-950 uppercase italic tracking-tighter mt-1">
                      {manager.name}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{manager.role}</p>
                  </div>

                  <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-tight max-w-md italic">
                    “{manager.description}”
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start items-center">
                    <a
                      href={`tel:${manager.phone.replace(/\s/g, '')}`}
                      className="px-4 py-2 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md shadow-slate-200"
                    >
                      <Phone size={12} /> Call Direct
                    </a>
                    <button
                      onClick={() => handleCopyPhone(manager.phone)}
                      className="px-3 py-2 bg-white border border-slate-100 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-slate-950 transition-all flex items-center gap-2"
                      title="Copy manager's phone"
                    >
                      <Copy size={12} /> Copy Number
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}