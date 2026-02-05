export default function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
}
