'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Permission } from '@/lib/permissions';

interface PermissionsContextType {
  permissions: Permission | null;
  role: string | null;
  userId: string | null;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: null,
  role: null,
  userId: null,
  loading: true,
});

export function usePermissionsContext() {
  return useContext(PermissionsContext);
}

interface PermissionsProviderProps {
  children: ReactNode;
  permissions: Permission | null;
  role: string | null;
  userId: string | null;
  loading?: boolean;
}

export function PermissionsProvider({
  children,
  permissions,
  role,
  userId,
  loading = false,
}: PermissionsProviderProps) {
  return (
    <PermissionsContext.Provider value={{ permissions, role, userId, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}
