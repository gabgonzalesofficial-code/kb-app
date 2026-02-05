import { getUserWithProfile } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import HeaderContent from './HeaderContent';

export default async function Header() {
  const user = await getUserWithProfile();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:px-6 dark:border-gray-800 dark:bg-gray-900">
      <HeaderContent user={user} />
    </header>
  );
}
