'use client';

import React, { useState } from 'react';
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
  SlidersHorizontal 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT', 'PARENT']}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}

function UserDashboardContent() {
  const { currentUser, favorites, recentlyViewed, reviews, kosts, compareList } = useApp();

  
  if (!currentUser) return null;

  
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'history' | 'reviews' | 'compare'>('overview');

  
  const favoritedKosts = kosts.filter((k) => favorites.includes(k.id));
  const historyKosts = kosts.filter((k) => recentlyViewed.includes(k.id));
  const comparedKosts = kosts.filter((k) => compareList.includes(k.id));
  
  
  const userReviews = reviews.filter((r) => r.userName === currentUser.fullName);

  const isStudent = currentUser.role === 'STUDENT';
  const roleLabel = isStudent ? 'Mahasiswa Aktif' : 'Orang Tua';

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        
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

        
        <div className="space-y-6">
          
          
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
                    <div className="flex items-start gap-3 bg-emerald-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-emerald-100 dark:border-slate-800 text-xs">
                      <Star className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-950 dark:text-slate-200">Hak Akses Ulasan</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Sebagai mahasiswa aktif terverifikasi, ulasan Anda langsung mendapat tanda "Penyewa Terverifikasi".</p>
                      </div>
                    </div>
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
