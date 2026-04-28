'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HONE_SHOWROOM } from '@/lib/store-location';

interface StoreLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

interface LocationsMapProps {
  locations: StoreLocation[];
  onSelectLocation?: (location: StoreLocation) => void;
}

export default function LocationsMap({ locations, onSelectLocation }: LocationsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([HONE_SHOWROOM.lat, HONE_SHOWROOM.lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Fix for map not filling container correctly on first load
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, []);

  // 2. Sync Markers when locations change
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const honeIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white transform transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    locations.forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: honeIcon,
      });

      marker.bindPopup(`
        <div class="p-2 min-w-[150px]">
          <h3 class="font-bold text-gray-900">${location.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${location.city}, ${location.state}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}" 
             target="_blank" 
             class="mt-2 block text-center bg-orange-600 text-white text-[10px] py-1.5 rounded-md font-bold uppercase tracking-wider">
             Get Directions
          </a>
        </div>
      `, {
        className: 'hone-popup'
      });

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(location);
      });

      marker.addTo(layer);
    });

    if (locations.length > 0) {
      const first = locations[0];
      map.setView([first.latitude, first.longitude], map.getZoom());
    }
  }, [locations, onSelectLocation]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl min-h-[300px]">
      <div ref={containerRef} className="w-full h-full z-0" />
      <div className="absolute top-4 left-4 z-[1000] bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-none">
        <p className="text-white font-bold text-xs tracking-widest uppercase">Hone Showroom</p>
      </div>
    </div>
  );
}