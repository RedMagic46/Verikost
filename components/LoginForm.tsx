'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Format alamat email tidak valid.' }),
  password: z.string().min(1, { message: 'Kata sandi tidak boleh kosong.' })
});

export default function LoginForm() {
  const router = useRouter();
  const { login, currentUser, authLoading } = useApp();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const result = loginSchema.safeParse({ email: normalizedEmail, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(normalizedEmail, password);
      if (res.success) {
        setIsSuccess(true);
        if (rememberMe) {
          localStorage.setItem('vk_remember_email', normalizedEmail);
        } else {
          localStorage.removeItem('vk_remember_email');
        }
        setTimeout(() => {
          if (res.role === 'OWNER') {
            router.push('/owner');
          } else if (res.role === 'ADMIN') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        setServerError(res.error || 'Autentikasi gagal.');
      }
    } catch (err) {
      setServerError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };


  React.useEffect(() => {
    const saved = localStorage.getItem('vk_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);


  React.useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.role === 'OWNER') {
        router.push('/owner');
      } else if (currentUser.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [currentUser, authLoading, router]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">


      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Masuk ke <span className="brand-gradient-text">VeriKost</span>
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Gunakan akun terverifikasi Anda untuk mencari kosan bebas khawatir.
        </p>
      </div>

      {serverError && (
        <div className="flex gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-shake">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>Login berhasil! Mengalihkan ke dashboard...</span>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">


        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Kampus / Umum</label>
          <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${errors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
            <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSuccess}
              className="w-full text-base md:text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>
          {errors.email && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.email}</p>}
        </div>


        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi</label>
          <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${errors.password ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
            <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isSuccess}
              className="w-full text-base md:text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.password}</p>}
        </div>


        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || isSuccess}
              className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary focus:ring-2 cursor-pointer"
            />
            <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              Ingat Email Saya
            </span>
          </label>
          <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
            Lupa Sandi?
          </Link>
        </div>


        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Masuk Ke Akun'
          )}
        </button>

      </form>


      <div className="text-center pt-2 border-t border-border/80">
        <p className="text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>

    </div>
  );
}
