'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { z } from 'zod';
import { Mail, Lock, User, Phone, GraduationCap, Briefcase, Landmark, ShieldAlert, Check, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  email: z.string().email({ message: 'Format alamat email tidak valid.' }),
  phone: z.string().min(10, { message: 'Nomor telepon minimal 10 digit.' }),
  password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
  confirmPassword: z.string().min(1, { message: 'Konfirmasi kata sandi tidak boleh kosong.' }),
  
  
  university: z.string().optional(),
  faculty: z.string().optional(),
  major: z.string().optional(),
  
  occupation: z.string().optional(),
  
  kostName: z.string().optional(),
  kostAddress: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok.',
  path: ['confirmPassword']
});

type AccountRole = 'STUDENT' | 'PARENT' | 'OWNER';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useApp();

  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<AccountRole>('STUDENT');

  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  
  const [occupation, setOccupation] = useState('');
  
  const [kostName, setKostName] = useState('');
  const [kostAddress, setKostAddress] = useState('');

  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
    setErrors({});
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedUniversity = university.trim();
    const normalizedFaculty = faculty.trim();
    const normalizedMajor = major.trim();
    const normalizedOccupation = occupation.trim();
    const normalizedKostName = kostName.trim();
    const normalizedKostAddress = kostAddress.trim();

    const rawData = {
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      confirmPassword,
      role,
      university: role === 'STUDENT' ? normalizedUniversity : undefined,
      faculty: role === 'STUDENT' ? normalizedFaculty : undefined,
      major: role === 'STUDENT' ? normalizedMajor : undefined,
      occupation: role === 'PARENT' ? normalizedOccupation : undefined,
      kostName: role === 'OWNER' ? normalizedKostName : undefined,
      kostAddress: role === 'OWNER' ? normalizedKostAddress : undefined
    };

    const result = registerSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);

      
      return;
    }

    if (role === 'STUDENT' && !normalizedUniversity) {
      setErrors({ university: 'Asal Universitas harus diisi.' });
      return;
    }
    if (role === 'OWNER') {
      if (!normalizedKostName) {
        setErrors({ kostName: 'Nama Kost harus diisi.' });
        return;
      }
      if (!normalizedKostAddress) {
        setErrors({ kostAddress: 'Alamat Kost harus diisi.' });
        return;
      }
    }

    setIsLoading(true);
    try {
      const seed = encodeURIComponent(normalizedFullName);
      const payload = {
        fullName: normalizedFullName,
        name: normalizedFullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash: password, 
        role,
        profileImage: role === 'STUDENT' 
          ? `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`
          : role === 'PARENT'
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
          : `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`,
        avatar: role === 'STUDENT' 
          ? `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}`
          : role === 'PARENT'
          ? `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
          : `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`,
        university: role === 'STUDENT' ? normalizedUniversity : undefined,
        faculty: role === 'STUDENT' ? normalizedFaculty : undefined,
        major: role === 'STUDENT' ? normalizedMajor : undefined,
        occupation: role === 'PARENT' ? normalizedOccupation : undefined,
        kostName: role === 'OWNER' ? normalizedKostName : undefined,
        kostAddress: role === 'OWNER' ? normalizedKostAddress : undefined
      };

      const res = await register(payload);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (role === 'OWNER') {
            router.push('/owner'); 
          } else {
            router.push('/dashboard'); 
          }
        }, 2000);
      } else {
        setServerError(res.error || 'Registrasi gagal.');
      }
    } catch (err) {
      setServerError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
      
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Daftar Akun <span className="brand-gradient-text">VeriKost</span>
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Temukan kos-kosan dengan jaminan kejujuran dan transparansi fisik 100%.
        </p>
      </div>

      
      <div className="flex items-center justify-center gap-2">
        <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-primary' : 'w-2.5 bg-slate-200 dark:bg-slate-800'}`}></div>
        <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-primary' : 'w-2.5 bg-slate-200 dark:bg-slate-800'}`}></div>
      </div>

      {serverError && (
        <div className="flex gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>Registrasi berhasil! Masuk otomatis ke akun Anda...</span>
        </div>
      )}

      
      {step === 1 && (
        <div className="space-y-6">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center uppercase tracking-wider">
            Langkah 1: Pilih Tipe Pengguna Anda
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer ${
                role === 'STUDENT'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 scale-[1.02]'
                  : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`h-11 w-11 rounded-full flex items-center justify-center ${role === 'STUDENT' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <GraduationCap className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Mahasiswa</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">Cari kost, bandingkan, favoritkan, dan tulis ulasan kos.</p>
              </div>
            </button>

            
            <button
              type="button"
              onClick={() => setRole('PARENT')}
              className={`p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer ${
                role === 'PARENT'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 scale-[1.02]'
                  : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`h-11 w-11 rounded-full flex items-center justify-center ${role === 'PARENT' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <User className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Orang Tua</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">Pantau keamanan, hubungi owner, dan bantu carikan hunian anak.</p>
              </div>
            </button>

            
            <button
              type="button"
              onClick={() => setRole('OWNER')}
              className={`p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer ${
                role === 'OWNER'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 scale-[1.02]'
                  : 'border-border hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`h-11 w-11 rounded-full flex items-center justify-center ${role === 'OWNER' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Briefcase className="h-5.5 w-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Pemilik Kost</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">Kelola kamar kos, kelola ketersediaan, kelola sewa/inquiry.</p>
              </div>
            </button>

          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Lanjutkan Pengisian Data</span>
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}

      
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center uppercase tracking-wider">
            Langkah 2: Lengkapi Formulir Registrasi ({role === 'STUDENT' ? 'Mahasiswa' : role === 'PARENT' ? 'Orang Tua' : 'Pemilik Kost'})
          </span>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap*</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.fullName ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Contoh: Alya Sabrina"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.fullName}</p>}
            </div>

            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Aktif*</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.email ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  placeholder={role === 'STUDENT' ? 'name@student.ub.ac.id' : 'name@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.email}</p>}
            </div>

            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nomor Handphone (WhatsApp)*</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.phone ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              {errors.phone && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.phone}</p>}
            </div>

            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi*</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.password ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              {errors.password && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.password}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi*</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.confirmPassword ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.confirmPassword}</p>}
            </div>

          </div>

          
          {role === 'STUDENT' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-border rounded-2xl space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-primary block tracking-wider">Detil Kemahasiswaan</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Universitas*</label>
                  <input
                    type="text"
                    placeholder="Contoh: UB / UM / UMM"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                    required
                  />
                  {errors.university && <p className="text-[9px] text-rose-500 font-semibold pl-1">{errors.university}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Fakultas</label>
                  <input
                    type="text"
                    placeholder="Contoh: MIPA / Teknik"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Jurusan / Prodi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fisika / Informatika"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  />
                </div>

              </div>
            </div>
          )}

          {role === 'PARENT' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-border rounded-2xl space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-primary block tracking-wider">Detil Pekerjaan Orang Tua</span>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pekerjaan Utama*</label>
                <input
                  type="text"
                  placeholder="Contoh: Pegawai Negeri / Wiraswasta / Guru"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-border rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          {role === 'OWNER' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-border rounded-2xl space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-primary block tracking-wider">Informasi Kepemilikan Kost</span>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Sebagai pemilik kost, akun Anda akan otomatis masuk dalam antrean persetujuan verifikasi administratif oleh Admin kami untuk menguji keabsahan lisensi.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Nama Kost Anda*</label>
                  <div className={`flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.kostName ? 'border-rose-500' : 'border-border'}`}>
                    <Landmark className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Contoh: Kost Lowokwaru Premium"
                      value={kostName}
                      onChange={(e) => setKostName(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  {errors.kostName && <p className="text-[9px] text-rose-500 font-semibold pl-1">{errors.kostName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Alamat Fisik Kost*</label>
                  <div className={`flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border px-3 py-2 text-base md:text-sm transition-colors ${errors.kostAddress ? 'border-rose-500' : 'border-border'}`}>
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Sukarno Hatta Gang 1 No 5"
                      value={kostAddress}
                      onChange={(e) => setKostAddress(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                      required
                    />
                  </div>
                  {errors.kostAddress && <p className="text-[9px] text-rose-500 font-semibold pl-1">{errors.kostAddress}</p>}
                </div>

              </div>
            </div>
          )}

          
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isLoading || isSuccess}
              className="flex-1 py-3 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow shadow-primary/20 transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Buat Akun Saya'
              )}
            </button>
          </div>

        </form>
      )}

      
      <div className="text-center pt-2 border-t border-border/80">
        <p className="text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Masuk Di Sini
          </Link>
        </p>
      </div>

    </div>
  );
}
