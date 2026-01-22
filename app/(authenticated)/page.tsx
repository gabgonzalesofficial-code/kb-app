// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to your knowledge base application.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Start
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Get started by exploring the navigation menu.
          </p>
        </div>
      </div>
    </div>
  );
}
