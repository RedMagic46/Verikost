'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { LogOut, Settings, LayoutDashboard, User, ShieldAlert, MessageSquare } from 'lucide-react';

export default function ProfileDropdown() {
  const { currentUser, logout } = useApp();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-primary hover:bg-blue-600 text-white text-xs font-bold px-5 py-2 transition-colors shrink-0 shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
      >
        <User className="h-3.5 w-3.5" />
        <span>Masuk</span>
      </Link>
    );
  }

  
  const dashboardLink = 
    currentUser.role === 'OWNER' 
      ? '/owner' 
      : currentUser.role === 'ADMIN'
      ? '/admin'
      : '/dashboard';

  const roleLabels = {
    STUDENT: 'Mahasiswa',
    PARENT: 'Orang Tua',
    OWNER: 'Mitra Pemilik',
    ADMIN: 'Administrator'
  };

  return (
    <div className="relative" ref={containerRef}>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-left cursor-pointer hover:opacity-85 transition-opacity py-1 px-1.5"
      >
        <img
          src={currentUser.profileImage}
          alt={currentUser.fullName}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div className="text-left hidden lg:block">
          <p className="text-xs font-bold leading-none text-slate-800 dark:text-white truncate max-w-[100px]">
            {currentUser.fullName}
          </p>
          <p className="text-[9px] leading-none text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">
            {roleLabels[currentUser.role]}
          </p>
        </div>
      </button>

      
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 z-50 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          
          <div className="px-4 py-3 border-b border-border/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/10">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
              {currentUser.fullName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-1">
              {currentUser.email}
            </p>
          </div>

          <div className="py-1">
            
            <Link
              href={dashboardLink}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              <span>Dashboard Saya</span>
            </Link>

            
            <Link
              href="/chat"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span>Direct Chat Hub</span>
            </Link>

            
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white font-semibold transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Pengaturan Profil</span>
            </Link>
          </div>

          
          <div className="border-t border-border/80 dark:border-slate-800/80 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold transition-colors text-left"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Keluar Akun</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
