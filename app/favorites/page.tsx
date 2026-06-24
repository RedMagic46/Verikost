'use client';

import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import KostCard from '@/components/KostCard';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

export default function FavoritesPage() {
  const { favorites, kosts, toggleFavorite, currentUser } = useApp();

  
  const favoritedKosts = kosts.filter((k) => {
    const isAuthorized = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === k.ownerId);
    return favorites.includes(k.id) && !k.isDeleted && (k.verifiedStatus !== 'none' || isAuthorized);
  });

  


  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClearAll = () => {
    if (favoritedKosts.length === 0) return;
    setIsConfirmOpen(true);
  };

  if (favoritedKosts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 min-h-[500px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daftar Favorit Kosong</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Anda belum menyimpan kost apa pun. Ketuk ikon hati pada kartu kosan saat mencari untuk menyimpannya di sini.
        </p>
        <Link
          href="/search"
          className="rounded-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-3 px-8 shadow"
        >
          Mulai Jelajahi Kost
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Kost Tersimpan</span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Hunian Impian Pilihan Anda
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Simpan opsi hunian ternyaman Anda dan bandingkan speknya sekaligus untuk mempermudah pendaftaran sewa.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold py-3 px-5 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Semua
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoritedKosts.map((kost) => (
            <KostCard key={kost.id} kost={kost} />
          ))}
        </div>

      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          favorites.forEach((favId) => {
            toggleFavorite(favId);
          });
        }}
        title="Hapus Semua Favorit?"
        description="Apakah Anda yakin ingin menghapus semua kost dari daftar favorit Anda? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
