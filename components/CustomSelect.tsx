'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minimal';
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  icon,
  className = '',
  variant = 'default',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  
  const buttonStyles =
    variant === 'minimal'
      ? `w-full flex items-center justify-between gap-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 py-2 px-2 rounded-xl border border-transparent outline-none transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 focus:bg-slate-100/50 dark:focus:bg-slate-800/50'
        }`
      : `w-full flex items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 py-2.5 px-4 rounded-xl border border-border outline-none transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-primary/20'
        }`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={buttonStyles}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="font-semibold truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-border dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/5 text-primary font-bold dark:bg-primary/10'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
