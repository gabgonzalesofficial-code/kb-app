import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-sm"></div>
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Knowledge Repository
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl xl:text-2xl text-gray-500 dark:text-gray-400 ml-2 mb-8">
            Platform
          </p>
          
          {/* Description Paragraphs */}
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-base leading-relaxed">
              Store, organize, and retrieve all your knowledge securely in one central place.
            </p>
            <p className="text-base leading-relaxed">
              Benefit from instant access to your essential documents, collaboration tools and advanced search capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-sm"></div>
            <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-900 dark:bg-gray-100" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          </div>
          
          <div>
            <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
              Sign in
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your email and password to continue
            </p>
          </div>
          
          <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
