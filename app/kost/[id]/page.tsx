'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { Kost, Review } from '@/app/types';
import VerificationBadge from '@/components/VerificationBadge';
import AvailabilityIndicator from '@/components/AvailabilityIndicator';
import VideoTour from '@/components/VideoTour';
import ReviewCard from '@/components/ReviewCard';
import CheckoutModal from '@/components/CheckoutModal';
import { Heart, GitCompare, Star, MapPin, Compass, Shield, Wifi, Tv, Refrigerator, Wind, Utensils, Key, ShieldCheck, Phone, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, Send, Calendar, Users, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function KostDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { kosts, reviews, favorites, compareList, toggleFavorite, toggleCompare, addToRecentlyViewed, addReview, currentUser, showToast, incrementKostViews, inquiries, bookingPayments, createBookingPayment, executeMockPayment, platformSettings, campuses, getKostDistance } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const kost = kosts.find((k) => k.id === id);

  const studentInquiry = inquiries?.find(
    (inq) => inq.studentId === currentUser?.id && inq.kostId === kost?.id
  );

  const bookingPayment = studentInquiry
    ? bookingPayments?.find((p) => p.inquiryId === studentInquiry.id)
    : null;

  const isAuthorized = currentUser && (currentUser.role === 'ADMIN' || currentUser.id === kost?.ownerId);
  const isVisible = kost && (!kost.isDeleted && (kost.verifiedStatus !== 'none' || isAuthorized));

  const viewedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (isVisible && kost && viewedIdRef.current !== kost.id) {
      viewedIdRef.current = kost.id;
      addToRecentlyViewed(kost.id);
      
      // Increment views count if the visitor is NOT the owner or admin
      if (!isAuthorized) {
        incrementKostViews(kost.id);
      }
    }
  }, [id, kost, isVisible, isAuthorized, addToRecentlyViewed, incrementKostViews]);

  if (!isVisible || !kost) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kos Tidak Ditemukan</h3>
        <p className="text-sm text-muted-foreground">Kosan tidak terdaftar di database VeriKost Malang, atau belum melewati proses verifikasi admin.</p>
        <Link href="/search" className="rounded-full bg-primary text-white font-bold text-xs py-2.5 px-6 shadow">
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  const isFavorited = favorites.includes(kost.id);
  const isCompared = compareList.includes(kost.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const kostReviews = reviews.filter((r) => r.kostId === kost.id && r.status === 'approved');

  const getFacilityIcon = (name: string) => {
    const facilitiesMap: Record<string, React.ReactNode> = {
      'AC': <Wind className="h-4.5 w-4.5 text-blue-500" />,
      'WiFi': <Wifi className="h-4.5 w-4.5 text-blue-500" />,
      'Kamar Mandi Dalam': <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />,
      'Water Heater': <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />,
      'TV Smart': <Tv className="h-4.5 w-4.5 text-blue-500" />,
      'Kulkas Kecil': <Refrigerator className="h-4.5 w-4.5 text-blue-500" />,
      'Dapur Bersama': <Utensils className="h-4.5 w-4.5 text-orange-500" />,
      'CCTV': <Shield className="h-4.5 w-4.5 text-blue-500" />,
      'Security 24 Jam': <Shield className="h-4.5 w-4.5 text-emerald-500" />,
      'Penjaga 24 Jam': <Shield className="h-4.5 w-4.5 text-emerald-500" />,
      'Parkir Motor': <Compass className="h-4.5 w-4.5 text-slate-500" />,
      'Parkir Mobil': <Compass className="h-4.5 w-4.5 text-slate-500" />,
      'Kasur Springbed': <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />,
      'Lemari Pakaian': <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />,
      'Meja Belajar': <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />
    };

    return facilitiesMap[name] || <CheckCircle2 className="h-4.5 w-4.5 text-slate-400" />;
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Silakan masuk akun terlebih dahulu untuk menulis ulasan.', 'info');
      router.push('/login');
      return;
    }
    if (newComment.trim()) {
      addReview(kost.id, currentUser.fullName, newRating, newComment);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
      }, 4000);
    }
  };

  const genderLabels = {
    male: { label: 'Khusus Putra', bg: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400' },
    female: { label: 'Khusus Putri', bg: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400' },
    mixed: { label: 'Kost Campur', bg: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400' }
  };

  const gender = genderLabels[kost.genderCategory] || { label: 'Boarding House', bg: 'bg-gray-100' };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      <section className="bg-white dark:bg-slate-900 border-b border-border py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>Kembali ke Pencarian</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCompare(kost.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold shadow-sm transition-colors ${
                isCompared
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400'
                  : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <GitCompare className="h-4 w-4" />
              <span>{isCompared ? 'Bandingkan ✓' : 'Bandingkan Kost'}</span>
            </button>
            <button
              onClick={() => toggleFavorite(kost.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold shadow-sm transition-colors ${
                isFavorited
                  ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:bg-muted hover:text-rose-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFavorited ? 'Tersimpan' : 'Simpan Kost'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                
                <div className="flex border-b border-border bg-slate-50 dark:bg-slate-900 px-4 py-2 justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveMediaTab('photos')}
                      className={`text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg transition-colors ${
                        activeMediaTab === 'photos'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Galeri Foto ({kost.images.length})
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('video')}
                      className={`text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg transition-colors ${
                        activeMediaTab === 'video'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Video Room Tour
                    </button>
                  </div>
                  <VerificationBadge status={kost.verifiedStatus} size="md" />
                </div>

                <div className="relative aspect-video bg-black flex items-center justify-center">
                  {activeMediaTab === 'photos' ? (
                    <div className="relative h-full w-full">
                      <img
                        src={kost.images[activeImageIdx]}
                        alt={`${kost.name} - Cover ${activeImageIdx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      
                      {kost.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImageIdx((idx) => (idx === 0 ? kost.images.length - 1 : idx - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 shadow transition-transform hover:scale-105"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setActiveImageIdx((idx) => (idx === kost.images.length - 1 ? 0 : idx + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 shadow transition-transform hover:scale-105"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      <span className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] font-bold rounded px-2.5 py-1">
                        Foto {activeImageIdx + 1} dari {kost.images.length}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <VideoTour videoUrl={kost.videoTour} posterImage={kost.images[0]} />
                    </div>
                  )}
                </div>

                {activeMediaTab === 'photos' && kost.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto bg-slate-50 dark:bg-slate-900 border-t border-border">
                    {kost.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          activeImageIdx === idx ? 'border-primary scale-102 ring-2 ring-primary/20' : 'border-transparent hover:opacity-80'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

              </div>

              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block rounded-lg px-3 py-1 text-xs font-bold border uppercase tracking-wider ${gender.bg}`}>
                      {gender.label}
                    </span>
                    <AvailabilityIndicator availability={kost.roomAvailability} />
                  </div>

                  {kost.rating !== null && kost.rating !== undefined ? (
                    <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-sm">
                      <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                      <span>{kost.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground font-medium">({kostReviews.length} ulasan)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">Belum ada ulasan</span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {kost.name}
                </h1>

                <div className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <span>{kost.address}</span>
                </div>
              </div>
              {(() => {
                const campusColorSchemes = [
                  { bg: 'bg-blue-50/40 dark:bg-slate-950 border-blue-100 dark:border-slate-800', text: 'text-primary' },
                  { bg: 'bg-emerald-50/40 dark:bg-slate-950 border-emerald-100 dark:border-slate-800', text: 'text-emerald-600 dark:text-emerald-400' },
                  { bg: 'bg-purple-50/40 dark:bg-slate-950 border-purple-100 dark:border-slate-800', text: 'text-purple-600 dark:text-purple-400' },
                  { bg: 'bg-amber-50/40 dark:bg-slate-950 border-amber-100 dark:border-slate-800', text: 'text-amber-600 dark:text-amber-400' },
                  { bg: 'bg-rose-50/40 dark:bg-slate-950 border-rose-100 dark:border-slate-800', text: 'text-rose-600 dark:text-rose-400' },
                ];

                const activeCampusDistances = campuses
                  .filter(c => c.isVisible)
                  .map(c => ({
                    campus: c,
                    distance: getKostDistance(kost, c.id)
                  }))
                  .filter(item => item.distance > 0);

                if (activeCampusDistances.length === 0) return null;

                return (
                  <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Compass className="h-5 w-5 text-primary" />
                      Jarak Presisi ke Kampus Malang
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Penghitungan jarak rute jalan kaki/berkendara tercepat dari gerbang kosan menuju pintu utama kampus-kampus di Malang yang aktif.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      {activeCampusDistances.map((item, idx) => {
                        const scheme = campusColorSchemes[idx % campusColorSchemes.length];
                        return (
                          <div key={item.campus.id} className={`p-4 rounded-2xl border ${scheme.bg} space-y-1`}>
                            <p className="text-xs text-slate-500 font-semibold">{item.campus.name}</p>
                            <p className={`text-xl font-black leading-none ${scheme.text}`}>{item.distance} km</p>
                            <p className="text-[10px] text-muted-foreground mt-2">± {Math.round(item.distance * 12)} menit perjalanan</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Fasilitas Hunian</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {kost.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border/60">
                      {getFacilityIcon(fac)}
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="h-5 w-5 text-primary animate-pulse" />
                  Keamanan & Aturan Hunian
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kami mengaudit kelengkapan proteksi fisik kosan secara menyeluruh demi kenyamanan penghuni.
                </p>
                <div className="p-4 rounded-2xl border border-border bg-slate-50 dark:bg-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {kost.securityInfo}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tentang Kost Ini</h3>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {kost.description}
                </p>
              </div>

            </div>

            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-md sticky top-24 space-y-6">
                
                <div>
                  <span className="text-xs text-muted-foreground leading-none font-semibold">Harga Sewa Bulanan</span>
                  <p className="text-2xl font-black text-primary mt-1 leading-none">
                    {formatPrice(kost.price)}
                    <span className="text-xs font-normal text-muted-foreground"> / kamar</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    *Harga sewa sudah termasuk iuran sampah dan kebersihan luar.
                  </p>
                </div>

                <div className="border-t border-border/80 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Tanya Pemilik Kost
                  </h4>

                  {currentUser && currentUser.id === kost.ownerId ? (
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-border p-4 rounded-2xl text-center space-y-3">
                      <Building2 className="h-8 w-8 text-primary mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Ini Adalah Kost Anda</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Anda terdaftar sebagai pemilik properti ini. Kelola ketersediaan kamar, lihat statistik kunjungan, atau hubungi calon penyewa di Dashboard Pemilik Anda.
                        </p>
                      </div>
                      <Link
                        href="/owner"
                        className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-[11px] py-2.5 shadow-md shadow-primary/20 transition-all hover:scale-102"
                      >
                        Buka Dashboard Pemilik
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Punya pertanyaan seputar ketersediaan kamar, fasilitas, aturan kost, atau ingin menjadwalkan survey langsung ke lokasi?
                      </p>
                      <Link
                        href={`/chat?ownerId=${kost.ownerId}&kostName=${encodeURIComponent(kost.name)}`}
                        className="w-full rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs py-3 flex items-center justify-center gap-2 transition-all hover:scale-102 shadow-md shadow-primary/10 text-center cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat Langsung dengan Pemilik</span>
                      </Link>
                    </div>
                  )}
                </div>

                {studentInquiry && (
                  <div className="border-t border-border/80 pt-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" />
                      Status Pemesanan Online
                    </h4>
                    
                    {studentInquiry.status === 'pending' && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-border space-y-1">
                        <p className="text-[10px] font-bold text-slate-800 dark:text-white">Pengajuan: Pending</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Menunggu tanggapan dari pemilik kost untuk menyetujui pemesanan kamar Anda.
                        </p>
                      </div>
                    )}

                    {studentInquiry.status === 'rejected' && (
                      <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-3 rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Pengajuan Ditolak</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Maaf, pengajuan booking Anda belum disetujui oleh pemilik kost.
                        </p>
                      </div>
                    )}

                    {studentInquiry.status === 'approved' && (
                      <div className="space-y-2.5">
                        {!bookingPayment && (
                          <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-2xl space-y-3">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Pengajuan Disetujui!</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                {kost.bookingDpAmount && kost.bookingDpAmount > 0 
                                  ? `Amankan kamar Anda dengan membayar Down Payment sebesar ${formatPrice(kost.bookingDpAmount)}.`
                                  : 'Kost ini tidak memerlukan pembayaran DP. Silakan chat pemilik untuk proses check-in.'}
                              </p>
                            </div>
                            {kost.bookingDpAmount && kost.bookingDpAmount > 0 && (
                              <button
                                onClick={() => createBookingPayment(studentInquiry.id)}
                                className="w-full rounded-xl bg-primary hover:brightness-110 text-white font-bold text-[10px] py-2 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border-0"
                              >
                                <span>Bayar DP Sekarang</span>
                              </button>
                            )}
                          </div>
                        )}

                        {bookingPayment && bookingPayment.status === 'pending' && (() => {
                          const displayAmount = bookingPayment.dpAmount;
                          return (
                            <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-2xl space-y-3">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-455">Tagihan DP Aktif</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  Selesaikan pembayaran sebesar **{formatPrice(displayAmount)}** sebelum kedaluwarsa.
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold block pt-1">
                                  Batas Waktu: 24 Jam sejak pengajuan.
                                </p>
                              </div>
                              <button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="w-full rounded-xl bg-primary hover:brightness-110 text-white font-bold text-[10px] py-2 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border-0"
                              >
                                <span>Bayar Sekarang</span>
                              </button>
                            </div>
                          );
                        })()}

                        {bookingPayment && bookingPayment.status === 'paid' && (
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 p-3 rounded-2xl space-y-1">
                            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-455 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              <span>Booking Kamar Sukses!</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              DP sebesar **{formatPrice(bookingPayment.dpAmount)}** telah lunas dibayarkan via {bookingPayment.paymentMethod} pada {new Date(bookingPayment.paidAt || '').toLocaleDateString('id-ID')}.
                            </p>
                          </div>
                        )}

                        {bookingPayment && bookingPayment.status === 'expired' && (
                          <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-3 rounded-2xl space-y-1">
                            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-455">Pembayaran Kedaluwarsa</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Batas waktu pembayaran DP terlampaui. Kamar dibebaskan kembali.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-border/80 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Profil Pemilik Kost
                  </h4>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-border/60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary text-sm font-black">
                      OP
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
                        <span>{kost.ownerName}</span>
                        <span title="Identitas KTP Terverifikasi Surveyor">
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Pemilik Aktif VeriKost</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{kost.ownerPhone}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="mt-12 bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ulasan & Rating Penghuni</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Testimoni nyata dari penyewa kamar yang pernah tinggal di kost ini.</p>
              </div>

              {kost.rating !== null && kost.rating !== undefined ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-xl border border-border/80">
                  <span className="text-2xl font-black text-amber-500">{kost.rating.toFixed(1)}</span>
                  <div className="text-left">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.round(kost.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase">{kostReviews.length} Ulasan Terverifikasi</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-semibold bg-slate-50 dark:bg-slate-800 py-2 px-3 rounded-xl border border-border/80">
                  Belum ada ulasan
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kostReviews.length === 0 ? (
                <div className="md:col-span-2 text-center p-8 text-muted-foreground bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-border text-sm font-semibold">
                  Belum Ada Ulasan. Jadilah yang pertama memberikan ulasan untuk kost ini!
                </div>
              ) : (
                kostReviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
              )}
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="h-5 w-5 text-primary" />
                Tulis Ulasan Kamar Anda
              </h3>
              <p className="text-xs text-muted-foreground">
                Bantu mahasiswa lain menemukan kos idaman mereka. Ulasan Anda akan diberi lencana "Penyewa Terverifikasi" jika status sewa Anda terdaftar.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-2xl bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-border">
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Penilaian Anda:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-500">({newRating} Bintang)</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis ulasan jujur tentang kebersihan kamar, keramahan bapak kos, kecepatan WiFi, aliran air mandi..."
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    required
                  />
                </div>

                {reviewSuccess ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold text-center border border-emerald-200/50">
                    ✓ Terima kasih! Ulasan Anda telah terkirim dan sedang menunggu verifikasi oleh Admin sebelum diterbitkan secara publik.
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-xs py-3 px-6 shadow-md shadow-primary/20 transition-transform hover:scale-102 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Terbitkan Ulasan Saya
                  </button>
                )}

              </form>
            </div>

          </div>

        </div>
      </section>

      {bookingPayment && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          amount={bookingPayment.dpAmount}
          dpAmount={bookingPayment.dpAmount}
          paymentId={bookingPayment.id}
          executeMockPayment={executeMockPayment}
        />
      )}
    </div>
  );
}
