'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PermissionGate from './PermissionGate';
import RoleGate from './RoleGate';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  // Note: Role is now fetched from context, but we don't need it here anymore
  // Keeping for potential future use

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊', permission: null },
    { label: 'Upload', href: '/upload', icon: '📤', permission: 'canUpload' as const },
    { label: 'Documents', href: '/documents', icon: '📄', permission: null },
    { label: 'Email Templates', href: '/email-templates', icon: '📧', permission: null }, // All users can see, editors/admins can edit
    { label: 'Tools', href: '/tools', icon: '🔧', permission: null }, // All users can see, editors/admins can edit
    { label: 'Personal Notes', href: '/notes', icon: '📝', permission: null }, // All users
    { label: 'Users', href: '/users', icon: '👥', permission: 'canManageUsers' as const },
    { label: 'Settings', href: '/settings', icon: '⚙️', permission: null },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="flex h-full flex-col p-4">
          <div className="mb-8 mt-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
                        className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
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
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
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
    </>
  );
}
