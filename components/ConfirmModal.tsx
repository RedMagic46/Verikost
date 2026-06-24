'use client';

import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-500',
      icon: Trash2,
      btnBg: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/25',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-500',
      icon: AlertTriangle,
      btnBg: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/25',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-500',
      icon: CheckCircle2,
      btnBg: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/25',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-955/20',
      text: 'text-primary',
      icon: HelpCircle,
      btnBg: 'bg-primary hover:bg-blue-600 focus:ring-primary/25',
    },
  };

  const current = iconConfig[variant] || iconConfig.danger;
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Icon */}
        <div className={`h-14 w-14 ${current.bg} ${current.text} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
          <IconComponent className="h-7 w-7" />
        </div>
        
        {/* Texts */}
        <div className="space-y-2 text-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer ${current.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
