'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Permission } from '@/lib/permissions';

interface PermissionsContextType {
  permissions: Permission | null;
  role: string | null;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: null,
  role: null,
  loading: true,
});

export function usePermissionsContext() {
  return useContext(PermissionsContext);
}

interface PermissionsProviderProps {
  children: ReactNode;
  permissions: Permission | null;
  role: string | null;
  loading?: boolean;
}

export function PermissionsProvider({
  children,
  permissions,
  role,
  loading = false,
}: PermissionsProviderProps) {
  return (
    <PermissionsContext.Provider value={{ permissions, role, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}
