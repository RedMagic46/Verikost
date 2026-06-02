'use client';

import React from 'react';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      
      
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-sky-400/5 blur-3xl animate-pulse-slow"></div>

      
      <div className="mb-6 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-black shadow-md shadow-primary/20">
            VK
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            VeriKost<span className="brand-gradient-text">Malang</span>
          </span>
        </Link>
      </div>

      
      <LoginForm />

      
      <div className="mt-8 text-center text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
        <Compass className="h-4 w-4 text-slate-400" />
        <span>100% Foto & Video Hasil Survei Lapangan Riil</span>
      </div>

    </div>
  );
}
