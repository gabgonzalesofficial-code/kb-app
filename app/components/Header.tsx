import { getUserWithProfile } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function Header() {
  const user = await getUserWithProfile();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          KB App
        </h1>
        <nav className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
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
    </header>
  );
}
