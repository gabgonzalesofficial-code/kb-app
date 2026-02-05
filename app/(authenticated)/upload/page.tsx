import UploadForm from './UploadForm';
import PermissionGate from '@/app/components/PermissionGate';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function UploadPage() {
  return (
    <PermissionGate
      permission="canUpload"
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Upload Document
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You don't have permission to upload documents.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Upload Document
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Upload a new document to your knowledge base.
          </p>
        </div>
        <UploadForm />
      </div>
    </PermissionGate>
  );
}
