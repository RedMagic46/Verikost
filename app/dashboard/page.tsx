'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/app/context/AppContext';
import KostCard from '@/components/KostCard';
import ReviewCard from '@/components/ReviewCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  GraduationCap, 
  Heart, 
  Clock, 
  MessageSquare, 
  Mail, 
  Phone, 
  Award, 
  Compass, 
  Star, 
  User, 
  ShieldCheck, 
  GitCompare, 
  SlidersHorizontal,
  CreditCard,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Unlink,
  QrCode,
  Landmark,
  CircleDollarSign,
  X,
  Receipt,
  Home,
  DoorOpen,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'PARENT']}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}

/* =============================== PAYMENT MODAL =============================== */

interface PaymentModalProps {
  invoice: {
    id: string;
    amount: number;
    periodMonth: string;
    periodYear: string;
    kostName?: string;
  };
  onClose: () => void;
  onPay: (invoiceId: string, method: string) => Promise<void>;
}

function PaymentModal({ invoice, onClose, onPay }: PaymentModalProps) {
  const [step, setStep] = useState<'select' | 'detail' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  const methods = [
    { id: 'va_bca', label: 'Bank BCA', sub: 'Virtual Account', icon: <Landmark className="h-5 w-5" />, color: 'text-blue-600' },
    { id: 'va_mandiri', label: 'Bank Mandiri', sub: 'Virtual Account', icon: <Landmark className="h-5 w-5" />, color: 'text-amber-600' },
    { id: 'va_bri', label: 'Bank BRI', sub: 'Virtual Account', icon: <Landmark className="h-5 w-5" />, color: 'text-blue-800' },
    { id: 'qris', label: 'QRIS', sub: 'Scan QR Code', icon: <QrCode className="h-5 w-5" />, color: 'text-purple-600' },
  ];

  const generateVANumber = () => {
    return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  };

  const vaNumber = useMemo(() => generateVANumber(), []);

  const handlePay = async () => {
    setProcessing(true);
    try {
      await onPay(invoice.id, selectedMethod);
      setStep('success');
    } catch {
      // error handled by context
    } finally {
      setProcessing(false);
    }
  };

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const periodLabel = `${monthNames[parseInt(invoice.periodMonth) - 1] || invoice.periodMonth} ${invoice.periodYear}`;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border/80 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {step === 'success' ? '✅ Pembayaran Berhasil' : 'Simulasi Pembayaran'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{invoice.kostName || 'Tagihan'} — {periodLabel}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Amount */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800/60 rounded-2xl p-4 text-center border border-primary/10 dark:border-primary/20">
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70 mb-1">Total Tagihan</p>
            <p className="text-2xl font-black text-primary">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(invoice.amount)}
            </p>
          </div>

          {step === 'select' && (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Metode Pembayaran:</p>
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMethod(m.id); setStep('detail'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-border/80 dark:border-slate-800 hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-primary/5 transition-all text-left cursor-pointer group"
                >
                  <div className={`h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${m.color} group-hover:scale-105 transition-transform`}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{m.label}</p>
                    <p className="text-[11px] text-slate-500">{m.sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}

          {step === 'detail' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('select')} className="text-xs font-bold text-primary hover:underline cursor-pointer">← Ganti Metode</button>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {methods.find(m => m.id === selectedMethod)?.label}
                </span>
              </div>

              {selectedMethod === 'qris' ? (
                <div className="flex flex-col items-center py-4 space-y-3">
                  {/* Simulated QR code */}
                  <div className="w-48 h-48 bg-white border-2 border-slate-200 rounded-2xl p-3 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
                      <QrCode className="h-20 w-20 text-white/80" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center max-w-[240px]">
                    Scan QR di atas menggunakan aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, dll.)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Nomor Virtual Account</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-black text-slate-900 dark:text-white tracking-wider">{vaNumber}</p>
                      <button 
                        onClick={() => navigator.clipboard?.writeText(vaNumber)}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-1.5 pl-3 border-l-2 border-primary/20">
                    <p>1. Buka aplikasi m-banking / ATM</p>
                    <p>2. Pilih menu Transfer → Virtual Account</p>
                    <p>3. Masukkan nomor VA di atas</p>
                    <p>4. Konfirmasi dan bayar</p>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CircleDollarSign className="h-4 w-4" />
                )}
                {processing ? 'Memproses...' : 'Simulasikan Bayar Sukses'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">Tagihan Berhasil Dilunasi!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Metode: <span className="font-bold text-slate-700 dark:text-slate-300">{methods.find(m => m.id === selectedMethod)?.label}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Tanggal: <span className="font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all text-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================== MAIN DASHBOARD =============================== */

function UserDashboardContent() {
  const { 
    currentUser, favorites, recentlyViewed, reviews, kosts, compareList,
    tenants, invoices, rooms, users,
    generateParentCode, linkChild, unlinkChild, payInvoice
  } = useApp();

  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'history' | 'reviews' | 'compare' | 'kost-billing' | 'parent-link'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<{
    id: string; amount: number; periodMonth: string; periodYear: string; kostName?: string;
  } | null>(null);

  const favoritedKosts = kosts.filter((k) => favorites.includes(k.id));
  const historyKosts = kosts.filter((k) => recentlyViewed.includes(k.id));
  const comparedKosts = kosts.filter((k) => compareList.includes(k.id));
  const userReviews = reviews.filter((r) => r.userName === currentUser.fullName);

  const isStudent = currentUser.role === 'STUDENT';
  const isParent = currentUser.role === 'PARENT';
  const roleLabel = isStudent ? 'Mahasiswa Aktif' : 'Orang Tua';

  // STUDENT: find tenant record for current user by email match
  const myTenant = useMemo(() => {
    if (!isStudent) return null;
    return tenants.find(t => t.email === currentUser.email && t.status === 'active') || null;
  }, [isStudent, tenants, currentUser.email]);

  const myKost = useMemo(() => {
    if (!myTenant) return null;
    return kosts.find(k => k.id === myTenant.kostId) || null;
  }, [myTenant, kosts]);

  const myRoom = useMemo(() => {
    if (!myTenant || !myTenant.roomId) return null;
    return rooms.find(r => r.id === myTenant.roomId) || null;
  }, [myTenant, rooms]);

  const myInvoices = useMemo(() => {
    if (!myTenant) return [];
    return invoices.filter(inv => inv.tenantId === myTenant.id).sort((a, b) => {
      const dateA = `${a.periodYear}-${a.periodMonth}`;
      const dateB = `${b.periodYear}-${b.periodMonth}`;
      return dateB.localeCompare(dateA);
    });
  }, [myTenant, invoices]);

  // PARENT: find linked child
  const childProfile = useMemo(() => {
    if (!isParent || !currentUser.childId) return null;
    return users.find(u => u.id === currentUser.childId) || null;
  }, [isParent, currentUser.childId, users]);

  const childTenant = useMemo(() => {
    if (!childProfile) return null;
    return tenants.find(t => t.email === childProfile.email && t.status === 'active') || null;
  }, [childProfile, tenants]);

  const childKost = useMemo(() => {
    if (!childTenant) return null;
    return kosts.find(k => k.id === childTenant.kostId) || null;
  }, [childTenant, kosts]);

  const childRoom = useMemo(() => {
    if (!childTenant || !childTenant.roomId) return null;
    return rooms.find(r => r.id === childTenant.roomId) || null;
  }, [childTenant, rooms]);

  const childInvoices = useMemo(() => {
    if (!childTenant) return [];
    return invoices.filter(inv => inv.tenantId === childTenant.id).sort((a, b) => {
      const dateA = `${a.periodYear}-${a.periodMonth}`;
      const dateB = `${b.periodYear}-${b.periodMonth}`;
      return dateB.localeCompare(dateA);
    });
  }, [childTenant, invoices]);

  const handleCopyCode = () => {
    if (currentUser.parentCode) {
      navigator.clipboard?.writeText(currentUser.parentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLinkChild = async () => {
    setLinking(true);
    const success = await linkChild(linkCode);
    if (success) setLinkCode('');
    setLinking(false);
  };

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  // ========== Unpaid counts for badges ==========
  const unpaidStudentCount = myInvoices.filter(inv => inv.status !== 'paid').length;
  const unpaidChildCount = childInvoices.filter(inv => inv.status !== 'paid').length;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile header */}
        <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={currentUser.profileImage}
              alt={currentUser.fullName}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {currentUser.fullName}
                </h1>
                <span className={`inline-flex items-center gap-1 rounded py-0.5 px-2 text-[10px] font-bold border ${isStudent ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'}`}>
                  {isStudent ? <GraduationCap className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  {roleLabel}
                </span>
              </div>
              
              {isStudent && currentUser.university ? (
                <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <Compass className="h-4 w-4 text-slate-400" />
                  <span>{currentUser.university} {currentUser.major ? `(${currentUser.major})` : ''}</span>
                </p>
              ) : !isStudent && currentUser.occupation ? (
                <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span>Pekerjaan: {currentUser.occupation}</span>
                </p>
              ) : null}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {currentUser.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {currentUser.phone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center border-t md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0 pl-0 md:pl-8 shrink-0 w-full md:w-auto">
            <div>
              <p className="text-xl font-black text-primary leading-none">{favorites.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">Favorit</p>
            </div>
            <div>
              <p className="text-xl font-black text-primary leading-none">{recentlyViewed.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">Riwayat</p>
            </div>
            <div>
              <p className="text-xl font-black text-primary leading-none">{isStudent ? userReviews.length : compareList.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase">{isStudent ? 'Ulasan' : 'Bandingkan'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/60 overflow-x-auto gap-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Ringkasan Akun
          </button>

          {/* Kost & Tagihan for student */}
          {isStudent && (
            <button
              onClick={() => setActiveTab('kost-billing')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'kost-billing'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Kost & Tagihan
              {unpaidStudentCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center">{unpaidStudentCount}</span>
              )}
            </button>
          )}

          {/* Parent link tab */}
          {isParent && (
            <button
              onClick={() => setActiveTab('parent-link')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'parent-link'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              Akun Anak
              {currentUser.childId && unpaidChildCount > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center">{unpaidChildCount}</span>
              )}
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'favorites'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Kost Disimpan ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'history'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Baru Saja Dilihat ({recentlyViewed.length})
          </button>

          {isStudent ? (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Ulasan Saya ({userReviews.length})
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('compare')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'compare'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Riwayat Bandingkan ({compareList.length})
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          
          {/* ==================== OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="h-4.5 w-4.5 text-primary" />
                    Aktivitas Terakhir
                  </h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-primary hover:underline">
                    Lihat Semua
                  </button>
                </div>

                {historyKosts.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold shadow-sm">
                    Belum ada riwayat kost yang dibuka. Mulai jelajahi kost di Malang sekarang!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {historyKosts.slice(0, 2).map((k) => (
                      <KostCard key={k.id} kost={k} />
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="h-4.5 w-4.5 text-primary" />
                  Status Kepercayaan Akun
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-blue-100 dark:border-slate-800 text-xs">
                    <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-950 dark:text-slate-200">Sertifikasi Profil</h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {isStudent 
                          ? `Identitas mahasiswa anda pada universitas terdaftar (${currentUser.university}) aman.` 
                          : 'Akun orang tua terdaftar dengan nomor seluler WhatsApp tervalidasi.'}
                      </p>
                    </div>
                  </div>

                  {isStudent ? (
                    <>
                      <div className="flex items-start gap-3 bg-emerald-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-emerald-100 dark:border-slate-800 text-xs">
                        <Star className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-950 dark:text-slate-200">Hak Akses Ulasan</h4>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Sebagai mahasiswa aktif terverifikasi, ulasan Anda langsung mendapat tanda &quot;Penyewa Terverifikasi&quot;.</p>
                        </div>
                      </div>

                      {/* Parent code section */}
                      <div className="flex items-start gap-3 bg-violet-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-violet-100 dark:border-slate-800 text-xs">
                        <Link2 className="h-5 w-5 text-violet-500 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-bold text-slate-950 dark:text-slate-200">Kode Hubung Orang Tua</h4>
                          {currentUser.parentCode ? (
                            <div className="flex items-center gap-2">
                              <code className="bg-white dark:bg-slate-900 border border-violet-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-mono font-bold text-sm text-violet-700 dark:text-violet-300 tracking-wider">
                                {currentUser.parentCode}
                              </code>
                              <button onClick={handleCopyCode} className="text-violet-500 hover:bg-violet-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer">
                                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={generateParentCode}
                              className="bg-violet-500 hover:bg-violet-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Buat Kode Hubung
                            </button>
                          )}
                          <p className="text-slate-500 dark:text-slate-400 leading-tight">
                            Berikan kode ini ke orang tua Anda agar mereka dapat memantau status kos Anda.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-indigo-100 dark:border-slate-800 text-xs">
                      <GitCompare className="h-5 w-5 text-indigo-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-slate-200">Akses Informasi Keamanan</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Anda dapat mengakses secara utuh log informasi CCTV, gerbang pintu, dan pengawas kosan.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== KOST & BILLING (STUDENT) ==================== */}
          {isStudent && activeTab === 'kost-billing' && (
            <div className="space-y-6">
              {!myTenant ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold space-y-3">
                  <Home className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-base font-bold text-slate-600 dark:text-slate-300">Anda belum terdaftar di kost manapun</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Hubungi pemilik kost untuk didaftarkan sebagai penyewa. Email akun Anda ({currentUser.email}) akan digunakan untuk mencocokkan data.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Kost Info Card */}
                  <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm overflow-hidden">
                    {myKost?.images?.[0] && (
                      <div className="h-36 w-full overflow-hidden">
                        <img src={myKost.images[0]} alt={myKost.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4.5 w-4.5 text-primary shrink-0" />
                          {myKost?.name || 'Kost'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{myKost?.address}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        {myRoom && (
                          <div className="flex items-center justify-between bg-blue-50/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <DoorOpen className="h-3.5 w-3.5" /> Kamar
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{myRoom.roomNumber} (Lt. {myRoom.floor})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-700">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" /> Check-in
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{new Date(myTenant.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center justify-between bg-primary/5 dark:bg-slate-800/50 p-2.5 rounded-xl border border-primary/10 dark:border-slate-700">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <CreditCard className="h-3.5 w-3.5" /> Harga/bln
                          </span>
                          <span className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(myRoom?.price || myKost?.price || 0)}</span>
                        </div>
                      </div>

                      {/* Parent code section mini */}
                      <div className="pt-2 border-t border-border/60">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Kode Hubung Orang Tua</p>
                        {currentUser.parentCode ? (
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-violet-50 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-mono font-bold text-xs text-violet-700 dark:text-violet-300 tracking-wider text-center">
                              {currentUser.parentCode}
                            </code>
                            <button onClick={handleCopyCode} className="text-violet-500 hover:bg-violet-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0">
                              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={generateParentCode}
                            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="h-3 w-3" /> Buat Kode
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Receipt className="h-4.5 w-4.5 text-primary" />
                        Daftar Tagihan
                      </h3>
                      {unpaidStudentCount > 0 && (
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/30">
                          {unpaidStudentCount} Belum Lunas
                        </span>
                      )}
                    </div>

                    {myInvoices.length === 0 ? (
                      <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold">
                        Belum ada tagihan untuk Anda saat ini.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myInvoices.map(inv => {
                          const isPaid = inv.status === 'paid';
                          const isOverdue = inv.status === 'overdue';
                          return (
                            <div key={inv.id} className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isPaid ? 'border-emerald-200 dark:border-emerald-900/30' : isOverdue ? 'border-rose-200 dark:border-rose-900/30' : 'border-border'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : isOverdue ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'}`}>
                                  {isPaid ? <Check className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {monthNames[parseInt(inv.periodMonth) - 1]} {inv.periodYear}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Jatuh tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {isPaid && inv.paidDate && ` · Dibayar: ${new Date(inv.paidDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <p className={`text-sm font-bold flex-1 sm:flex-none ${isPaid ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.amount)}
                                </p>
                                {isPaid ? (
                                  <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/30 uppercase tracking-wide">
                                    Lunas ✓
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setPayingInvoice({ id: inv.id, amount: inv.amount, periodMonth: inv.periodMonth, periodYear: inv.periodYear, kostName: myKost?.name })}
                                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Bayar Sekarang
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== PARENT LINK ==================== */}
          {isParent && activeTab === 'parent-link' && (
            <div className="space-y-6">
              {!currentUser.childId ? (
                /* Unlinked state — show link form */
                <div className="max-w-lg mx-auto">
                  <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-8 shadow-sm space-y-6 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                      <Link2 className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hubungkan Akun Anak</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Masukkan Kode Hubung yang diberikan anak Anda untuk memantau status kos dan membayar tagihan mereka.
                      </p>
                    </div>
                    <div className="flex gap-3 max-w-xs mx-auto">
                      <input
                        type="text"
                        value={linkCode}
                        onChange={(e) => setLinkCode(e.target.value)}
                        placeholder="Contoh: VK-ABC123"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-center tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <button
                        onClick={handleLinkChild}
                        disabled={linking || !linkCode.trim()}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {linking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        Hubungkan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Linked state — show child info + invoices */
                <div className="space-y-6">
                  {/* Child profile info */}
                  <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={childProfile?.profileImage || '/default-avatar.png'}
                        alt={childProfile?.fullName || 'Anak'}
                        className="h-14 w-14 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-950/30"
                      />
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Akun Anak Terhubung</p>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{childProfile?.fullName}</h3>
                        <p className="text-xs text-slate-500">{childProfile?.email} · {childProfile?.university || 'Mahasiswa'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={unlinkChild}
                      className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/30 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Putus Hubungan
                    </button>
                  </div>

                  {!childTenant ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold space-y-2">
                      <Home className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>Anak Anda belum terdaftar di kost manapun saat ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Child Kost Info */}
                      <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-sm overflow-hidden">
                        {childKost?.images?.[0] && (
                          <div className="h-36 w-full overflow-hidden">
                            <img src={childKost.images[0]} alt={childKost.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              <Building2 className="h-4.5 w-4.5 text-primary shrink-0" />
                              {childKost?.name || 'Kost'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{childKost?.address}</p>
                          </div>
                          <div className="space-y-2 text-xs">
                            {childRoom && (
                              <div className="flex items-center justify-between bg-blue-50/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-blue-100 dark:border-slate-700">
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                  <DoorOpen className="h-3.5 w-3.5" /> Kamar
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">{childRoom.roomNumber} (Lt. {childRoom.floor})</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-slate-800/50 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-700">
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <CalendarDays className="h-3.5 w-3.5" /> Check-in
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">{new Date(childTenant.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center justify-between bg-primary/5 dark:bg-slate-800/50 p-2.5 rounded-xl border border-primary/10 dark:border-slate-700">
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <CreditCard className="h-3.5 w-3.5" /> Harga/bln
                              </span>
                              <span className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(childRoom?.price || childKost?.price || 0)}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border/60 text-xs">
                            <p className="text-slate-500">Pemilik: <span className="font-bold text-slate-700 dark:text-slate-300">{childKost?.ownerName}</span></p>
                            <p className="text-slate-500">Telepon: <span className="font-bold text-slate-700 dark:text-slate-300">{childKost?.ownerPhone}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Child Invoices */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Receipt className="h-4.5 w-4.5 text-primary" />
                            Tagihan Kost Anak
                          </h3>
                          {unpaidChildCount > 0 && (
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/30">
                              {unpaidChildCount} Belum Lunas
                            </span>
                          )}
                        </div>

                        {childInvoices.length === 0 ? (
                          <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold">
                            Belum ada tagihan untuk anak Anda saat ini.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {childInvoices.map(inv => {
                              const isPaid = inv.status === 'paid';
                              const isOverdue = inv.status === 'overdue';
                              return (
                                <div key={inv.id} className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isPaid ? 'border-emerald-200 dark:border-emerald-900/30' : isOverdue ? 'border-rose-200 dark:border-rose-900/30' : 'border-border'}`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : isOverdue ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'}`}>
                                      {isPaid ? <Check className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {monthNames[parseInt(inv.periodMonth) - 1]} {inv.periodYear}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        Jatuh tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {isPaid && inv.paidDate && ` · Dibayar: ${new Date(inv.paidDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <p className={`text-sm font-bold flex-1 sm:flex-none ${isPaid ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(inv.amount)}
                                    </p>
                                    {isPaid ? (
                                      <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/30 uppercase tracking-wide">
                                        Lunas ✓
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => setPayingInvoice({ id: inv.id, amount: inv.amount, periodMonth: inv.periodMonth, periodYear: inv.periodYear, kostName: childKost?.name })}
                                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                                      >
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Bayar untuk Anak
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== FAVORITES ==================== */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              {favoritedKosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold space-y-2">
                  <p>Belum ada kos-kosan terverifikasi yang Anda simpan.</p>
                  <Link href="/search" className="inline-block text-primary hover:underline font-bold text-xs">Jelajahi Kost Malang Sekarang →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoritedKosts.map((k) => (
                    <KostCard key={k.id} kost={k} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== HISTORY ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {historyKosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold space-y-2">
                  <p>Belum ada riwayat kost.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {historyKosts.map((k) => (
                    <KostCard key={k.id} kost={k} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== REVIEWS (STUDENT) ==================== */}
          {isStudent && activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              {userReviews.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold">
                  Anda belum pernah menulis ulasan kost.
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((rev) => {
                    const targetKost = kosts.find((k) => k.id === rev.kostId);
                    return (
                      <div key={rev.id} className="space-y-2">
                        {targetKost && (
                          <div className="pl-4 text-xs font-bold text-slate-500">
                            Ulasan untuk: <Link href={`/kost/${targetKost.id}`} className="text-primary hover:underline">{targetKost.name}</Link>
                          </div>
                        )}
                        <ReviewCard review={rev} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== COMPARE (PARENT) ==================== */}
          {!isStudent && activeTab === 'compare' && (
            <div className="space-y-6">
              {comparedKosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-border rounded-3xl text-sm text-slate-400 font-semibold space-y-2">
                  <p>Tidak ada kost dalam riwayat pembandingan aktif.</p>
                  <Link href="/search" className="inline-block text-primary hover:underline font-bold text-xs">Mulai Bandingkan Kost →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
                    <span className="text-xs text-muted-foreground font-semibold">
                      Anda sedang membandingkan <span className="font-bold text-primary">{comparedKosts.length}</span> kost sekaligus.
                    </span>
                    <Link href="/compare" className="text-xs bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow shadow-primary/10">
                      Buka Perbandingan Side-by-Side
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {comparedKosts.map((k) => (
                      <KostCard key={k.id} kost={k} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPay={payInvoice}
        />
      )}
    </div>
  );
}


function Briefcase({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v3.85c0 1.05-.85 1.9-1.9 1.9H5.65c-1.05 0-1.9-.85-1.9-1.9v-3.85m16.5 0a2.25 2.25 0 0 0-1.883-2.2H5.65a2.25 2.25 0 0 0-1.883 2.2m16.5 0V9a2.25 2.25 0 0 0-2.25-2.25h-3.863c-.172 0-.342-.047-.49-.136L12.79 5.39a1.125 1.125 0 0 0-.58-.14H11.79c-.208 0-.411.058-.58.14L9.94 6.614c-.148.089-.318.136-.49.136H5.65A2.25 2.25 0 0 0 3.375 9v5.15" />
    </svg>
  );
}
