'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';

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
  const { permissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!permissions || !permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
