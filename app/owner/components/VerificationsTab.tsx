'use client';

import React, { useMemo, useState } from 'react';
import { Kost, KostVerification } from '@/app/types';
import { useApp } from '@/app/context/AppContext';
import CheckoutModal from '@/components/CheckoutModal';
import { 
  ShieldCheck, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Send,
  CheckCircle2,
  Calendar,
  CreditCard
} from 'lucide-react';

interface VerificationsTabProps {
  myKosts: Kost[];
  kostVerifications: KostVerification[];
  submitKostVerification: (kostId: string) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function VerificationsTab({
  myKosts,
  kostVerifications,
  submitKostVerification,
  showToast
}: VerificationsTabProps) {

  const { createOwnerPayment, executeMockOwnerPayment } = useApp();
  const [activePaymentVerif, setActivePaymentVerif] = useState<KostVerification | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  const getKostVerificationStatus = (kostId: string) => {
    const verifs = kostVerifications.filter(v => v.kostId === kostId);
    if (verifs.length === 0) return null;
    return verifs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  };

  const handleRequestVerification = async (kostId: string) => {
    try {
      await submitKostVerification(kostId);
      showToast('Pengajuan verifikasi kost berhasil dikirim ke Admin.', 'success');
    } catch (err) {
      const error = err as Error;
      showToast('Gagal mengajukan verifikasi: ' + error.message, 'error');
    }
  };

  const handlePayVerification = async (verif: KostVerification) => {
    const price = verif.price || 150000;
    const pid = await createOwnerPayment('verification', price, 0, verif.kostId);
    if (pid) {
      setPaymentId(pid);
      setActivePaymentVerif(verif);
      setIsCheckoutOpen(true);
    }
  };

  const handleCheckoutSuccess = async (paymentId: string, method: string) => {
    await executeMockOwnerPayment(paymentId, method);
    setIsCheckoutOpen(false);
    setActivePaymentVerif(null);
    setPaymentId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Status Verifikasi Kost</h1>
        <p className="text-xs text-muted-foreground font-semibold">Pantau status audit fisik, keabsahan SHM, dan kelayakan fasilitas boarding house Anda.</p>
      </div>

      {activeKosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
          <ShieldCheck className="h-12 w-12 text-slate-350 dark:text-slate-700 mb-3" />
          <p>Daftarkan properti kost terlebih dahulu untuk mengajukan verifikasi fisik lapangan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-200">
          {activeKosts.map((kost) => {
            const verif = getKostVerificationStatus(kost.id);
            const isExpired = verif && verif.status === 'approved' && verif.expiredAt && new Date(verif.expiredAt) < new Date();
            
            return (
              <div 
                key={kost.id}
                className="bg-white dark:bg-slate-900 border border-border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                
                {/* Kost Detail Summary */}
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-border bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={kost.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} 
                      alt={kost.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 my-auto">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">{kost.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{kost.district}</p>
                  </div>
                </div>

                {/* Status Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 font-semibold text-xs">
                  
                  {/* Status Badges & Details */}
                  {!verif && (
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2 px-3.5 rounded-full border border-border">
                      <Clock className="h-4 w-4" />
                      <span>Belum Diverifikasi</span>
                    </div>
                  )}

                  {verif && verif.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 px-3.5 rounded-full border border-amber-100 dark:border-amber-900/30 animate-pulse">
                      <Clock className="h-4 w-4" />
                      <span>Menunggu Penjadwalan & Biaya Survey</span>
                    </div>
                  )}

                  {verif && verif.status === 'scheduled' && (
                    <div className="flex flex-col gap-1.5 items-start sm:items-end">
                      <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 px-3.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                        <Clock className="h-4 w-4" />
                        <span>Menunggu Pembayaran Survey</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold space-y-0.5">
                        <p>Jadwal Visit: <span className="font-black text-slate-800 dark:text-white">{verif.visitDate}</span></p>
                        <p>Biaya Survey: <span className="font-black text-primary">Rp {verif.price?.toLocaleString('id-ID')}</span></p>
                      </div>
                      <button
                        onClick={() => handlePayVerification(verif)}
                        className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-sm transition-all hover:scale-102 flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Bayar Biaya Survey</span>
                      </button>
                    </div>
                  )}

                  {verif && verif.status === 'paid' && (
                    <div className="flex flex-col gap-1.5 items-start sm:items-end">
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2 px-3.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle2 className="h-4 w-4 animate-bounce" />
                        <span>Pembayaran Berhasil - Menunggu Survey</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold space-y-0.5">
                        <p>Jadwal Visit: <span className="font-black text-slate-800 dark:text-white">{verif.visitDate}</span></p>
                        <p>Biaya Survey: <span className="font-black text-emerald-600 dark:text-emerald-450">Rp {verif.price?.toLocaleString('id-ID')} (LUNAS)</span></p>
                      </div>
                    </div>
                  )}

                  {verif && verif.status === 'approved' && !isExpired && (
                    <div className="flex flex-col gap-1.5 items-start sm:items-end">
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-2 px-3.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Kost Terverifikasi ({kost.verifiedStatus})</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold">
                        Berlaku hingga: {verif.expiredAt}
                      </div>
                    </div>
                  )}

                  {verif && verif.status === 'approved' && isExpired && (
                    <div className="flex flex-col gap-1.5 items-start sm:items-end">
                      <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-2 px-3.5 rounded-full border border-rose-100 dark:border-rose-900/30">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Verifikasi Kadaluarsa</span>
                      </div>
                      <div className="text-[10px] text-rose-500 dark:text-rose-400 font-bold">
                        Habis pada: {verif.expiredAt}
                      </div>
                    </div>
                  )}

                  {verif && verif.status === 'rejected' && (
                    <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-2 px-3.5 rounded-full border border-rose-100 dark:border-rose-900/30">
                      <XCircle className="h-4 w-4" />
                      <span>Pengajuan Ditolak</span>
                    </div>
                  )}

                  {/* Submission Date info */}
                  {verif && verif.status !== 'scheduled' && verif.status !== 'paid' && (
                    <div className="text-[10px] text-slate-400 font-bold space-y-0.5 sm:text-right">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Diajukan: {verif.submittedAt}
                      </span>
                      {verif.approvedAt && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450">
                          <CheckCircle2 className="h-3 w-3" />
                          Disetujui: {verif.approvedAt}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Request Button */}
                  {(!verif || verif.status === 'rejected' || isExpired) && (
                    <button
                      onClick={() => handleRequestVerification(kost.id)}
                      className="py-2 px-4 bg-primary hover:bg-blue-600 text-white rounded-xl text-[10px] font-black shadow-sm transition-all hover:scale-102 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{verif ? 'Ajukan Ulang' : 'Ajukan Verifikasi'}</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Rincian Tambahan */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-border/80 text-xs leading-relaxed space-y-3 font-semibold text-slate-600 dark:text-slate-400">
        <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="h-4.5 w-4.5 text-primary" />
          <span>Keuntungan Lencana Terverifikasi (Verified Badge):</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1.5 font-medium">
          <li><strong>Meningkatkan Kepercayaan:</strong> Properti Anda akan mendapatkan lencana visual hijau &quot;Verified&quot; yang menarik perhatian calon mahasiswa &amp; orang tua.</li>
          <li><strong>Prioritas Pencarian:</strong> Kost terverifikasi secara algoritma diprioritaskan tampil pada halaman pertama hasil pencarian mahasiswa.</li>
          <li><strong>Video Tur Eksklusif:</strong> Surveyor kami akan merekam video tur kamar HD secara profesional untuk ditampilkan gratis pada listing Anda.</li>
        </ul>
      </div>

      {/* Checkout Modal for survey payments */}
      {isCheckoutOpen && paymentId && activePaymentVerif && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setActivePaymentVerif(null);
            setPaymentId(null);
          }}
          amount={activePaymentVerif.price || 150000}
          paymentId={paymentId}
          title="Simulasi Pembayaran Survey"
          subtitle={`Pembayaran survey verifikasi properti untuk kost Anda`}
          buttonText="Simulasikan Sukses Bayar"
          onSuccess={handleCheckoutSuccess}
        />
      )}

    </div>
  );
}
