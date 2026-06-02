'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import ProfileDropdown from './ProfileDropdown';
import { Heart, GitCompare, User, Moon, Sun, Briefcase, GraduationCap, Menu, X, Home, LogOut, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { favorites, compareList, currentUser, logout, authLoading } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.role === 'ADMIN') {
        router.replace('/admin');
      } else if (currentUser.role === 'OWNER') {
        router.replace('/owner');
      }
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vk_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vk_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vk_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navLinks = [
    { name: 'Cari Kost', path: '/search' },
    { name: 'Bandingkan', path: '/compare' },
    currentUser ? { name: 'Favorit', path: '/favorites' } : null
  ].filter(Boolean) as { name: string; path: string }[];

  const roleLabels = {
    STUDENT: 'Mahasiswa',
    PARENT: 'Orang Tua',
    OWNER: 'Pemilik Kost',
    ADMIN: 'Admin'
  };

  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/owner'))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="VeriKost Logo" 
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105" 
          />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            VeriKost<span className="brand-gradient-text">Malang</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {currentUser && (
            <Link
              href="/chat"
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Buka History Chat"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900"></span>
            </Link>
          )}

          <div className="pl-2 border-l border-border flex items-center">
            <ProfileDropdown />
          </div>

        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted-foreground cursor-pointer"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {currentUser && (
            <Link
              href="/chat"
              className="relative rounded-lg p-2 text-muted-foreground cursor-pointer"
              title="Buka History Chat"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900"></span>
            </Link>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {currentUser ? (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.fullName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <p className="text-sm font-semibold leading-tight text-slate-800 dark:text-white truncate max-w-[200px]">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] leading-none text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">
                    {roleLabels[currentUser.role]}
                  </p>
                </div>
              </div>
              
              <Link
                href="/chat"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-blue-600 text-white text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-full max-w-[16px] text-white" />
                <span>Buka Direct Chat</span>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={currentUser.role === 'OWNER' ? '/owner' : currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-border text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  Dashboard Saya
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-center text-xs font-bold flex items-center justify-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl bg-primary text-white text-center text-xs font-bold shadow shadow-primary/10"
              >
                Masuk Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl border border-border text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Daftar Akun Baru
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
