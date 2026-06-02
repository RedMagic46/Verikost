'use client';

import React from 'react';
import { useApp } from '@/app/context/AppContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'PARENT' | 'OWNER' | 'ADMIN')[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { currentUser } = useApp();

  
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
