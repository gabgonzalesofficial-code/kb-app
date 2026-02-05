'use client';

import { ReactNode } from 'react';
import { usePermissionsContext } from '@/app/contexts/PermissionsContext';

interface PermissionGateProps {
  permission: 'canUpload' | 'canEdit' | 'canDelete' | 'canManageUsers' | 'canRead';
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { permissions, loading } = usePermissionsContext();

  if (loading) {
    return null;
  }

  if (!permissions || !permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
