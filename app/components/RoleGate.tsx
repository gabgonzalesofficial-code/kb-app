'use client';

import { ReactNode } from 'react';
import { usePermissionsContext } from '@/app/contexts/PermissionsContext';

interface RoleGateProps {
  allowedRoles: ('admin' | 'editor' | 'viewer')[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) {
  const { role, loading } = usePermissionsContext();

  if (loading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role as 'admin' | 'editor' | 'viewer')) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
