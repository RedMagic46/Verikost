'use client';

import React, { useState } from 'react';
import { X, CreditCard, Wallet, QrCode, Clipboard, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dpAmount?: number; // legacy
  amount?: number; // new generic
  commissionAmount?: number;
  commissionChargedTo?: 'student' | 'owner';
  paymentId: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  executeMockPayment?: (paymentId: string, method: string) => Promise<void>; // legacy
  onSuccess?: (paymentId: string, method: string) => Promise<void>; // new generic
}

export default function CheckoutModal({
  isOpen,
  onClose,
  dpAmount,
  amount,
  commissionAmount,
  commissionChargedTo,
  paymentId,
  title,
  subtitle,
  buttonText,
  executeMockPayment,
  onSuccess
}: CheckoutModalProps) {
  const [method, setMethod] = useState<'va' | 'ewallet' | 'qris'>('va');
  const [selectedVa, setSelectedVa] = useState<'bca' | 'bni' | 'mandiri'>('bca');
  const [selectedEwallet, setSelectedEwallet] = useState<'gopay' | 'ovo' | 'dana'>('gopay');
  const [phoneInput, setPhoneInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!isOpen) return null;

  const displayAmount = amount !== undefined ? amount : (dpAmount || 0);
  const displayTitle = title || "Simulasi Pembayaran DP";
  const displaySubtitle = subtitle || "Amankan Booking Kamar Kost";
  const displayButtonText = buttonText || "Simulasikan Sukses Bayar";

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getVaNumber = () => {
    const prefixes = { bca: '89108', bni: '88012', mandiri: '89508' };
    return `${prefixes[selectedVa]}81233445566`;
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(getVaNumber());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaySuccess = async () => {
    setPaying(true);
    const methodNames = {
      va: `Virtual Account ${selectedVa.toUpperCase()}`,
      ewallet: `E-Wallet ${selectedEwallet.toUpperCase()}`,
      qris: 'QRIS Gopay/OVO'
    };
    
    const chosenMethod = methodNames[method];
    if (onSuccess) {
      await onSuccess(paymentId, chosenMethod);
    } else if (executeMockPayment) {
      await executeMockPayment(paymentId, chosenMethod);
    }
    setPaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border/60 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-primary">{displayTitle}</h3>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{displaySubtitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Price Tag Breakdown */}
          {commissionAmount && commissionAmount > 0 && commissionChargedTo === 'student' ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-border/80 p-5 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Down Payment (DP)</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{formatIDR(dpAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Biaya Layanan (Platform Fee)</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{formatIDR(commissionAmount)}</span>
              </div>
              <div className="border-t border-border/60 pt-2.5 flex justify-between items-center">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">Total Tagihan</span>
                <span className="text-lg font-black text-primary leading-none">{formatIDR((dpAmount || 0) + commissionAmount)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-border/80 p-5 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold">Total Tagihan</span>
              <span className="text-xl font-black text-primary leading-none">{formatIDR(displayAmount)}</span>
            </div>
          )}

          {/* Payment Methods tabs */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMethod('va')}
                className={`p-3 border rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  method === 'va'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border text-slate-550 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Virtual Account</span>
              </button>

              <button
                onClick={() => setMethod('ewallet')}
                className={`p-3 border rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  method === 'ewallet'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border text-slate-550 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet className="h-5 w-5" />
                <span>E-Wallet</span>
              </button>

              <button
                onClick={() => setMethod('qris')}
                className={`p-3 border rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  method === 'qris'
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border text-slate-550 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-350 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="h-5 w-5" />
                <span>QRIS Instant</span>
              </button>
            </div>
          </div>

          {/* Tab content area */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-border rounded-2xl space-y-4">
            
            {/* VA Content */}
            {method === 'va' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex gap-2">
                  {(['bca', 'bni', 'mandiri'] as const).map((bank) => (
                    <button
                      key={bank}
                      onClick={() => { setSelectedVa(bank); setCopied(false); }}
                      className={`px-3.5 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                        selectedVa === bank
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Nomor Virtual Account</span>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-border p-3.5 rounded-xl">
                    <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-white tracking-widest">{getVaNumber()}</span>
                    <button
                      onClick={handleCopyVa}
                      className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      title="Salin Nomor VA"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  *Silakan transfer dari m-Banking atau ATM ke nomor Virtual Account di atas. Setelah transfer, klik tombol "Konfirmasi Pembayaran Sukses" di bawah.
                </p>
              </div>
            )}

            {/* E-wallet Content */}
            {method === 'ewallet' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex gap-2">
                  {(['gopay', 'ovo', 'dana'] as const).map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => setSelectedEwallet(wallet)}
                      className={`px-3.5 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                        selectedEwallet === wallet
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-border bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {wallet}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Nomor HP Terdaftar</span>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary text-xs text-slate-800 dark:text-white font-extrabold"
                  />
                </div>

                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  *Notifikasi instruksi pembayaran akan dikirimkan ke aplikasi {selectedEwallet.toUpperCase()} di ponsel Anda. Selesaikan pembayaran lalu klik konfirmasi.
                </p>
              </div>
            )}

            {/* QRIS Content */}
            {method === 'qris' && (
              <div className="space-y-4 animate-in fade-in duration-200 flex flex-col items-center text-center">
                <div className="p-4 bg-white rounded-2xl border border-border shadow-xs flex items-center justify-center h-40 w-40">
                  <div className="flex flex-col items-center text-slate-400">
                    <QrCode className="h-16 w-16 text-slate-800 dark:text-slate-850" />
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest mt-2">QRIS VERIKOST</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold">Pindai QR di atas menggunakan aplikasi m-Banking or E-Wallet Anda</p>
                  <p className="text-[9px] text-slate-400 font-medium">Berlaku untuk Gopay, OVO, Dana, LinkAja, BCA Mobile, dll.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-border/60 flex gap-3 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handlePaySuccess}
            disabled={paying}
            className="flex-1 py-3 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {paying ? 'Memproses...' : displayButtonText}
          </button>
        </div>

      </div>
    </div>
  );
}
