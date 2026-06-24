'use client';

import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
  status: 'none' | 'verified' | 'highly-trusted';
  size?: 'sm' | 'md';
}

export default function VerificationBadge({ status, size = 'sm' }: VerificationBadgeProps) {
  if (status === 'none') return null;

  const isSm = size === 'sm';

  return (
    <div 
      className={`flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold rounded-lg border border-emerald-200 dark:border-emerald-900/50 ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs'
      }`}
    >
      <BadgeCheck className={`${isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-emerald-500`} />
      <span>Terverifikasi</span>
    </div>
  );
}
