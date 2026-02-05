import { Suspense } from 'react';
import DocumentsServer from './components/DocumentsServer';
import DocumentListSkeleton from './components/DocumentListSkeleton';

// Force dynamic rendering for auth state
export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Documents
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Search and download documents from your knowledge base.
        </p>
      </div>

      <Suspense fallback={<DocumentListSkeleton />}>
        <DocumentsServer />
      </Suspense>
    </div>
  );
}
