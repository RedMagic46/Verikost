'use client';

import React from 'react';

interface AvailabilityIndicatorProps {
  availability: 'available' | 'limited' | 'full';
  showLabel?: boolean;
}

export default function AvailabilityIndicator({ availability, showLabel = true }: AvailabilityIndicatorProps) {
  let dotColor = 'bg-emerald-500';
  let pillBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
  let label = 'Tersedia';

  if (availability === 'limited') {
    dotColor = 'bg-amber-500';
    pillBg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
    label = 'Hampir Penuh';
  } else if (availability === 'full') {
    dotColor = 'bg-rose-500';
    pillBg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
    label = 'Penuh';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${pillBg}`}>
      <span className={`relative flex h-2 w-2`}>
        {availability !== 'full' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
      </span>
      {showLabel && <span>{label}</span>}
    </div>
  );
}
