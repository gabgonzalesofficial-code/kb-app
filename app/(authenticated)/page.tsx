import { Suspense } from 'react';
import DashboardStatsServer from './components/DashboardStatsServer';
import DashboardStatsSkeleton from './components/DashboardStatsSkeleton';

// Force dynamic rendering for auth state
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Overview of your Knowledge Repository statistics and activity.
        </p>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsServer />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get started by exploring the navigation menu or uploading your first document.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/upload"
              className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
            >
              📤 Upload Document
            </a>
            <a
              href="/documents"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              📄 View Documents
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your recent activity and updates will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
