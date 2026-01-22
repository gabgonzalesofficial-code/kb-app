'use client';

import { ReactNode, useEffect, useState } from 'react';

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
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        const response = await fetch('/api/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setHasAccess(allowedRoles.includes(data.role));
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        setHasAccess(false);
      }
    }

    checkRole();
  }, [allowedRoles]);

  if (hasAccess === null) {
    return null;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
