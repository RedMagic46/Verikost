'use client';

import React, { useState, useMemo } from 'react';
import { Kost, Inquiry } from '@/app/types';
import { 
  Check, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Building
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

interface InquiriesTabProps {
  myKosts: Kost[];
  myInquiries: Inquiry[];
  updateInquiryStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function InquiriesTab({
  myKosts,
  myInquiries,
  updateInquiryStatus,
  showToast
}: InquiriesTabProps) {

  const { bookingPayments, platformSettings } = useApp();

  const activeKosts = useMemo(() => myKosts.filter(k => !k.isDeleted), [myKosts]);

  // Selected Kost Filter
  const [selectedKostId, setSelectedKostId] = useState<string>(
    activeKosts.length > 0 ? activeKosts[0].id : ''
  );

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered Inquiries list
  const kostInquiries = useMemo(() => {
    return myInquiries.filter(inq => inq.kostId === selectedKostId);
  }, [myInquiries, selectedKostId]);

  const filteredInquiries = useMemo(() => {
    let result = kostInquiries;

    if (filterStatus !== 'all') {
      result = result.filter(inq => inq.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(inq => 
        inq.studentName.toLowerCase().includes(q) || 
        inq.message.toLowerCase().includes(q)
      );
    }

    return result;
  }, [kostInquiries, filterStatus, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      await updateInquiryStatus(id, 'approved');
      showToast('Pertanyaan disetujui (surveyor/kontak mahasiswa dibuka).', 'success');
    } catch (err: any) {
      showToast('Gagal mengubah status: ' + err.message, 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateInquiryStatus(id, 'rejected');
      showToast('Pertanyaan ditolak.', 'info');
    } catch (err: any) {
      showToast('Gagal mengubah status: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Kost Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Inquiry & Lead</h1>
          <p className="text-xs text-muted-foreground font-semibold">Tinjau dan respon pertanyaan masuk serta permohonan survey lokasi dari calon mahasiswa.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeKosts.length > 0 && (
            <select
              value={selectedKostId}
              onChange={(e) => setSelectedKostId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-extrabold shadow-sm min-w-[200px]"
            >
              {activeKosts.map((kost) => (
                <option key={kost.id} value={kost.id}>{kost.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {activeKosts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-slate-400 font-semibold flex flex-col items-center justify-center">
          <Mail className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
          <p>Harap daftarkan properti kost terlebih dahulu untuk menerima pertanyaan.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 border border-border/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama mahasiswa atau isi pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border/80 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-border/80 text-xs rounded-xl p-2.5 focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Tindakan (Pending)</option>
                <option value="approved">Disetujui (Approved)</option>
                <option value="rejected">Ditolak (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Inquiries Grid / Table */}
          {filteredInquiries.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-border rounded-3xl text-sm text-slate-400 font-semibold flex flex-col items-center justify-center">
              <Mail className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
              <p>Belum ada inquiry yang cocok dengan kriteria pencarian Anda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inq) => (
                <div 
                  key={inq.id}
                  className="bg-white dark:bg-slate-900 border border-border/80 p-5 rounded-3xl shadow-sm hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5 animate-in fade-in"
                >
                  
                  {/* Left Side: Student Info & Message */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-50 dark:bg-slate-800 text-primary flex items-center justify-center font-black">
                        {inq.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block sm:inline">
                          {inq.studentName}
                        </span>
                        <span className="hidden sm:inline text-slate-300 mx-1.5">•</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {inq.date}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        inq.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : inq.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                          : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                      }`}>
                        {inq.status === 'approved' ? 'Disetujui' : inq.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                      </span>                      {inq.status === 'approved' && (() => {
                        const payment = bookingPayments.find(p => p.inquiryId === inq.id);
                        if (!payment) {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                              Tagihan DP Belum Dibuat
                            </span>
                          );
                        }
                        const expectedPayout = payment.dpAmount;
                        if (payment.status === 'paid') {
                          return (
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                                DP Lunas ({payment.paymentMethod || 'Simulasi'})
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 animate-in fade-in duration-200">
                                Payout Anda: Rp {expectedPayout.toLocaleString('id-ID')}
                              </span>
                            </div>
                          );
                        }
                        if (payment.status === 'pending') {
                          return (
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse">
                                Belum Bayar DP (Tagihan Aktif)
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                Estimasi Payout: Rp {expectedPayout.toLocaleString('id-ID')}
                              </span>
                            </div>
                          );
                        }
                        if (payment.status === 'expired') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                              Pembayaran Kedaluwarsa
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Message content */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-border/60 text-slate-700 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                      "{inq.message}"
                    </div>

                    {/* Contacts info: visible only if approved or pending (approved shows clearly) */}
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {inq.studentEmail}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {inq.studentPhone}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Action buttons */}
                  {inq.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0 md:self-center">
                      <button
                        onClick={() => handleReject(inq.id)}
                        className="py-2.5 px-4 rounded-xl border border-border/80 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Tolak</span>
                      </button>
                      
                      <button
                        onClick={() => handleApprove(inq.id)}
                        className="py-2.5 px-5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-black shadow-sm transition-all hover:scale-102 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Setujui Survey</span>
                      </button>
                    </div>
                  )}

                  {/* If already approved, show WhatsApp link shortcut */}
                  {inq.status === 'approved' && (
                    <div className="shrink-0 md:self-center">
                      <a
                        href={`https://wa.me/${inq.studentPhone.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${inq.studentName}, ini adalah pemilik kost ${inq.kostName}. Kami menyetujui permohonan survey lokasi Anda. Kapan rencana survey Anda?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Hubungi via WA</span>
                      </a>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
