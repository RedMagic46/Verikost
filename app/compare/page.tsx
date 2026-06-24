'use client';

import React from 'react';
import { useApp } from '@/app/context/AppContext';
import { Compass, Trash2, Shield, Heart, Star, Check, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CompareKosts() {
  const { compareList, kosts, toggleCompare, favorites, toggleFavorite, currentUser, showToast } = useApp();

  
  const comparedKosts = kosts.filter((k) => {
    const isAuthorized = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === k.ownerId);
    return compareList.includes(k.id) && !k.isDeleted && (k.verifiedStatus !== 'none' || isAuthorized);
  });

  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  
  const hasFacility = (facilities: string[], facilityName: string) => {
    return facilities.includes(facilityName);
  };

  const comparisonFacilities = [
    'AC', 'WiFi', 'Kamar Mandi Dalam', 'Water Heater', 
    'Kasur Springbed', 'Dapur Bersama', 'CCTV', 'Parkir Motor', 'Parkir Mobil'
  ];

  if (comparedKosts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 min-h-[500px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100">
          <AlertCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bandingkan Kost Kosong</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Anda belum memilih kosan untuk dibandingkan. Silakan jelajahi kosan pilihan Anda lalu klik tombol "Bandingkan" pada kartu kost.
        </p>
        <Link
          href="/search"
          className="rounded-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-3 px-8 shadow"
        >
          Mulai Cari Kosan
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Perbandingan Hunian</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Bandingkan Fitur Kost Secara Objektif
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Kami menyandingkan spesifikasi penting secara berdampingan agar Anda dapat memutuskan kost mana yang paling hemat dan strategis untuk studi Anda.
          </p>
        </div>

        
        <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-300">
              
              
              <thead>
                <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/40">
                  <th className="p-6 font-bold text-slate-900 dark:text-white w-64 min-w-[200px]">Spesifikasi Kost</th>
                  
                  {comparedKosts.map((kost) => {
                    const isFav = favorites.includes(kost.id);
                    return (
                      <th key={kost.id} className="p-6 border-l border-border min-w-[250px] relative group">
                        
                        
                        <button
                          onClick={() => toggleCompare(kost.id)}
                          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
                          title="Hapus perbandingan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="space-y-4">
                          
                          <div className="aspect-[2/1] rounded-xl overflow-hidden border border-border">
                            <img src={kost.images[0]} alt={kost.name} className="h-full w-full object-cover" />
                          </div>

                          
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-primary transition-colors">
                              <Link href={`/kost/${kost.id}`}>{kost.name}</Link>
                            </h3>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{kost.address}</p>
                          </div>

                          <div className="flex gap-2 items-center">
                            <Link
                               href={`/kost/${kost.id}`}
                              className="flex-1 rounded-lg bg-primary hover:bg-blue-600 text-white text-[11px] font-bold py-1.5 px-3 text-center transition-colors shadow-sm"
                            >
                              Lihat Detail
                            </Link>
                            <button
                              onClick={() => {
                                if (!currentUser) {
                                  showToast('Silakan masuk terlebih dahulu untuk menambahkan ke favorit.', 'info');
                                  return;
                                }
                                toggleFavorite(kost.id);
                              }}
                              className={`p-1.5 rounded-lg border text-slate-400 hover:text-rose-500 shadow-sm transition-colors ${
                                isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : ''
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>

                      </th>
                    );
                  })}

                  
                  {comparedKosts.length < 3 && (
                    <th className="p-6 border-l border-border bg-slate-50/50 dark:bg-slate-900/10 text-center min-w-[250px]">
                      <div className="flex flex-col items-center justify-center p-6 space-y-2 text-slate-400">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full border border-dashed border-slate-300">
                          +
                        </div>
                        <p className="text-[11px] font-semibold">Bandingkan Slot Kosong</p>
                        <Link href="/search" className="text-[10px] text-primary font-bold hover:underline">
                          Pilih Kos Lain
                        </Link>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              
              <tbody className="divide-y divide-border">
                
                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Tarif Bulanan</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border font-extrabold text-primary text-base">
                      {formatPrice(kost.price)}
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Rating Surveyor</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border font-semibold text-slate-800 dark:text-white">
                      {kost.rating !== null && kost.rating !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{kost.rating.toFixed(1)} / 5.0</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Belum ada ulasan</span>
                      )}
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Ketersediaan Kamar</td>
                  {comparedKosts.map((kost) => {
                    const statusLabels = {
                      available: 'Tersedia',
                      limited: 'Hampir Penuh',
                      full: 'Penuh'
                    };
                    const statusColors = {
                      available: 'text-emerald-600 font-bold',
                      limited: 'text-amber-600 font-bold',
                      full: 'text-rose-600 font-bold'
                    };
                    return (
                      <td key={kost.id} className={`p-4 border-l border-border ${statusColors[kost.roomAvailability]}`}>
                        {statusLabels[kost.roomAvailability]}
                      </td>
                    );
                  })}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Jarak ke UB</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border font-medium text-slate-700 dark:text-slate-300">
                      {kost.distanceToUB} km
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Jarak ke UM</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border font-medium text-slate-700 dark:text-slate-300">
                      {kost.distanceToUM} km
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Jarak ke UMM</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border font-medium text-slate-700 dark:text-slate-300">
                      {kost.distanceToUMM} km
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                <tr>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">Fitur Keamanan</td>
                  {comparedKosts.map((kost) => (
                    <td key={kost.id} className="p-4 border-l border-border text-xs leading-relaxed text-slate-700 dark:text-slate-300 min-w-[200px]">
                      <div className="flex gap-1.5 items-start">
                        <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{kost.securityInfo}</span>
                      </div>
                    </td>
                  ))}
                  {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                </tr>

                
                {comparisonFacilities.map((facName) => (
                  <tr key={facName}>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/30">
                      Fasilitas: {facName}
                    </td>
                    {comparedKosts.map((kost) => {
                      const present = hasFacility(kost.facilities, facName);
                      return (
                        <td key={kost.id} className="p-4 border-l border-border">
                          {present ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              <Check className="h-4.5 w-4.5 text-emerald-500" />
                              <span>Tersedia</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 font-normal text-xs">
                              <X className="h-4.5 w-4.5 text-slate-300" />
                              <span>Tidak Ada</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    {comparedKosts.length < 3 && <td className="p-4 border-l border-border bg-slate-50/20"></td>}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
