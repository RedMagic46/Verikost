'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { z } from 'zod';
import { Lock, Eye, EyeOff, ShieldAlert, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Kata sandi minimal 8 karakter.' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok.',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    // This fires when user clicks the reset link in their email
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    // Also check if there's already a session (user might have already been redirected)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setServerError(error.message);
      } else {
        setIsSuccess(true);
        // Sign out after password reset so user can login with new password
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch {
      setServerError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm text-muted-foreground">Memverifikasi tautan...</p>
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse-slow"></div>

        <div className="mb-6 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="VeriKost Logo" 
              className="h-10 w-10 object-contain" 
            />
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              VeriKost<span className="brand-gradient-text">Malang</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tautan Tidak Valid atau Kedaluwarsa</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tautan pemulihan kata sandi ini sudah tidak berlaku. Silakan minta tautan baru melalui halaman lupa kata sandi.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              Minta Tautan Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-sky-400/5 blur-3xl animate-pulse-slow"></div>

      <div className="mb-6 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="VeriKost Logo" 
            className="h-10 w-10 object-contain" 
          />
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            VeriKost<span className="brand-gradient-text">Malang</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Reset <span className="brand-gradient-text">Kata Sandi</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        {serverError && (
          <div className="flex gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Kata Sandi Berhasil Direset!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kata sandi Anda telah diperbarui. Anda akan dialihkan ke halaman login...
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi Baru</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${errors.password ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
                <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-base md:text-sm bg-transparent rounded-xl outline-none text-slate-800 dark:text-white placeholder-slate-400"
                  required
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi</label>
              <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${errors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
                <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-base md:text-sm bg-transparent rounded-xl outline-none text-slate-800 dark:text-white placeholder-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Simpan Kata Sandi Baru'
              )}
            </button>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>

          </form>
        )}
      </div>
    </div>
  );
}
