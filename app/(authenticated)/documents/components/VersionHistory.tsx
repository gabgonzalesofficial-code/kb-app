'use client';

import { useState, useEffect } from 'react';

interface Version {
  id: string;
  version_number: number;
  filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  is_current: boolean;
}

interface VersionHistoryProps {
  documentId: string;
  onClose: () => void;
}

export default function VersionHistory({ documentId, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingVersion, setDownloadingVersion] = useState<number | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      setLoading(true);
      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }
        const data = await response.json();
        setVersions(data.versions || []);
      } catch (error) {
        console.error('Error fetching versions:', error);
        setVersions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [documentId]);

  const handleDownloadVersion = async (versionNumber: number) => {
    setDownloadingVersion(versionNumber);
    try {
      const response = await fetch(
        `/api/download-url?id=${documentId}&version=${versionNumber}`
      );
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { url, filename } = await response.json();

      // Open download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading version:', error);
      alert('Failed to download version. Please try again.');
    } finally {
      setDownloadingVersion(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Version History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600 dark:text-gray-400">Loading versions...</div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No versions found.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        v{version.version_number}
                      </span>
                      {version.is_current && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {version.filename}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(version.created_at)}</span>
                      <span>{formatFileSize(version.file_size)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {downloadingVersion === version.version_number ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <svg
                          className="h-5 w-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Downloading...
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadVersion(version.version_number)}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
