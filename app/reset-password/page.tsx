import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-lg dark:border-gray-800 dark:bg-gray-800">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Set New Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
