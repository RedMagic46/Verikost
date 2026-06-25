'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AdminMapSelectorProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function AdminMapSelector({
  latitude,
  longitude,
  onChange,
}: AdminMapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const DEFAULT_CENTER: [number, number] = [-7.9525, 112.6144]; // UB center or Malang center
  const DEFAULT_ZOOM = 13;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const initialLat = latitude || DEFAULT_CENTER[0];
    const initialLng = longitude || DEFAULT_CENTER[1];

    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([initialLat, initialLng], DEFAULT_ZOOM);

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

  // Handle map click to set coordinates
  useEffect(() => {
    if (!map) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    };

    map.on('click', onMapClick);

    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onChange]);

  // Handle marker creation/update
  useEffect(() => {
    if (!map) return;

    const lat = latitude || DEFAULT_CENTER[0];
    const lng = longitude || DEFAULT_CENTER[1];
    const currentCoords: [number, number] = [lat, lng];

    // Create custom pin icon using tailwind HSL structure colors (usually primary is a blue)
    const pinIcon = L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div class="flex flex-col items-center select-none cursor-pointer">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 border-2 border-white text-white shadow-lg animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div class="h-2 w-2 rotate-45 -mt-1 bg-blue-600 border-r border-b border-white shadow"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(currentCoords);
    } else {
      const marker = L.marker(currentCoords, {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        onChange(Number(latLng.lat.toFixed(6)), Number(latLng.lng.toFixed(6)));
      });

      markerRef.current = marker;
    }

    // Pan map to the coordinate if center is far away
    const mapCenter = map.getCenter();
    const distance = map.distance(mapCenter, L.latLng(currentCoords));
    if (distance > 1000) { // more than 1km
      map.panTo(currentCoords);
    }
  }, [map, latitude, longitude, onChange]);

  // Invalidate map size to make sure it renders correctly
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
      <div className="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm pointer-events-none">
        Klik peta atau seret pin merah/biru untuk mengatur lokasi
      </div>
    </div>
  );
}
