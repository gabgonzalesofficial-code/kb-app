export default function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}
