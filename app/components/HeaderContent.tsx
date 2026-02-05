'use client';

import LogoutButton from './LogoutButton';
import MobileMenuButton from './MobileMenuButton';

interface HeaderContentProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
  } | null;
}

export default function HeaderContent({ user }: HeaderContentProps) {
  return (
    <div className="flex w-full items-center justify-between min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <MobileMenuButton />
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
          Knowledge Repository
        </h1>
      </div>
      <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.full_name || user.email}
              </p>
              {user.role && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              )}
            </div>
            <LogoutButton />
          </div>
        )}
      </nav>
    </div>
  );
}
