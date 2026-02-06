import EmailTemplatesList from './EmailTemplatesList';
import PermissionGate from '@/app/components/PermissionGate';

export const dynamic = 'force-dynamic';

export default function EmailTemplatesPage() {
  // All authenticated users can see email templates (viewers can view, editors/admins can edit)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Email Templates
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Create and manage email templates for your communications.
        </p>
      </div>
      <EmailTemplatesList />
    </div>
  );
}
