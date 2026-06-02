'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Mail, ShieldAlert, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Format alamat email tidak valid.' })
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
      
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Lupa <span className="brand-gradient-text">Kata Sandi</span>
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Masukkan alamat email terdaftar Anda untuk menerima tautan pemulihan sandi.
        </p>
      </div>

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
          <div className="space-y-1.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tautan Pemulihan Dikirim!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kami telah mengirimkan instruksi pemulihan sandi ke email <strong>{email}</strong>. Periksa folder spam Anda jika tidak menerimanya dalam beberapa menit.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
              'Kirim Link Pemulihan'
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
  );
}
