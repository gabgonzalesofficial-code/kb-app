import ToolsList from './ToolsList';

// Force dynamic rendering for auth state
export const dynamic = 'force-dynamic';

export default function ToolsPage() {
  // All authenticated users can see tools (viewers can view, editors/admins can edit)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tools
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Access and manage useful tools and resources for your work.
        </p>
      </div>
      <ToolsList />
    </div>
  );
}
