'use client';

import React from 'react';
import { Review } from '@/app/types';
import { Star, ShieldCheck } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={review.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&eyebrows=defaultNatural&mouth=smile'}
            alt={review.userName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {review.userName}
              </h4>
              {review.verifiedTenant && (
                <span 
                  className="inline-flex items-center gap-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 py-0.5 px-1.5 text-[9px] font-bold border border-emerald-100 dark:border-emerald-900/30"
                  title="Penyewa Terverifikasi Lapangan"
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span>Penyewa Verifikasi</span>
                </span>
              )}
              {review.status && (
                <span className={`inline-flex items-center gap-0.5 rounded py-0.5 px-1.5 text-[9px] font-bold border leading-none ${
                  review.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                    : review.status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                    : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                }`}>
                  {review.status === 'approved' ? 'Disetujui' : review.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatDate(review.date)}
            </p>
          </div>
        </div>

        <div className="flex gap-0.5 shrink-0 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-slate-200 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        "{review.comment}"
      </p>
    </div>
  );
}
