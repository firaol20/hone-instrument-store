'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HONE_SHOWROOM } from '@/lib/store-location';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search, Loader2, X } from 'lucide-react';
import { forwardGeocode, reverseGeocode, GeocodeResult } from '@/lib/geocoding';
import { Input } from '@/components/ui/input';

const containerStyle = { width: '100%', height: '300px', borderRadius: '1rem' };
const defaultCenter = { lat: 9.03, lng: 38.74 };
const storeCenter = { lat: 9.0198494, lng: 38.8005477 };

interface StaticMarker {
  lat: number;
  lng: number;
  label?: string;
  id: string;
}

interface LocationPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  onAddressSelect?: (address: string) => void;
  address?: string;
  className?: string;
  style?: React.CSSProperties;
  mode?: 'deliver' | 'pickup';
  geoRequestToken?: number;
  staticMarkers?: StaticMarker[];
  initialLocation?: { lat: number; lng: number } | null;
}

export function LocationPicker({
  onLocationSelect,
  onAddressSelect,
  address,
  mode = 'deliver',
  geoRequestToken = 0,
  className,
  style,
  staticMarkers = [],
  initialLocation = null,
}: LocationPickerProps) {
  const [position, setPosition] = useState(initialLocation || (mode === 'pickup' ? storeCenter : defaultCenter));
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [internalAddress, setInternalAddress] = useState(address || '');
  
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const lastGeoToken = useRef(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialPos = mode === 'pickup' ? storeCenter : position;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([initialPos.lat, initialPos.lng], mode === 'pickup' ? 16 : 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM contributors',
      maxZoom: 19,
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([initialPos.lat, initialPos.lng], {
      icon: markerIcon,
      draggable: mode === 'deliver',
    }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      handleLocationUpdate({ lat, lng });
    });

    if (mode === 'deliver') {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        handleLocationUpdate({ lat, lng });
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleLocationUpdate = useCallback(({ lat, lng }: { lat: number; lng: number }) => {
    const newPos = { lat, lng };
    setPosition(newPos);
    onLocationSelect(newPos);
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (onAddressSelect) {
      reverseGeocode(lat, lng).then((addr) => {
        if (addr) onAddressSelect(addr);
      });
    }
  }, [onLocationSelect, onAddressSelect]);

  const panToWithZoom = useCallback((newPos: { lat: number; lng: number }, zoom = 17) => {
    mapRef.current?.setView([newPos.lat, newPos.lng], zoom);
  }, []);

  useEffect(() => {
    setInternalAddress(address || '');
  }, [address]);

  useEffect(() => {
    if (initialLocation && (initialLocation.lat !== position.lat || initialLocation.lng !== position.lng)) {
      setPosition(initialLocation);
      if (markerRef.current) {
        markerRef.current.setLatLng([initialLocation.lat, initialLocation.lng]);
      }
      if (mapRef.current) {
        mapRef.current.setView([initialLocation.lat, initialLocation.lng], 16);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    if (mode === 'deliver' && internalAddress && internalAddress.length > 2) {
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        const results = await forwardGeocode(internalAddress);
        setSearchResults(results);
        setShowResults(true);
        setIsSearching(false);
      }, 600);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [internalAddress, mode]);

  const selectResult = (res: GeocodeResult) => {
    const newPos = { lat: res.lat, lng: res.lng };
    handleLocationUpdate(newPos);
    if (onAddressSelect) onAddressSelect(res.displayName);
    setInternalAddress(res.displayName);
    setSearchResults([]);
    panToWithZoom(newPos, 17);
  };

  useEffect(() => {
    if (mode === 'pickup') {
      handleLocationUpdate(storeCenter);
      panToWithZoom(storeCenter, 16);
    }
  }, [mode, handleLocationUpdate, panToWithZoom]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Map Container */}
      <div className="relative group rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner h-[300px] z-0">
        <div ref={containerRef} className="w-full h-full z-0" />
      </div>

      {/* Search Overlay - appears on top of map */}
      {mode === 'deliver' && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-[1100]">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </div>
            <Input
              value={internalAddress}
              onChange={(e) => setInternalAddress(e.target.value)}
              placeholder="Search building, landmark or street in Addis..."
              className="h-12 pl-11 pr-20 rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-lg"
            />
            {internalAddress && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-[1100]">
                {searchResults.length > 0 && (
                  <button
                    onClick={() => setShowResults(!showResults)}
                    className="text-[10px] font-black uppercase tracking-tighter text-orange-600 bg-orange-50 px-2 py-1 rounded-md hover:bg-orange-100 transition-colors"
                  >
                    {showResults ? 'Hide' : 'Show'}
                  </button>
                )}
                <button
                  onClick={() => { setInternalAddress(''); setSearchResults([]); }}
                  className="text-slate-300 hover:text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Results Dropdown - Pop-up over map */}
            {searchResults.length > 0 && showResults && (
              <div className="absolute z-[2000] top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center sticky top-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3">Search Results</span>
                  <button onClick={() => setShowResults(false)} className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 px-3">Close</button>
                </div>
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => selectResult(res)}
                    className="w-full text-left px-5 py-3 hover:bg-orange-50 flex gap-3 border-b border-slate-50 last:border-0 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{res.displayName.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">{res.displayName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'deliver' && (
        <div className="mt-4 bg-slate-50 rounded-2xl p-4 flex gap-3 border border-slate-100">
          <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
            Not quite right? <span className="font-black text-slate-900 italic underline decoration-orange-300">Drag the pin</span> manually on the map to your exact gate.
          </p>
        </div>
      )}
    </div>
  );
}
