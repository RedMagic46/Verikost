'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'PARENT' | 'OWNER' | 'ADMIN')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    
    if (authLoading) return;

    
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      router.replace('/403');
    }
  }, [currentUser, allowedRoles, router, authLoading]);

  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground font-semibold">Memuat akun Anda...</p>
        </div>
      </div>
    );
  }

  
  if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
