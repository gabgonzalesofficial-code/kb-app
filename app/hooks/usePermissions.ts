'use client';

import { useEffect, useState } from 'react';
import { Permission } from '@/lib/permissions';

/**
 * @deprecated Use usePermissionsContext from '@/app/contexts/PermissionsContext' instead.
 * This hook makes an API call on every component mount, which is inefficient.
 * The PermissionsContext provides permissions fetched once at the layout level.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch('/api/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  return { permissions, loading };
}
