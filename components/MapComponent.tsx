'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Kost } from '@/app/types';

interface MapComponentProps {
  kosts: Kost[];
  selectedCampus: string;
  activeMapKostId: string | null;
  setActiveMapKostId: (id: string | null) => void;
}

export default function MapComponent({
  kosts,
  selectedCampus,
  activeMapKostId,
  setActiveMapKostId,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  
  const CAMPUS_COORDS: Record<string, [number, number]> = {
    ub: [-7.9525, 112.6138],
    um: [-7.9622, 112.6172],
    umm: [-7.9213, 112.5979],
    uin: [-7.9520, 112.6068],
  };

  const DEFAULT_CENTER: [number, number] = [-7.95, 112.61]; 
  const DEFAULT_ZOOM = 13;

  
  const getKostCoordinates = (kost: Kost): [number, number] => {
    if (kost.latitude && kost.longitude) {
      return [Number(kost.latitude), Number(kost.longitude)];
    }

    const coords: Record<string, [number, number]> = {
      'kost-1': [-7.9495, 112.6155], 
      'kost-2': [-7.9452, 112.6225], 
      'kost-3': [-7.9575, 112.6085], 
      'kost-4': [-7.9235, 112.5955], 
      'kost-5': [-7.9185, 112.5895], 
      'kost-6': [-7.9605, 112.6125], 
    };

    if (coords[kost.id]) return coords[kost.id];

    
    let hash = 0;
    for (let i = 0; i < kost.id.length; i++) {
      hash = kost.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = ((Math.abs(hash) % 400) - 200) / 10000;
    const lngOffset = ((Math.abs(hash >> 2) % 400) - 200) / 10000;
    return [-7.95 + latOffset, 112.61 + lngOffset];
  };

  
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
      setMap(null);
    };
  }, []);

  
  useEffect(() => {
    if (!map) return;

    const campusMarkers: L.Marker[] = [];

    Object.entries(CAMPUS_COORDS).forEach(([name, coords]) => {
      const campusLabel = name.toUpperCase();
      const campusFullName =
        name === 'ub' ? 'Brawijaya' :
        name === 'um' ? 'UM Malang' :
        name === 'umm' ? 'UMM Kampus 3' :
        name === 'uin' ? 'UIN Malang' : 'Kampus';

      const campusIcon = L.divIcon({
        className: 'bg-transparent border-none',
        html: `
          <div class="flex flex-col items-center justify-center select-none">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-white text-white font-black text-[9px] shadow-lg shadow-black/30">
              ${campusLabel}
            </div>
            <span class="text-[8px] font-bold text-slate-500 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-1 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
              ${campusFullName}
            </span>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 25],
      });

      const marker = L.marker(coords, { icon: campusIcon, zIndexOffset: -500 }).addTo(map);
      campusMarkers.push(marker);
    });

    return () => {
      campusMarkers.forEach((m) => m.remove());
    };
  }, [map]);

  
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  
  useEffect(() => {
    if (!map) return;

    if (selectedCampus && CAMPUS_COORDS[selectedCampus]) {
      map.flyTo(CAMPUS_COORDS[selectedCampus], 15, { duration: 1.5 });
    } else if (kosts.length > 0) {
      const coordsList = kosts.map((k) => getKostCoordinates(k));
      const bounds = L.latLngBounds(coordsList);
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 15, duration: 1.2 });
    } else {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.5 });
    }
  }, [map, selectedCampus, kosts.length]);

  
  useEffect(() => {
    if (!map) return;

    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!kosts.some((k) => k.id === id)) {
        marker.remove();
        delete markersRef.current[id];
      }
    });

    
    kosts.forEach((kost) => {
      const coords = getKostCoordinates(kost);
      const isActive = activeMapKostId === kost.id;

      const genderColors = {
        male: isActive
          ? 'bg-blue-600 border-white text-white'
          : 'bg-blue-600 border-blue-200 text-white',
        female: isActive
          ? 'bg-rose-500 border-white text-white'
          : 'bg-rose-500 border-rose-200 text-white',
        mixed: isActive
          ? 'bg-purple-600 border-white text-white'
          : 'bg-purple-600 border-purple-200 text-white',
      };
      const pinColorClass = genderColors[kost.genderCategory] || 'bg-slate-700 text-white';

      const customIcon = L.divIcon({
        className: 'bg-transparent border-none',
        html: `
          <div class="flex flex-col items-center select-none cursor-pointer transition-all duration-300 ${
            isActive ? 'scale-125 z-[1000]' : 'hover:scale-110'
          }">
            <div class="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-extrabold shadow-md transition-all ${pinColorClass} ${
              isActive ? 'ring-2 ring-primary ring-offset-1' : ''
            }">
              <span>Rp${(kost.price / 1000000).toFixed(1)}JT</span>
            </div>
            <div class="h-2 w-2 rotate-45 -mt-1 shadow transition-colors ${
              isActive ? 'bg-primary' : 'bg-slate-800'
            }"></div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 25],
      });

      if (markersRef.current[kost.id]) {
        
        markersRef.current[kost.id].setIcon(customIcon);
        markersRef.current[kost.id].setZIndexOffset(isActive ? 1000 : 0);
      } else {
        
        const marker = L.marker(coords, { icon: customIcon })
          .on('click', () => {
            setActiveMapKostId(kost.id);
            const element = document.getElementById(`kost-card-${kost.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          })
          .addTo(map);

        markersRef.current[kost.id] = marker;
      }
    });
  }, [map, kosts, activeMapKostId]);

  
  useEffect(() => {
    if (!map || !activeMapKostId) return;

    const activeKost = kosts.find((k) => k.id === activeMapKostId);
    if (activeKost) {
      const coords = getKostCoordinates(activeKost);
      map.panTo(coords, { animate: true, duration: 0.8 });
    }
  }, [map, activeMapKostId, kosts]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
    </div>
  );
}
