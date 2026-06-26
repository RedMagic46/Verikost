'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './context/AppContext';
import KostCard from '@/components/KostCard';
import { Search, MapPin, BadgeCheck, GraduationCap, ShieldAlert, Award, Compass, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';

const campusOptions = [
  { value: '', label: 'Semua Kampus' },
  { value: 'ub', label: 'Dekat UB' },
  { value: 'um', label: 'Dekat UM' },
  { value: 'umm', label: 'Dekat UMM' }
];

const genderOptions = [
  { value: '', label: 'Semua Gender' },
  { value: 'male', label: 'Putra' },
  { value: 'female', label: 'Putri' },
  { value: 'mixed', label: 'Campur' }
];

export default function Home() {
  const router = useRouter();
  const { kosts } = useApp();
  const [keyword, setKeyword] = useState('');
  const [campus, setCampus] = useState('');
  const [gender, setGender] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('query', keyword.trim());
    if (campus) params.append('campus', campus);
    if (gender) params.append('gender', gender);
    router.push(`/search?${params.toString()}`);
  };

  const featuredKosts = React.useMemo(() => {
    const now = new Date();
    const verified = kosts.filter((k) => (k.verifiedStatus === 'highly-trusted' || k.verifiedStatus === 'verified') && !k.isDeleted);
    return [...verified]
      .sort((a, b) => {
        const promoA = a.promotionExpiresAt ? new Date(a.promotionExpiresAt) > now : false;
        const promoB = b.promotionExpiresAt ? new Date(b.promotionExpiresAt) > now : false;
        if (promoA && !promoB) return -1;
        if (!promoA && promoB) return 1;
        if (a.verifiedStatus === 'highly-trusted' && b.verifiedStatus !== 'highly-trusted') return -1;
        if (a.verifiedStatus !== 'highly-trusted' && b.verifiedStatus === 'highly-trusted') return 1;
        return 0;
      })
      .slice(0, 3);
  }, [kosts]);

  const stats = [
    { label: 'Kost Terverifikasi', value: '150+' },
    { label: 'Mahasiswa Aktif', value: '2,500+' },
    { label: 'Surveyor Lapangan', value: '12' },
    { label: 'Tingkat Kepuasan', value: '4.9/5' }
  ];

  const whyUs = [
    {
      icon: <BadgeCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: '100% Foto & Video Asli',
      desc: 'Bebas dari penipuan visual. Semua foto kamar dan fasilitas diambil langsung oleh surveyor lapangan kami.'
    },
    {
      icon: <Compass className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Jarak Kampus Presisi',
      desc: 'Penghitungan jarak nyata menggunakan koordinat GPS dari lokasi kos ke gerbang kampus-kampus di Malang.'
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: 'Ulasan Penghuni Asli',
      desc: 'Kami memverifikasi status penyewa untuk memastikan semua testimoni ditulis oleh mahasiswa yang benar-benar tinggal di sana.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Registrasi Owner & Detail',
      desc: 'Pemilik mendaftarkan kos dengan data identitas terverifikasi beserta klaim awal fasilitas.'
    },
    {
      num: '02',
      title: 'Survei Lapangan',
      desc: 'Surveyor VeriKost mengunjungi lokasi untuk mengukur kamar, merekam video tour, dan mencocokkan koordinat.'
    },
    {
      num: '03',
      title: 'Pemberian Lencana',
      desc: 'Kos yang lolos verifikasi mendapatkan lencana "Terverifikasi" atau "Highly Trusted" untuk meyakinkan calon penyewa.'
    }
  ];

  const testimonials = [
    {
      name: 'Rian Hidayat',
      role: 'Mahasiswa Teknik UB 24',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizky&eyebrows=default&mouth=smile',
      comment: 'Sangat terbantu mencari kos saat masih di Jakarta. Video tour detailnya sama persis dengan aslinya pas saya sampai di Malang. Benar-benar tepercaya!'
    },
    {
      name: 'Siti Aminah',
      role: 'Mahasiswi Sastra UM 23',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&eyebrows=default&mouth=smile',
      comment: 'Fitur bandingkan kos-nya juara banget! Bisa jejerin kos Suhat dan kos Sigura-gura buat bandingin harga per bulan dan kelengkapan kamar mandinya.'
    },
    {
      name: 'Bapak Gunawan',
      role: 'Pemilik Kost Mandiri',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gunawan&eyebrows=default&mouth=smile',
      comment: 'Semenjak mendaftarkan kos saya dan disurvei, kamar saya selalu penuh sebelum ajaran baru dimulai. Mahasiswa percaya karena lencana VeriKost.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-background">
        
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-1/4 -z-10 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl animate-pulse-slow"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 py-1.5 px-4 text-xs font-semibold border border-blue-200 dark:border-blue-900/40">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Verifikasi Lapangan 100% Akurat</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Cari Kost di Malang dengan <br className="hidden sm:inline" />
            <span className="brand-gradient-text">Kepastian Informasi Nyata</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Bebas zonk, penipuan foto, dan harga palsu. Kami mendatangi langsung, mengukur, dan merekam setiap sudut kosan di Malang demi kenyamanan studi Anda.
          </p>

          <div className="mx-auto max-w-4xl p-2 rounded-2xl sm:rounded-full bg-white dark:bg-slate-900 shadow-xl border border-border/80">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-border/60">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Ketik lokasi, nama jalan, atau nama kost..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex items-center px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-border/60 shrink-0 min-w-[170px]">
                <CustomSelect
                  options={campusOptions}
                  value={campus}
                  onChange={setCampus}
                  icon={<GraduationCap className="h-4.5 w-4.5" />}
                  variant="minimal"
                  className="w-full"
                />
              </div>

              <div className="flex items-center px-3 py-1.5 shrink-0 min-w-[170px]">
                <CustomSelect
                  options={genderOptions}
                  value={gender}
                  onChange={setGender}
                  icon={<Users className="h-4.5 w-4.5" />}
                  variant="minimal"
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-primary/20 px-8 py-3.5 transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Search className="h-4.5 w-4.5" />
                <span>Cari Kost</span>
              </button>

            </form>
          </div>

          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {stats.map((st, idx) => (
              <div key={idx} className="p-4 bg-muted/40 rounded-2xl border border-border/50 text-center">
                <p className="text-2xl font-black text-primary leading-none">{st.value}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">{st.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Hunian Rekomendasi</h2>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Kost Terverifikasi Pilihan Utama
              </p>
              <p className="text-sm text-muted-foreground max-w-xl">
                Setiap kosan telah di-inspeksi secara penuh. Lolos standar fasilitas kamar mandi dalam, kebersihan prima, dan legalitas kontrak.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white dark:bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-muted transition-colors shadow-sm"
            >
              <span>Lihat Semua Kosan</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredKosts.map((kost) => (
              <KostCard key={kost.id} kost={kost} />
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Mengapa VeriKost?</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Menghadirkan Transparansi Penuh untuk Kenyamanan Studi Anda
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Mencari tempat tinggal di perantauan tidak boleh seperti membeli kucing di dalam karung. VeriKost didirikan untuk memutus rantai ketidakpastian info kos yang merugikan mahasiswa dan orang tua.
            </p>

            <div className="space-y-6 pt-2">
              {whyUs.map((wy, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200/50 dark:border-slate-700/50 shadow-sm text-primary">
                    {wy.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{wy.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{wy.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-sky-500/10 rounded-3xl blur-2xl transform rotate-3"></div>
            
            <div className="relative bg-slate-950 p-6 rounded-3xl border border-slate-800 text-slate-300 shadow-2xl max-w-md w-full animate-float">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <span className="text-sm font-bold text-white uppercase tracking-wider">VeriKost Surveyor App</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Sertifikat Hak Milik & Izin</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Identitas pemilik kos dan bukti sah operasional telah diverifikasi sesuai KTP.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Dimensi Kamar Nyata</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Pengukuran manual (cth. 3x4 meter) dan pembuktian kecukupan ventilasi udara.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Pengecekan Voltase & Kecepatan WiFi</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Surveyor mengetes langsung speedtest WiFi (min. 20 Mbps) dan kelayakan listrik kamar.</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Inspector: Andi Surveyor</span>
                <span className="text-emerald-400 font-bold">PASSED VERIFICATION</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Alur Penjaminan Kepercayaan</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Bagaimana VeriKost Menjamin Akurasi?
            </p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Metodologi bertahap kami memastikan tidak ada kosan yang dipublikasikan tanpa validasi fisik langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 relative">
            
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-300 to-sky-300 -translate-y-6"></div>

            {steps.map((st, idx) => (
              <div key={idx} className="relative bg-white dark:bg-slate-900 p-8 rounded-2xl border border-border/80 text-center shadow-sm space-y-4 hover:scale-102 transition-transform z-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full brand-gradient-bg text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                  {st.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{st.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Apa Kata Mereka?</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Ulasan Jujur dari Mahasiswa & Orang Tua
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Mereka yang telah menemukan tempat tinggal ideal dan pemilik kos yang terbantu oleh platform kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-border/60 flex flex-col justify-between space-y-4">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic">
                  "{t.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl brand-gradient-bg px-8 py-12 md:py-16 text-center text-white shadow-xl shadow-primary/20">
            
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Siap Menemukan Hunian Impian Anda di Malang?
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Mulai cari ribuan kost dekat UB, UM, UMM, dan UIN Malang yang berstatus "Terverifikasi Lapangan" hari ini. Cari kosan sehat, aman, dan harga bersahabat di genggaman Anda.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  href="/search"
                  className="w-full sm:w-auto rounded-full bg-white text-primary hover:bg-slate-50 py-3.5 px-8 text-sm font-extrabold shadow-md hover:scale-102 transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="h-4.5 w-4.5" />
                  Mulai Pencarian
                </Link>
                <Link
                  href="/owner"
                  className="w-full sm:w-auto rounded-full bg-blue-700 hover:bg-blue-800 text-white border border-blue-500 py-3.5 px-8 text-sm font-bold hover:scale-102 transition-all flex items-center justify-center gap-1.5"
                >
                  Daftarkan Kost Saya (Pemilik)
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
