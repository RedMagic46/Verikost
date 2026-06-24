'use client';

import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { z } from 'zod';
import { User, Phone, GraduationCap, Briefcase, Lock, ShieldCheck, Mail, Check, AlertTriangle, Upload } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  phone: z.string().min(10, { message: 'Nomor handphone minimal 10 digit.' }),
  university: z.string().optional(),
  faculty: z.string().optional(),
  major: z.string().optional(),
  occupation: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Kata sandi saat ini harus diisi.' }),
  newPassword: z.string().min(6, { message: 'Kata sandi baru minimal 6 karakter.' }),
  confirmNewPassword: z.string().min(1, { message: 'Konfirmasi kata sandi baru harus diisi.' })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Konfirmasi kata sandi baru tidak cocok.',
  path: ['confirmNewPassword']
});

export default function ProfilePage() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { currentUser, updateProfile, referrals, platformSettings, updateReferralCode, claimReferralReward, showToast } = useApp();
  if (!currentUser) return null;

  const getVoucherSuffix = (rewardText: string) => {
    if (!rewardText) return 'FREE';
    const cleanText = rewardText.replace(/\./g, '');
    const match = cleanText.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (val >= 1000) {
        return `${Math.round(val / 1000)}K`;
      }
      return `${val}`;
    }
    return rewardText.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  };

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [customReferralCode, setCustomReferralCode] = useState(currentUser.referralCode || '');
  const [isEditingRef, setIsEditingRef] = useState(false);
  
  const [university, setUniversity] = useState(currentUser.university || '');
  const [faculty, setFaculty] = useState(currentUser.faculty || '');
  const [major, setMajor] = useState(currentUser.major || '');
  
  const [occupation, setOccupation] = useState(currentUser.occupation || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess(false);

    const dataToValidate = {
      fullName,
      phone,
      university: currentUser.role === 'STUDENT' ? university : undefined,
      faculty: currentUser.role === 'STUDENT' ? faculty : undefined,
      major: currentUser.role === 'STUDENT' ? major : undefined,
      occupation: currentUser.role === 'PARENT' ? occupation : undefined
    };

    const result = profileSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setProfileErrors(fieldErrors);
      return;
    }

    updateProfile({
      fullName,
      phone,
      university: currentUser.role === 'STUDENT' ? university : undefined,
      faculty: currentUser.role === 'STUDENT' ? faculty : undefined,
      major: currentUser.role === 'STUDENT' ? major : undefined,
      occupation: currentUser.role === 'PARENT' ? occupation : undefined
    });

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordError(null);
    setPasswordSuccess(false);

    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmNewPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    if (currentUser.passwordHash !== currentPassword) {
      setPasswordError('Kata sandi saat ini tidak cocok.');
      return;
    }

    updateProfile({ passwordHash: newPassword });
    setPasswordSuccess(true);
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          try {
            await updateProfile({ profileImage: base64Url });
          } catch (profileErr) {
            console.error('Failed to update profile image with base64:', profileErr);
            setUploadError('Gagal menyimpan foto profil.');
          }
        }
      };
      reader.onerror = () => {
        setUploadError('Gagal membaca file gambar.');
      };
      reader.readAsDataURL(file);
    };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      
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
        
        await updateProfile({ profileImage: publicUrl });
      } else {
        console.warn('Supabase storage upload failed/unconfigured. Falling back to Base64:', uploadErr);
        useBase64Fallback();
      }
    } catch (err) {
      console.error('File upload exception. Falling back to Base64:', err);
      useBase64Fallback();
    } finally {
      setIsUploading(false);
    }
  };

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&eyebrows=defaultNatural&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Dinda&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Endang&eyebrows=default&mouth=smile',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&eyebrows=default&mouth=smile'
  ];

  const handleSelectAvatar = (url: string) => {
    updateProfile({ profileImage: url });
  };

  const roleLabels = {
    STUDENT: 'Mahasiswa',
    PARENT: 'Orang Tua',
    OWNER: 'Mitra Pemilik Kost',
    ADMIN: 'Administrator Sistem'
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <img
            src={currentUser.profileImage}
            alt={currentUser.fullName}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/15"
          />
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                {currentUser.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 py-0.5 px-2 text-[10px] font-bold border border-blue-100 dark:border-blue-900/30">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                {roleLabels[currentUser.role]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentUser.email}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Terdaftar Sejak: {currentUser.createdAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-5 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Pilih Gambar Profil</span>
              <div className="grid grid-cols-3 gap-2">
                {avatars.map((url, idx) => {
                  const isSelected = currentUser.profileImage === url;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAvatar(url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                        isSelected ? 'border-primary shadow-md scale-102' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="avatar" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border/80 pt-4 mt-2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-2xl p-4 cursor-pointer transition-all text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-xs">
                    {isUploading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="text-[10px] text-muted-foreground font-semibold">Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-primary mb-0.5 animate-pulse" />
                        <span className="text-primary font-bold text-xs hover:underline">Unggah Foto Kustom</span>
                        <span className="text-[9px] text-muted-foreground font-semibold">Format JPG, PNG (Maks. 2MB)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <p className="text-[10px] text-rose-500 font-bold text-center mt-2 animate-in fade-in">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            
            <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Detail Informasi Profil</h3>
              </div>

              {profileSuccess && (
                <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="h-4.5 w-4.5 shrink-0" />
                  <span>Detail profil Anda berhasil diperbarui!</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap*</label>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                      <User className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    {profileErrors.fullName && <p className="text-[10px] text-rose-500 font-bold">{profileErrors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Nomor Telepon (WhatsApp)*</label>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    {profileErrors.phone && <p className="text-[10px] text-rose-500 font-bold">{profileErrors.phone}</p>}
                  </div>

                </div>

                {currentUser.role === 'STUDENT' && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-border rounded-2xl space-y-4">
                    <span className="text-[10px] font-extrabold uppercase text-primary block tracking-wider">Identitas Mahasiswa</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Universitas*</label>
                        <input
                          type="text"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Fakultas</label>
                        <input
                          type="text"
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Jurusan</label>
                        <input
                          type="text"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        />
                      </div>

                    </div>
                  </div>
                )}

                {currentUser.role === 'PARENT' && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-border rounded-2xl space-y-4">
                    <span className="text-[10px] font-extrabold uppercase text-primary block tracking-wider">Identitas Orang Tua</span>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Pekerjaan Utama*</label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-transform active:scale-98 cursor-pointer shadow"
                >
                  Simpan Perubahan
                </button>

              </form>

            </div>

            {currentUser.role === 'STUDENT' && (
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Program Rujukan (Referral)</h3>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bagikan kode referral unik Anda ke teman mahasiswa rantau lainnya! Dapatkan hadiah menarik ketika mereka mendaftar dan melakukan booking kost pertama.
                </p>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-border rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Kode Referral Anda</span>
                      {isEditingRef ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customReferralCode}
                            onChange={(e) => setCustomReferralCode(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                            className="bg-white dark:bg-slate-900 border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const success = await updateReferralCode(customReferralCode);
                              if (success) setIsEditingRef(false);
                            }}
                            className="bg-primary hover:bg-blue-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer border-0"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomReferralCode(currentUser.referralCode || '');
                              setIsEditingRef(false);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer border-0"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-800 dark:text-white tracking-wide">{currentUser.referralCode || '-'}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingRef(true)}
                            className="text-[9px] text-primary font-bold hover:underline"
                          >
                            (Ubah Kode)
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (currentUser.referralCode) {
                          navigator.clipboard.writeText(currentUser.referralCode);
                          showToast('Kode referral berhasil disalin ke clipboard!', 'success');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 border border-border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-[10px] font-bold py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Salin Kode
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Reward Pendaftaran</span>
                      <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{platformSettings.smallReferralReward}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Reward Transaksi DP</span>
                      <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{platformSettings.transactionReferralReward}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-400 tracking-wider">Teman yang Anda Undang</h4>
                  
                  {(() => {
                    const myInvites = referrals?.filter(r => r.referrerId === currentUser.id) || [];
                    if (myInvites.length === 0) {
                      return (
                        <div className="text-center p-6 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-border text-[11px] text-muted-foreground font-semibold">
                          Belum ada teman yang bergabung menggunakan kode Anda.
                        </div>
                      );
                    }
                    return (
                      <div className="border border-border rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border text-slate-700 dark:text-slate-300 font-bold">
                              <th className="p-3">Nama Teman</th>
                              <th className="p-3">Status Rujukan</th>
                              <th className="p-3 text-right">Klaim Reward</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-slate-600 dark:text-slate-400">
                            {myInvites.map((invite) => (
                              <tr key={invite.id} className="hover:bg-slate-50/30">
                                <td className="p-3">
                                  <span className="font-bold text-slate-800 dark:text-white block">{invite.referredName}</span>
                                  <span className="text-[9px] text-slate-400">{invite.referredEmail}</span>
                                </td>
                                <td className="p-3">
                                  {invite.transactionRewardStatus === 'claimed' ? (
                                    <span className="text-emerald-600 font-bold">Selesai (DP Lunas)</span>
                                  ) : invite.transactionRewardStatus === 'earned' ? (
                                    <span className="text-amber-600 font-extrabold animate-pulse">Siap Diklaim (DP Lunas)</span>
                                  ) : (
                                    <span className="text-slate-400 font-semibold">Terdaftar (Belum Booking)</span>
                                  )}
                                </td>
                                <td className="p-3 text-right space-y-1">
                                  {/* Small Reward Claim Button */}
                                  {invite.smallRewardStatus === 'pending' && (
                                    <button
                                      type="button"
                                      onClick={() => claimReferralReward(invite.id, 'small')}
                                      className="bg-primary hover:bg-blue-600 text-white font-bold text-[9px] py-1 px-2.5 rounded-lg cursor-pointer border-0 shadow-xs mr-1"
                                    >
                                      Klaim Sign-Up
                                    </button>
                                  )}
                                  
                                  {/* Transaction Reward Claim Button */}
                                  {invite.transactionRewardStatus === 'earned' && (
                                    <button
                                      type="button"
                                      onClick={() => claimReferralReward(invite.id, 'transaction')}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[9px] py-1 px-2.5 rounded-lg cursor-pointer border-0 shadow-xs"
                                    >
                                      Klaim Booking
                                    </button>
                                  )}

                                  <div className="flex flex-col items-end gap-1.5 pt-0.5">
                                    {invite.smallRewardStatus === 'claimed' && (() => {
                                      const suffix = getVoucherSuffix(platformSettings.smallReferralReward);
                                      const code = `VK-REF-${invite.id.substring(4, 8).toUpperCase()}-${suffix}`;
                                      return (
                                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-lg text-[9px] text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in duration-200">
                                          <span>Voucher Reg: </span>
                                          <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded select-all font-mono font-black text-slate-800 dark:text-slate-100 uppercase">
                                            {code}
                                          </code>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(code);
                                              showToast('Kode voucher sign-up berhasil disalin!', 'success');
                                            }}
                                            className="p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded text-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
                                            title="Salin Voucher"
                                          >
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {invite.transactionRewardStatus === 'claimed' && (() => {
                                      const suffix = getVoucherSuffix(platformSettings.transactionReferralReward);
                                      const code = `VK-REF-${invite.id.substring(4, 8).toUpperCase()}-${suffix}`;
                                      return (
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-lg text-[9px] text-amber-600 dark:text-amber-400 font-bold animate-in fade-in duration-200">
                                          <span>Voucher Book: </span>
                                          <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded select-all font-mono font-black text-slate-800 dark:text-slate-100 uppercase">
                                            {code}
                                          </code>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(code);
                                              showToast('Kode voucher booking berhasil disalin!', 'success');
                                            }}
                                            className="p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-amber-500 hover:text-amber-700 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
                                            title="Salin Voucher"
                                          >
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                          </button>
                                        </div>
                                      );
                                    })()}

                                    {invite.smallRewardStatus === 'claimed' && invite.transactionRewardStatus !== 'earned' && invite.transactionRewardStatus !== 'claimed' && (
                                      <span className="text-[9px] text-slate-400 font-bold italic">Sign-up Diklaim ✓</span>
                                    )}
                                    {invite.transactionRewardStatus === 'claimed' && (
                                      <span className="text-[9px] text-emerald-600 font-bold italic">Semua Diklaim ✓</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Keamanan & Ubah Sandi</h3>
              </div>

              {passwordSuccess && (
                <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="h-4.5 w-4.5 shrink-0" />
                  <span>Kata sandi Anda berhasil diubah!</span>
                </div>
              )}

              {passwordError && (
                <div className="flex gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Kata Sandi Saat Ini*</label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Masukkan sandi saat ini"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  {passwordErrors.currentPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{passwordErrors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Kata Sandi Baru*</label>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    {passwordErrors.newPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{passwordErrors.newPassword}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Ulangi Sandi Baru*</label>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3 py-2.5 focus-within:border-primary">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Konfirmasi sandi baru"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    {passwordErrors.confirmNewPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{passwordErrors.confirmNewPassword}</p>}
                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-transform active:scale-98 cursor-pointer shadow animate-in fade-in"
                >
                  Ubah Kata Sandi
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
