'use client';

import { useEffect, useState } from 'react';
import PermissionGate from './PermissionGate';
import RoleGate from './RoleGate';

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const response = await fetch('/api/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
      }
    }
    fetchRole();
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊', permission: null },
    { label: 'Upload', href: '/upload', icon: '📤', permission: 'canUpload' as const },
    { label: 'Documents', href: '/documents', icon: '📄', permission: null },
    { label: 'Users', href: '/users', icon: '👥', permission: 'canManageUsers' as const },
    { label: 'Settings', href: '/settings', icon: '⚙️', permission: null },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <nav className="flex h-full flex-col p-4">
        <div className="mb-8 mt-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Navigation
          </h2>
        </div>
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            if (item.permission) {
              return (
                <PermissionGate
                  key={item.href}
                  permission={item.permission}
                  fallback={null}
                >
                  <li>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </a>
                  </li>
                </PermissionGate>
              );
            }
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
