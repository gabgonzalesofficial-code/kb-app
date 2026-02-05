import { Suspense } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-lg dark:border-gray-800 dark:bg-gray-800">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>
        <div className="text-center">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
