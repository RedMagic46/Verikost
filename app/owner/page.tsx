'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Menu,
  Sun,
  Moon,
  LogOut,
  Edit,
  User as UserIcon
} from 'lucide-react';

// Import Modular Tab Components
import OwnerSidebar from './components/OwnerSidebar';
import OverviewTab from './components/OverviewTab';
import PropertiesTab from './components/PropertiesTab';
import RoomsTab from './components/RoomsTab';
import TenantsTab from './components/TenantsTab';
import PaymentsTab from './components/PaymentsTab';
import ReviewsTab from './components/ReviewsTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import VerificationsTab from './components/VerificationsTab';
import ChatTab from './components/ChatTab';

export default function OwnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['OWNER']}>
      <OwnerDashboardContent />
    </ProtectedRoute>
  );
}

function OwnerDashboardContent() {
  const { 
    currentUser, 
    kosts, 
    reviews,
    inquiries, 
    rooms,
    tenants,
    invoices,
    updateKostAvailability, 
    updateInquiryStatus, 
    addKost,
    deleteKost,
    ownerVerifications,
    kostVerifications,
    logout,
    showToast,
    updateProfile,
    addRoom,
    updateRoom,
    deleteRoom,
    bulkUpdateRoomStatus,
    addTenant,
    updateTenant,
    deleteTenant,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    bulkGenerateInvoices,
    replyToReview,
    submitKostVerification
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'overview' | 'properties' | 'rooms' | 'tenants' | 'payments' | 'chat' | 'reviews' | 'verifications' | 'reports' | 'settings'>('overview');

  useEffect(() => {
    if (currentUser?.id) {
      const savedTab = localStorage.getItem(`vk_owner_tab_${currentUser.id}`);
      if (savedTab) {
        setActiveTabState(savedTab as any);
      }
    }
  }, [currentUser?.id]);

  const setActiveTab = (tab: 'overview' | 'properties' | 'rooms' | 'tenants' | 'payments' | 'chat' | 'reviews' | 'verifications' | 'reports' | 'settings') => {
    setActiveTabState(tab);
    if (currentUser?.id) {
      localStorage.setItem(`vk_owner_tab_${currentUser.id}`, tab);
    }
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme Handling
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

  // Verification Status of Current Owner
  const myVerification = useMemo(() => {
    if (!currentUser) return null;
    return ownerVerifications.find((ov) => ov.ownerId === currentUser.id);
  }, [ownerVerifications, currentUser]);

  const isApprovedOwner = myVerification?.status === 'approved';

  // Subscription Status of Current Owner
  const isSubscriptionActive = useMemo(() => {
    if (!currentUser || !currentUser.subscriptionExpiresAt) return false;
    return new Date(currentUser.subscriptionExpiresAt) > new Date();
  }, [currentUser]);

  const handleUpdateInquiryStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!isSubscriptionActive) {
      showToast('Gagal: Akun langganan pemilik Anda telah habis. Harap aktifkan langganan terlebih dahulu.', 'error');
      return;
    }
    await updateInquiryStatus(id, status);
  };

  // Filtered Owner Properti & Data Associated
  const myKosts = useMemo(() => {
    if (!currentUser) return [];
    return kosts.filter((k) => k.ownerId === currentUser.id);
  }, [kosts, currentUser]);

  const myRooms = useMemo(() => {
    return rooms.filter((r) => myKosts.some((k) => k.id === r.kostId));
  }, [rooms, myKosts]);

  const myTenants = useMemo(() => {
    return tenants.filter((t) => myKosts.some((k) => k.id === t.kostId));
  }, [tenants, myKosts]);

  const myInvoices = useMemo(() => {
    return invoices.filter((inv) => myKosts.some((k) => k.id === inv.kostId));
  }, [invoices, myKosts]);

  const myInquiries = useMemo(() => {
    return inquiries.filter((inq) => myKosts.some((k) => k.id === inq.kostId));
  }, [inquiries, myKosts]);

  const myReviews = useMemo(() => {
    return reviews.filter((rev) => myKosts.some((k) => k.id === rev.kostId));
  }, [reviews, myKosts]);

  const handleOpenEditProfile = () => {
    setActiveTab('settings');
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar - Desktop & Mobile Drawer */}
      <OwnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        logout={logout}
        invoices={myInvoices}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        handleOpenEditProfile={handleOpenEditProfile}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72">
        
        {/* Header Sticky */}
        <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors duration-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Hamburger button on Mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl border border-border text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                aria-label="Buka Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden md:block">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Control Panel / {activeTab}
                </span>
              </div>
            </div>

            {/* Profile Summary & Verification Indicator */}
            <div className="flex items-center gap-4">
              
              {isApprovedOwner ? (
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-1.5 rounded-full border border-emerald-250/30 dark:border-emerald-900/30 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Akun Terverifikasi</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-3.5 py-1.5 rounded-full border border-amber-250/30 dark:border-amber-900/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Menunggu Verifikasi</span>
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
                title="Ganti Tema"
              >
                {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              <div className="pl-3 border-l border-border flex items-center gap-3">
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.fullName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                />
                <div className="hidden sm:block text-left text-xs shrink-0 font-medium">
                  <p className="font-extrabold text-slate-800 dark:text-white leading-tight">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
                    Mitra Owner
                  </p>
                </div>
              </div>

            </div>

          </div>
        </header>

        {/* Subscription Alert Banner */}
        {isApprovedOwner && !isSubscriptionActive && (
          <div className="bg-amber-500 text-white px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-bold text-xs shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-white shrink-0 animate-pulse" />
              <span>
                Akun Langganan Pemilik Anda tidak aktif atau telah kedaluwarsa. Fitur menambah kost baru dan persetujuan inquiry sewa dinonaktifkan sementara.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-1.5 bg-white text-amber-600 hover:bg-slate-50 rounded-lg shrink-0 font-extrabold uppercase tracking-wider text-[10px] shadow-sm transition-all hover:scale-102 cursor-pointer"
            >
              Aktifkan Langganan Sekarang
            </button>
          </div>
        )}

        {/* Dashboard Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* 1. Pending Screen (If Owner Account is not verified) */}
          {!isApprovedOwner ? (
            <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-8 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="h-16 w-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow">
                <Clock className="h-8 w-8 animate-spin-slow" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Pengajuan Verifikasi Akun Owner</h2>
                
                {myVerification?.status === 'rejected' ? (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-450 font-bold mt-2">
                    <span>Maaf, pengajuan dokumen legalitas dan bukti kepemilikan Anda ditolak oleh admin. Periksa kembali keabsahan sertifikat dan kelayakan properti Anda.</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto font-semibold">
                    Halo <strong>{currentUser.fullName}</strong>. Akun pemilik kost Anda saat ini sedang dalam evaluasi kelayakan administrasi oleh Admin VeriKost Malang. Surveyor kami akan menjadwalkan survei ke lokasi kost fisik Anda dalam waktu 2x24 jam.
                  </p>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-border/80 text-left space-y-3 text-xs font-bold">
                <span className="font-extrabold uppercase text-[10px] text-primary tracking-wider block">Alur Peninjauan Surveyor:</span>
                <ul className="space-y-3 text-slate-600 dark:text-slate-300 font-semibold">
                  <li className="flex gap-2.5 items-start">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Registrasi Awal & Klaim Properti ({currentUser.kostName || 'Kost Baru'}) — <strong>SELESAI</strong></span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <div className="h-4.5 w-4.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0 mt-0.5"></div>
                    <span>Pemeriksaan Sertifikat Hak Milik (SHM) & Izin Operasional oleh Admin — <strong>DALAM PENINJAUAN</strong></span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <Clock className="h-4.5 w-4.5 text-slate-300 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-400">Kunjungan lapangan surveyor fisik, pengukuran luas kamar, dan perekaman video tur resmi.</span>
                  </li>
                </ul>
              </div>

              <p className="text-[10px] text-muted-foreground font-semibold">
                Terima kasih atas kesabaran Anda. Kami mengutamakan kepercayaan calon mahasiswa dan orang tua di Malang.
              </p>
            </div>
          ) : (
            
            /* 2. Tab switcher (If Owner Account is approved/verified) */
            <div className="animate-in fade-in duration-300">
              {activeTab === 'overview' && (
                <OverviewTab 
                  myKosts={myKosts} 
                  myRooms={myRooms} 
                  myTenants={myTenants} 
                  myInvoices={myInvoices} 
                  myInquiries={myInquiries}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'properties' && (
                <PropertiesTab 
                  myKosts={myKosts} 
                  addKost={addKost}
                  deleteKost={deleteKost}
                  updateKostAvailability={updateKostAvailability}
                  showToast={showToast}
                  isSubscriptionActive={isSubscriptionActive}
                />
              )}

              {activeTab === 'rooms' && (
                <RoomsTab 
                  myKosts={myKosts} 
                  myRooms={myRooms} 
                  myTenants={myTenants}
                  addRoom={addRoom}
                  updateRoom={updateRoom}
                  deleteRoom={deleteRoom}
                  bulkUpdateRoomStatus={bulkUpdateRoomStatus}
                  showToast={showToast}
                />
              )}

              {activeTab === 'tenants' && (
                <TenantsTab 
                  myKosts={myKosts} 
                  myRooms={myRooms} 
                  myTenants={myTenants}
                  addTenant={addTenant}
                  updateTenant={updateTenant}
                  deleteTenant={deleteTenant}
                  showToast={showToast}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsTab 
                  myKosts={myKosts} 
                  myRooms={myRooms} 
                  myTenants={myTenants}
                  myInvoices={myInvoices}
                  addInvoice={addInvoice}
                  updateInvoice={updateInvoice}
                  deleteInvoice={deleteInvoice}
                  bulkGenerateInvoices={bulkGenerateInvoices}
                  showToast={showToast}
                />
              )}

              {activeTab === 'chat' && (
                <ChatTab />
              )}

              {activeTab === 'reviews' && (
                <ReviewsTab 
                  myKosts={myKosts}
                  myReviews={myReviews}
                  replyToReview={replyToReview}
                  showToast={showToast}
                />
              )}

              {activeTab === 'verifications' && (
                <VerificationsTab 
                  myKosts={myKosts}
                  kostVerifications={kostVerifications}
                  submitKostVerification={submitKostVerification}
                  showToast={showToast}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab 
                  myKosts={myKosts}
                  myRooms={myRooms}
                  myTenants={myTenants}
                  myInvoices={myInvoices}
                  showToast={showToast}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab 
                  currentUser={currentUser}
                  updateProfile={updateProfile}
                  showToast={showToast}
                />
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
