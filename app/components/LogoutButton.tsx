'use client';

import { signOut } from '@/app/actions/auth';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md bg-gray-100 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
