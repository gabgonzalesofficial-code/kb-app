import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileLayoutWrapper from '../components/MobileLayoutWrapper';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { getUserWithProfile } from '@/lib/auth';
import { getUserPermissions } from '@/lib/permissions';

// Force dynamic rendering since we need auth state
export const dynamic = 'force-dynamic';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user and permissions once at layout level
  const user = await getUserWithProfile();
  const permissions = getUserPermissions(user);

  return (
    <PermissionsProvider
      permissions={permissions}
      role={user?.role || null}
      userId={user?.id || null}
      loading={false}
    >
      <div className="flex min-h-screen bg-white dark:bg-gray-900">
        <MobileLayoutWrapper>
          <div className="flex flex-1 flex-col lg:ml-64">
            <Header />
            <main className="flex-1 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">{children}</main>
            <Footer />
          </div>
        </MobileLayoutWrapper>
      </div>
    </PermissionsProvider>
  );
}
