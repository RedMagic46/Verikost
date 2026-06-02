'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

export default function AccessDeniedPage() {
  const { logout } = useApp();
  const router = useRouter();

  const handleLogoutAndLogin = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl animate-pulse-slow"></div>
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-border shadow-xl rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="h-8 w-8" />
        </div>

        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Akses Ditolak</h1>
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest font-mono text-[10px]">Error 403 - Forbidden</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Maaf, Anda tidak memiliki izin otorisasi yang cukup untuk mengakses halaman ini. Halaman ini diproteksi ketat hanya untuk peran pengguna tertentu.
          </p>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Kembali Home</span>
          </Link>
          <button
            onClick={handleLogoutAndLogin}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Ganti Akun</span>
          </button>
        </div>

      </div>

    </div>
  );
}
