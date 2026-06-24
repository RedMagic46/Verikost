'use client';

import React, { useState } from 'react';
import { User } from '@/app/types';
import { supabase } from '@/app/lib/supabase';
import { 
  Settings, 
  Upload, 
  Check, 
  AlertTriangle,
  Building,
  Phone,
  Mail,
  User as UserIcon,
  Lock,
  X
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import CheckoutModal from '@/components/CheckoutModal';

interface SettingsTabProps {
  currentUser: User;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsTab({
  currentUser,
  updateProfile,
  showToast
}: SettingsTabProps) {

  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileKostName, setProfileKostName] = useState(currentUser.kostName || '');
  const [profileKostAddress, setProfileKostAddress] = useState(currentUser.kostAddress || '');
  const [profileImage, setProfileImage] = useState(currentUser.profileImage);

  const { createOwnerPayment, executeMockOwnerPayment, platformSettings } = useApp();
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isSubscribeCheckoutOpen, setIsSubscribeCheckoutOpen] = useState(false);
  const [subDays, setSubDays] = useState(30);
  const subAmount = subDays * (platformSettings.ownerSubscriptionRate || 3000);
  const [subPaymentId, setSubPaymentId] = useState<string | null>(null);

  const handleRequestSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subDays <= 0) {
      showToast('Masukkan jumlah hari yang valid.', 'error');
      return;
    }
    const paymentId = await createOwnerPayment('subscription', subAmount, subDays, null);
    if (paymentId) {
      setSubPaymentId(paymentId);
      setIsSubscribeModalOpen(false);
      setIsSubscribeCheckoutOpen(true);
    }
  };

  const handleSubscribeSuccess = async (paymentId: string, method: string) => {
    await executeMockOwnerPayment(paymentId, method);
    setIsSubscribeCheckoutOpen(false);
    setSubPaymentId(null);
  };

  // Upload UI States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinda&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Endang&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&eyebrows=default&mouth=smile'
  ];

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Tipe file tidak didukung. Harap pilih gambar.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const useBase64Fallback = () => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setProfileImage(base64Url);
        }
      };
      reader.onerror = () => {
        setUploadError('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `owner-${currentUser.id}-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);
        
        setProfileImage(publicUrl);
      } else {
        console.warn('Storage upload failed, using Base64 fallback:', uploadErr);
        useBase64Fallback();
      }
    } catch (err) {
      console.error('Upload exception, using Base64 fallback:', err);
      useBase64Fallback();
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    try {
      const updates: Partial<User> = {
        fullName: profileName.trim(),
        name: profileName.trim(),
        phone: profilePhone.trim(),
        kostName: profileKostName.trim(),
        kostAddress: profileKostAddress.trim(),
        profileImage: profileImage
      };

      if (profilePassword.trim()) {
        if (profilePassword.trim().length < 6) {
          showToast('Kata sandi baru minimal 6 karakter.', 'error');
          return;
        }
        updates.passwordHash = profilePassword.trim();
      }

      await updateProfile(updates);
      showToast('Profil Anda berhasil diperbarui.', 'success');
      setProfilePassword('');
    } catch (err: any) {
      showToast(`Gagal memperbarui profil: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="max-w-2xl bg-white dark:bg-slate-900 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      
      {/* Settings Header */}
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Pengaturan Akun & Profil</span>
        </h2>
        <p className="text-[10px] text-muted-foreground font-semibold mt-1">Perbarui foto profil, info kontak, kredensial sandi, dan info properti utama Anda.</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-semibold">
        
        {/* Avatar Upload Panel */}
        <div className="space-y-3">
          <span className="text-slate-700 dark:text-slate-400 font-bold block">Foto Profil Anda</span>
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-border/80">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-border/85 relative flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-slate-400" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-1.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-colors cursor-pointer text-center">
                  Pilih Gambar Baru
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageUpload} 
                    className="hidden" 
                  />
                </label>
                <span className="text-[9px] text-slate-400">Format PNG, JPG. Maksimal 2MB.</span>
              </div>
              {uploadError && (
                <p className="text-[9px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Character Avatars fallback selection */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Atau Pilih Karakter Ilustrasi:</span>
            <div className="grid grid-cols-6 gap-2">
              {defaultAvatars.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfileImage(url)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-950 p-1 hover:scale-105 transition-all cursor-pointer ${
                    profileImage === url ? 'border-primary' : 'border-border/60 hover:border-slate-400'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-400">Nama Lengkap Owner*</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/80 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Alamat Email (Permanen)</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-border/60 p-3 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-400">Nomor Telepon/WA*</label>
            <input
              type="text"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/80 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-400">Ubah Kata Sandi (Kosongkan jika tidak diganti)</label>
            <input
              type="password"
              placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/80 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-400">Nama Kost Utama</label>
            <input
              type="text"
              placeholder="Contoh: Kost Lowokwaru Mandiri"
              value={profileKostName}
              onChange={(e) => setProfileKostName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/80 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-400">Alamat Kost Utama</label>
            <input
              type="text"
              placeholder="Contoh: Jl. Soekarno Hatta No 5"
              value={profileKostAddress}
              onChange={(e) => setProfileKostAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-border/80 p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-border/60">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4.5 w-4.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </form>

      {/* Subscription Panel */}
      <div className="border-t border-border/60 pt-6 mt-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="h-4.5 w-4.5 text-primary" />
          <span>Status Langganan Kemitraan</span>
        </h3>
        
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-border/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">Masa Berlaku Aktif</span>
            {currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt) > new Date() ? (
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                Aktif sampai {new Date(currentUser.subscriptionExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : (
              <p className="text-xs font-black text-rose-500">
                Tidak Aktif / Kedaluwarsa
              </p>
            )}
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">Aktifkan langganan untuk menikmati hak akses membalas ulasan, mendaftarkan kost baru, dan menyetujui inquiry sewa.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubscribeModalOpen(true)}
            className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Lock className="h-4 w-4" />
            <span>{currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt) > new Date() ? 'Perpanjang Langganan' : 'Aktifkan Langganan'}</span>
          </button>
        </div>
      </div>

      {/* Subscribe Input Form Modal */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200 gap-5 text-xs font-semibold">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="h-5 w-5 text-primary" />
                Aktifkan Langganan Mitra Owner
              </h3>
              <button
                type="button"
                onClick={() => setIsSubscribeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Aktifkan langganan Anda secara fleksibel untuk jangka waktu tertentu guna memulihkan dan mempertahankan akses fitur pengelolaan kost Anda.</p>

            <form onSubmit={handleRequestSubscribe} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-400">Durasi Berlangganan (Hari)</label>
                <input
                  type="number"
                  min={1}
                  value={subDays}
                  onChange={(e) => {
                    const days = Math.max(1, Number(e.target.value));
                    setSubDays(days);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 dark:text-white font-extrabold"
                  required
                />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4.5 rounded-2xl border border-border">
                <span className="text-slate-400 font-bold uppercase text-[9px] block">Rincian Pembayaran</span>
                <div className="flex justify-between items-center text-xs font-bold mt-1">
                  <span className="text-slate-600 dark:text-slate-400">Tarif Langganan</span>
                  <span className="text-slate-800 dark:text-white">Rp {(platformSettings.ownerSubscriptionRate || 3000).toLocaleString('id-ID')} / hari</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold mt-2 pt-2 border-t border-border/40">
                  <span className="text-slate-700 dark:text-slate-200">Total Pembayaran ({subDays} Hari)</span>
                  <span className="text-primary text-sm font-black">Rp {subAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubscribeModalOpen(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
                >
                  Bayar Langganan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscribe Checkout Modal */}
      {isSubscribeCheckoutOpen && subPaymentId && (
        <CheckoutModal
          isOpen={isSubscribeCheckoutOpen}
          onClose={() => setIsSubscribeCheckoutOpen(false)}
          amount={subAmount}
          paymentId={subPaymentId}
          title="Simulasi Pembayaran Langganan"
          subtitle={`Langganan Mitra Owner selama ${subDays} hari`}
          buttonText="Simulasikan Sukses Langganan"
          onSuccess={handleSubscribeSuccess}
        />
      )}

    </div>
  );
}
