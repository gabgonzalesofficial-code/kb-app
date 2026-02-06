'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session/token from the reset link
    async function checkSession() {
      const supabase = createClient();
      
      // Check for hash fragments in URL (Supabase redirects with hash)
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        try {
          // Parse the hash - Supabase format: #access_token=...&type=recovery&refresh_token=...
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log('Found hash with type:', type);
          
          if (accessToken && type === 'recovery') {
            // Exchange the token for a session
            const { data, error: exchangeError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (exchangeError) {
              console.error('Error exchanging token:', exchangeError);
              setIsValidToken(false);
              return;
            }
            
            if (data.session) {
              console.log('Session established successfully');
              setIsValidToken(true);
              // Clean up the URL by removing hash
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              return;
            } else {
              console.error('No session after exchange');
              setIsValidToken(false);
              return;
            }
          } else {
            console.log('Hash found but missing access_token or wrong type:', { accessToken: !!accessToken, type });
            setIsValidToken(false);
            return;
          }
        } catch (err) {
          console.error('Error processing hash:', err);
          setIsValidToken(false);
          return;
        }
      }
      
      // Check for existing session (user might have already exchanged the token)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setIsValidToken(false);
        return;
      }
      
      if (session) {
        console.log('Existing session found');
        setIsValidToken(true);
      } else {
        // If no hash and no session, the link is invalid
        console.log('No hash and no session - invalid link');
        setIsValidToken(false);
      }
    }

    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update password. The link may have expired.');
        setLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/login?message=Password reset successfully. Please sign in with your new password.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Verifying reset link...
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-medium">Invalid or expired reset link</p>
          <p className="mt-1">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="mt-3 text-xs">
            <p className="font-medium">Common issues:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Reset links expire after 1 hour</li>
              <li>Make sure you clicked the link directly from your email</li>
              <li>Don't modify or copy-paste the URL</li>
              <li>Check that the redirect URL is configured in Supabase Dashboard</li>
            </ul>
          </div>
        </div>
        <a
          href="/forgot-password"
          className="block w-full text-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
        >
          Request New Reset Link
        </a>
        <a
          href="/login"
          className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-gray-100 dark:focus:ring-gray-100"
            placeholder="••••••••"
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 6 characters long.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-gray-100 dark:focus:ring-gray-100"
            placeholder="••••••••"
            minLength={6}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}
