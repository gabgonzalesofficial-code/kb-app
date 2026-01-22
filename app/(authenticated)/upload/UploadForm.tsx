'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface UploadState {
  status: 'idle' | 'uploading' | 'saving' | 'success' | 'error';
  progress: number;
  error: string | null;
}

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (20MB)
      const maxSize = 20 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setUploadState({
          status: 'error',
          progress: 0,
          error: 'File size exceeds 20MB limit',
        });
        return;
      }
      setFile(selectedFile);
      setUploadState({ status: 'idle', progress: 0, error: null });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please select a file',
      });
      return;
    }

    if (!title.trim()) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please enter a title',
      });
      return;
    }


    try {
      // Step 1: Get signed URL
      setUploadState({ status: 'uploading', progress: 0, error: null });

      const uploadUrlResponse = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { signedUrl, key, bucket } = await uploadUrlResponse.json();

      // Step 2: Upload file directly to S3 with progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 90); // 90% for upload
            setUploadState({
              status: 'uploading',
              progress: percentComplete,
              error: null,
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Failed to upload file to S3'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setUploadState({ status: 'saving', progress: 95, error: null });

      // Step 3: Save metadata to Supabase
      const saveResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          s3Key: key,
          contentText: null, // You can extract text from file if needed
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save document metadata');
      }

      setUploadState({ status: 'success', progress: 100, error: null });

      // Reset form and redirect after 2 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setFile(null);
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploadState.status === 'uploading' || uploadState.status === 'saving'}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 disabled:opacity-50"
            placeholder="Enter document title"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploadState.status === 'uploading' || uploadState.status === 'saving'}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 disabled:opacity-50"
            placeholder="Enter document description (optional)"
          />
        </div>

        {/* File Picker */}
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            File <span className="text-red-500">*</span>
          </label>
          <input
            id="file"
            type="file"
            required
            onChange={handleFileChange}
            disabled={uploadState.status === 'uploading' || uploadState.status === 'saving'}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900 dark:file:text-blue-300 disabled:opacity-50"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        {(uploadState.status === 'uploading' || uploadState.status === 'saving') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {uploadState.status === 'uploading' ? 'Uploading...' : 'Saving metadata...'}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {uploadState.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState.status === 'success' && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Document uploaded successfully! Redirecting...
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadState.status === 'error' && uploadState.error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {uploadState.error}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={
              uploadState.status === 'uploading' ||
              uploadState.status === 'saving' ||
              uploadState.status === 'success'
            }
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadState.status === 'uploading'
              ? 'Uploading...'
              : uploadState.status === 'saving'
              ? 'Saving...'
              : uploadState.status === 'success'
              ? 'Uploaded!'
              : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
