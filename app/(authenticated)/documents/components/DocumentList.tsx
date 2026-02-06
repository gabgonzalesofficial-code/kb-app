'use client';

import { useState } from 'react';
import { usePermissionsContext } from '@/app/contexts/PermissionsContext';
import EditDocumentModal from './EditDocumentModal';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  s3_key: string;
  content_text: string | null;
  created_at: string;
  created_by: string;
  is_public?: boolean;
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
  const { permissions, userId, role } = usePermissionsContext();

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
            className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                    {document.title}
                  </h3>
                  {document.is_public === false && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Private
                    </span>
                  )}
                </div>
                {document.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {document.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(document.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4 sm:gap-2">
                {downloadingId === document.id ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 py-2">
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
                    <span className="sm:hidden">Downloading...</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleDownload(document.id)}
                      className="w-full sm:w-auto rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
                    >
                      Download
                    </button>
                    {permissions?.canEdit && (() => {
                      // Editors can only edit public documents or their own private documents
                      // Admins can edit any document
                      const isPublic = document.is_public === true || 
                                       document.is_public === null || 
                                       document.is_public === undefined;
                      const isOwnDocument = document.created_by === userId;
                      const canEditThisDoc = role === 'admin' || 
                                            isPublic ||
                                            isOwnDocument;
                      
                      if (!canEditThisDoc) return null;
                      
                      return (
                        <button
                          onClick={() => setEditingId(document.id)}
                          className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Edit
                        </button>
                      );
                    })()}
                    {permissions?.canDelete && (
                      <button
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                        className="w-full sm:w-auto rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
