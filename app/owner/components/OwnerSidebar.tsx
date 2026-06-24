'use client';

import React from 'react';
import { User, Inquiry, Invoice } from '@/app/types';
import { 
  LayoutDashboard, 
  Building2, 
  BedDouble, 
  Users, 
  Wallet, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Edit,
  X
} from 'lucide-react';
import Link from 'next/link';

interface OwnerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: User;
  logout: () => void;
  inquiries: Inquiry[];
  invoices: Invoice[];
  isDarkMode: boolean;
  toggleTheme: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  handleOpenEditProfile: () => void;
}

export default function OwnerSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  logout,
  inquiries,
  invoices,
  isDarkMode,
  toggleTheme,
  isMobileOpen = false,
  setIsMobileOpen,
  handleOpenEditProfile
}: OwnerSidebarProps) {

  const pendingInquiriesCount = inquiries.filter(
    (i) => i.status === 'pending'
  ).length;

  const unpaidInvoicesCount = invoices.filter(
    (inv) => inv.status === 'unpaid' || inv.status === 'overdue'
  ).length;

  const menuItems = [
    { id: 'overview', name: 'Overview & Analytics', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { id: 'properties', name: 'Properti Saya', icon: <Building2 className="h-4.5 w-4.5" /> },
    { id: 'rooms', name: 'Manajemen Kamar', icon: <BedDouble className="h-4.5 w-4.5" /> },
    { id: 'tenants', name: 'Penyewa & Kontrak', icon: <Users className="h-4.5 w-4.5" /> },
    { 
      id: 'payments', 
      name: 'Pembayaran & Tagihan', 
      icon: <Wallet className="h-4.5 w-4.5" />,
      badge: unpaidInvoicesCount 
    },
    { 
      id: 'inquiries', 
      name: 'Inquiry & Lead', 
      icon: <Mail className="h-4.5 w-4.5" />,
      badge: pendingInquiriesCount 
    },
    { id: 'reviews', name: 'Ulasan & Reputasi', icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { id: 'verifications', name: 'Verifikasi Kost', icon: <ShieldCheck className="h-4.5 w-4.5" /> },
    { id: 'reports', name: 'Laporan', icon: <FileText className="h-4.5 w-4.5" /> },
    { id: 'settings', name: 'Pengaturan', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-border/80 transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="VeriKost Logo" 
            className="h-8 w-8 object-contain shrink-0" 
          />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
              VeriKost<span className="brand-gradient-text">Malang</span>
            </span>
            <span className="text-[8px] font-black text-primary bg-primary/10 border border-primary/20 py-0.5 px-1.5 rounded mt-1 uppercase tracking-wider text-center">
              Mitra Owner
            </span>
          </div>
        </div>
        {setIsMobileOpen && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Owner Profile Panel */}
      <div className="px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-border/60">
          <img
            src={currentUser.profileImage}
            alt={currentUser.fullName}
            className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">
                {currentUser.fullName}
              </p>
              <button
                onClick={handleOpenEditProfile}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                title="Edit Profil"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Pemilik Kost</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setIsMobileOpen) setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white text-primary' : 'bg-rose-500 text-white'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Dedicated Chat Hub Link */}
        <Link
          href="/chat"
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4.5 w-4.5 text-primary" />
            <span className="brand-gradient-text">Buka Chat Hub</span>
          </div>
        </Link>
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-border/60 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full py-2 px-4 rounded-xl border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-500" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>

        <button
          onClick={logout}
          className="w-full py-2 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Sistem</span>
        </button>

        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">
          VeriKost Owner v1.2.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Aside Fixed */}
      <aside className="w-72 hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen?.(false)}
        >
          <div 
            className="w-72 h-full animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
