'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Mail, ShieldAlert, Check, ChevronLeft, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Format alamat email tidak valid.' })
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Kata sandi minimal 8 karakter.' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok.',
  path: ['confirmPassword'],
});

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetAttempts, setResetAttempts] = useState<number[]>([]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();
    const result = forgotPasswordSchema.safeParse({ email: normalizedEmail });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
      } else {
        setStep('otp');
        setResendCountdown(60);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length < 6) {
      setError('Kode OTP harus 6 digit.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: email.trim().toLowerCase(), otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kode OTP tidak valid atau kedaluwarsa.');
      } else {
        setStep('reset');
      }
    } catch {
      setError('Terjadi kesalahan saat memverifikasi kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim ulang OTP.');
      } else {
        setResendCountdown(60);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const now = Date.now();
    const activeAttempts = resetAttempts.filter(ts => now - ts < 60000);

    if (activeAttempts.length >= 5) {
      const oldestAttempt = activeAttempts[0];
      const resetTime = Math.ceil((oldestAttempt + 60000 - now) / 1000);
      setError(`Terlalu banyak percobaan reset kata sandi. Silakan tunggu ${resetTime} detik.`);
      return;
    }

    setResetAttempts([...activeAttempts, now]);

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errors: { password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'password') errors.password = err.message;
        if (err.path[0] === 'confirmPassword') errors.confirmPassword = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mengubah kata sandi.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('Terjadi kesalahan saat menyimpan kata sandi baru.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">

      {isSuccess ? (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Kata Sandi <span className="brand-gradient-text">Berhasil Direset</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kata sandi akun Anda telah diperbarui. Silakan login kembali.
          </p>
        </div>
      ) : step === 'email' ? (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Lupa <span className="brand-gradient-text">Kata Sandi</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Masukkan alamat email terdaftar Anda untuk menerima kode OTP pemulihan kata sandi.
          </p>
        </div>
      ) : step === 'otp' ? (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Verifikasi <span className="brand-gradient-text">OTP</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Masukkan 6-digit kode OTP yang telah kami kirimkan ke email <strong>{email}</strong>.
          </p>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Kata Sandi <span className="brand-gradient-text">Baru</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Buat kata sandi baru yang aman untuk akun Anda.
          </p>
        </div>
      )}

      {error && (
        <div className="flex gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
      ) : step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat Email Terdaftar</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3.5 py-2.5 transition-colors focus-within:border-primary">
              <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full text-base md:text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Kirim Kode OTP'
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
      ) : step === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kode OTP</label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-border px-3.5 py-2.5 transition-colors focus-within:border-primary">
              <KeyRound className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <input
                type="text"
                maxLength={6}
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                className="w-full text-lg bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400 font-mono tracking-[6px] text-center"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Verifikasi Kode OTP'
            )}
          </button>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0 || isLoading}
              className="w-full py-3 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              {resendCountdown > 0 ? `Kirim Ulang OTP (${resendCountdown}s)` : 'Kirim Ulang OTP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
                setOtp('');
              }}
              disabled={isLoading}
              className="text-center text-xs text-primary hover:underline font-semibold mt-1"
            >
              Ubah Alamat Email
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi Baru</label>
            <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary'}`}>
              <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full text-base md:text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
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
            {fieldErrors.password && <p className="text-[10px] text-rose-500 font-bold pl-1">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Kata Sandi</label>
            <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl border px-3.5 py-2.5 transition-colors ${fieldErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-border focus-within:border-primary'}`}>
              <Lock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full text-base md:text-sm bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
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
            {fieldErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold pl-1">{fieldErrors.confirmPassword}</p>}
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
        </form>
      )}

    </div>
  );
}
