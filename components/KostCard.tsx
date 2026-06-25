'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/app/context/AppContext';
import { Kost } from '@/app/types';
import VerificationBadge from './VerificationBadge';
import AvailabilityIndicator from './AvailabilityIndicator';
import { Heart, GitCompare, Star, MapPin, Compass } from 'lucide-react';

interface KostCardProps {
  kost: Kost;
  viewType?: 'grid' | 'list';
}

export default function KostCard({ kost, viewType = 'grid' }: KostCardProps) {
  const { favorites, compareList, toggleFavorite, toggleCompare, currentUser, showToast, campuses, getKostDistance } = useApp();
  
  const getCampusAbbr = (campusName: string): string => {
    const match = campusName.match(/\(([^)]+)\)/);
    if (match) return match[1].toUpperCase();
    return campusName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 4);
  };

  const visibleCampuses = campuses.filter(c => c.isVisible).slice(0, 3);
  
  const isFavorited = favorites.includes(kost.id);
  const isCompared = compareList.includes(kost.id);

  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  
  const genderLabels = {
    male: { label: 'Putra', bg: 'bg-blue-600 dark:bg-blue-700 text-white' },
    female: { label: 'Putri', bg: 'bg-rose-500 dark:bg-rose-600 text-white' },
    mixed: { label: 'Campur', bg: 'bg-purple-600 dark:bg-purple-700 text-white' }
  };

  const gender = genderLabels[kost.genderCategory] || { label: 'Kost', bg: 'bg-gray-600 text-white' };

  if (viewType === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
        
        
        <div className="relative w-full sm:w-60 h-48 sm:h-auto overflow-hidden shrink-0">
          <img
            src={kost.images[0]}
            alt={kost.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${gender.bg}`}>
              {gender.label}
            </span>
            <VerificationBadge status={kost.verifiedStatus} />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!currentUser) {
                showToast('Silakan masuk akun terlebih dahulu untuk menyimpan favorit.', 'info');
                window.location.href = '/login';
                return;
              }
              toggleFavorite(kost.id);
            }}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 shadow-md hover:scale-110 active:scale-95 transition-transform"
            title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          >
            <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorited ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
          </button>
        </div>

        
        <div className="flex flex-col flex-1 p-5 justify-between">
          <div className="space-y-2">
            
            
            <div className="flex items-center justify-between gap-2">
              <AvailabilityIndicator availability={kost.roomAvailability} />
              
              {kost.rating !== null && kost.rating !== undefined ? (
                <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{kost.rating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">Belum ada ulasan</span>
              )}
            </div>

            
            <Link href={`/kost/${kost.id}`} className="block">
              <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                {kost.name}
              </h3>
            </Link>

            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{kost.address}</span>
            </div>

            
            <div className={`grid grid-cols-${visibleCampuses.length || 1} gap-2 py-1.5 px-2 bg-muted/40 rounded-lg text-[10px] text-muted-foreground`}>
              {visibleCampuses.map((campus) => {
                const dist = getKostDistance(kost, campus.id);
                return (
                  <div key={campus.id} className="flex items-center gap-1">
                    <Compass className="h-3 w-3 text-slate-400 animate-pulse" />
                    <span>{getCampusAbbr(campus.name)}: {dist > 0 ? `${dist} km` : '-'}</span>
                  </div>
                );
              })}
              {visibleCampuses.length === 0 && (
                <div className="text-center w-full col-span-full">Informasi jarak tidak tersedia</div>
              )}
            </div>

            
            <div className="flex flex-wrap gap-1 pt-1">
              {kost.facilities.slice(0, 4).map((fac, idx) => (
                <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded font-medium">
                  {fac}
                </span>
              ))}
              {kost.facilities.length > 4 && (
                <span className="text-[10px] text-muted-foreground self-center pl-1">
                  +{kost.facilities.length - 4} lainnya
                </span>
              )}
            </div>
          </div>

          
          <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-4">
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">Mulai dari</p>
              <p className="text-lg font-extrabold text-primary mt-1">
                {formatPrice(kost.price)}<span className="text-xs font-normal text-muted-foreground">/bln</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCompare(kost.id)}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-lg border text-xs font-semibold shadow-sm transition-colors ${
                  isCompared
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>{isCompared ? 'Bandingkan ✓' : 'Bandingkan'}</span>
              </button>
              
              <Link
                href={`/kost/${kost.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-blue-600 py-1.5 px-3 text-xs font-semibold text-white transition-colors"
              >
                Lihat Detail
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
      
      
      <div className="relative aspect-video w-full overflow-hidden shrink-0">
        <img
          src={kost.images[0]}
          alt={kost.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${gender.bg}`}>
            {gender.label}
          </span>
          <VerificationBadge status={kost.verifiedStatus} />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (!currentUser) {
              showToast('Silakan masuk akun terlebih dahulu untuk menyimpan favorit.', 'info');
              window.location.href = '/login';
              return;
            }
            toggleFavorite(kost.id);
          }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 shadow-md hover:scale-110 active:scale-95 transition-transform"
          title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorited ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
        </button>
      </div>

      
      <div className="flex flex-col flex-1 p-4 justify-between space-y-3">
        <div className="space-y-1.5">
          
          <div className="flex items-center justify-between gap-2">
            <AvailabilityIndicator availability={kost.roomAvailability} />
            
            {kost.rating !== null && kost.rating !== undefined ? (
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>{kost.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground font-semibold">Belum ada ulasan</span>
            )}
          </div>

          
          <Link href={`/kost/${kost.id}`} className="block">
            <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
              {kost.name}
            </h3>
          </Link>

          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{kost.address}</span>
          </div>

          
          <div className={`grid grid-cols-${visibleCampuses.length || 1} gap-1.5 py-1 px-1.5 bg-muted/40 rounded-lg text-[9px] text-muted-foreground text-center`}>
            {visibleCampuses.map((campus, idx) => {
              const dist = getKostDistance(kost, campus.id);
              const isBorderX = visibleCampuses.length === 3 && idx === 1;
              return (
                <div key={campus.id} className={isBorderX ? "border-x border-border" : ""}>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {dist > 0 ? `${dist} km` : '-'}
                  </p>
                  <p className="text-[8px]">ke {getCampusAbbr(campus.name)}</p>
                </div>
              );
            })}
            {visibleCampuses.length === 0 && (
              <div className="text-center w-full col-span-full text-[8px]">Informasi jarak tidak tersedia</div>
            )}
          </div>
        </div>

        
        <div className="border-t border-border/60 pt-3 flex items-center justify-between mt-auto">
          <div>
            <p className="text-[9px] text-muted-foreground leading-none">Sewa Bulanan</p>
            <p className="text-sm font-extrabold text-primary mt-1">
              {formatPrice(kost.price)}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleCompare(kost.id)}
              className={`p-1.5 rounded-lg border shadow-sm transition-colors ${
                isCompared
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400'
                  : 'border-border text-slate-400 hover:text-foreground'
              }`}
              title="Bandingkan Kost"
            >
              <GitCompare className="h-4 w-4" />
            </button>
            <Link
              href={`/kost/${kost.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-blue-600 py-1.5 px-2.5 text-[11px] font-bold text-white transition-colors"
            >
              Detail
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
