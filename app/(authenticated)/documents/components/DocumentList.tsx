'use client';

import { useState } from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';
import EditDocumentModal from './EditDocumentModal';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  s3_key: string;
  content_text: string | null;
  created_at: string;
  created_by: string;
}

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onUpdate?: () => void;
}

export default function DocumentList({ documents, loading, onUpdate }: DocumentListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { permissions } = usePermissions();

  const handleDownload = async (documentId: string) => {
    setDownloadingId(documentId);
    try {
      const response = await fetch(`/api/download-url?id=${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { url, filename } = await response.json();
      
      // Open download link in new tab
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEdit = async (id: string, title: string, description: string | null) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      setEditingId(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">No documents found.</p>
      </div>
    );
  }

  const editingDocument = editingId
    ? documents.find((d) => d.id === editingId)
    : null;

  return (
    <>
      {editingDocument && (
        <EditDocumentModal
          document={editingDocument}
          onClose={() => setEditingId(null)}
          onSave={handleEdit}
        />
      )}
      <div className="space-y-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {document.title}
                </h3>
                {document.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {document.description}
                  </p>
                )}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(document.created_at)}</span>
              </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                {downloadingId === document.id ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
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
                  <>
                    <button
                      onClick={() => handleDownload(document.id)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Download
                    </button>
                    {permissions?.canEdit && (
                      <button
                        onClick={() => setEditingId(document.id)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                    )}
                    {permissions?.canDelete && (
                      <button
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === document.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
