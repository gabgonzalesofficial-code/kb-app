import Header from '../components/Header';
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
      loading={false}
    >
      <div className="flex min-h-screen">
        <MobileLayoutWrapper>
          <div className="flex flex-1 flex-col lg:ml-64">
            <Header />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </MobileLayoutWrapper>
      </div>
    </PermissionsProvider>
  );
}
