'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Send, ShieldAlert, BadgeCheck, X } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeHelpTopic, setActiveHelpTopic] = useState<'sewa' | 'banding' | 'verifikasi' | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/owner') || pathname === '/chat')) {
    return null;
  }

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white font-bold shadow-md shadow-blue-500/20">
                VK
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                VeriKost<span className="text-sky-400">Malang</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform kos-kosan berbasis verifikasi lapangan terpercaya untuk mahasiswa di Kota Malang. Menjamin akurasi foto, lokasi, fasilitas, dan harga.
            </p>
            <div className="flex space-y-2 flex-col pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Lowokwaru, Kota Malang, Jawa Timur</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>info@verikost.com</span>
              </div>
            </div>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Sistem Kepercayaan</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">Terverifikasi Lapangan</h4>
                  <p className="text-slate-400 mt-0.5 leading-tight">Fisik kosan dan amenities telah diperiksa langsung oleh Surveyor kami.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shrink-0 mt-0.5 shadow-sm shadow-blue-500/20">
                  ★
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Highly Trusted Kost</h4>
                  <p className="text-slate-400 mt-0.5 leading-tight">Kost dengan kebersihan, rating, dan riwayat keamanan tertinggi & bersertifikat.</p>
                </div>
              </li>
            </ul>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Layanan & Bantuan</h3>
            <div className="space-y-4 text-xs text-slate-400">
              <div>
                <ul className="space-y-2.5 pl-1 text-xs">
                  <li>
                    <button 
                      onClick={() => setActiveHelpTopic('sewa')}
                      className="hover:text-white transition-colors text-left font-semibold cursor-pointer"
                    >
                      Cara Cari & Sewa Kos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveHelpTopic('banding')}
                      className="hover:text-white transition-colors text-left font-semibold cursor-pointer"
                    >
                      Bandingkan Fasilitas Kos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveHelpTopic('verifikasi')}
                      className="hover:text-white transition-colors text-left font-semibold cursor-pointer"
                    >
                      Sistem Verifikasi Lapangan
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Info & Promo Terbaru</h3>
            <p className="text-sm text-slate-400">
              Dapatkan info ketersediaan promo sewa kost & tips hunian mahasiswa langsung di inbox Anda.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Alamat email Anda..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 py-2.5 pl-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                  aria-label="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400 font-medium animate-pulse">
                  ✓ Berhasil mendaftar! Terima kasih.
                </p>
              )}
            </form>
          </div>

        </div>

        
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} VeriKost Malang. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Hubungi Kami</a>
          </div>
        </div>

      </div>

      {/* Help Modal */}
      {activeHelpTopic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center pb-4 border-b border-border dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                {activeHelpTopic === 'sewa' && 'Bagaimana Cara Cari & Sewa Kos?'}
                {activeHelpTopic === 'banding' && 'Bagaimana Cara Bandingkan Kos?'}
                {activeHelpTopic === 'verifikasi' && 'Apa itu Sistem Verifikasi Lapangan?'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveHelpTopic(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium space-y-4">
              {activeHelpTopic === 'sewa' && (
                <ol className="space-y-3.5 pl-4 list-decimal">
                  <li>
                    <strong className="text-slate-900 dark:text-white font-extrabold">Cari Properti</strong>: Buka halaman pencarian, gunakan filter harga, kategori gender, atau ketik kata kunci untuk menemukan hunian impian Anda.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-extrabold">Bandingkan Fasilitas</strong>: Pilih beberapa kos yang menarik minat Anda, lalu klik tombol timbangan di kartu kos untuk melihat perbandingannya.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-extrabold">Hubungi Pemilik via Direct Chat</strong>: Masuk ke akun Anda, klik tombol chat di detail kost untuk berkirim pesan secara langsung dan bernegosiasi secara real-time.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white font-extrabold">Ajukan Sewa & Survei</strong>: Setelah cocok, Anda bisa menyepakati jadwal kunjungan lapangan atau melanjutkan transaksi sewa kost secara langsung.
                  </li>
                </ol>
              )}

              {activeHelpTopic === 'banding' && (
                <ul className="space-y-3.5 pl-4 list-disc">
                  <li>
                    Temukan kos-kosan pilihan Anda di halaman pencarian/beranda.
                  </li>
                  <li>
                    Klik ikon <strong className="text-slate-900 dark:text-white font-extrabold">Bandingkan</strong> (timbangan) di setiap kartu kos. Anda dapat memilih maksimal 3 kos secara bersamaan.
                  </li>
                  <li>
                    Buka halaman <strong className="text-slate-900 dark:text-white font-extrabold">Bandingkan</strong> di menu navigasi utama untuk melihat tabel komparasi fasilitas, dimensi, harga, dan jarak kampus secara detail.
                  </li>
                </ul>
              )}

              {activeHelpTopic === 'verifikasi' && (
                <div className="space-y-3">
                  <p>
                    <strong className="text-slate-900 dark:text-white font-extrabold">Sistem Verifikasi Lapangan</strong> adalah pilar keamanan utama di VeriKost Malang.
                  </p>
                  <p>
                    Tim surveyor kami mengunjungi lokasi fisik kos secara berkala untuk memverifikasi kebenaran foto kamar, fasilitas yang tercantum, dan koordinat maps agar terhindar dari modus penipuan kos fiktif.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveHelpTopic(null)}
                className="py-2.5 px-6 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 cursor-pointer"
              >
                Mengerti
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
