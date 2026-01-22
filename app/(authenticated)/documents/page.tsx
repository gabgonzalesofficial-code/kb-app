'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchInput from './components/SearchInput';
import DocumentList, { Document } from './components/DocumentList';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/search?q=${encodeURIComponent(query)}`
        : '/api/search';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.results || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments('');
  }, [fetchDocuments]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    fetchDocuments(query);
  }, [fetchDocuments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Documents
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Search and download documents from your knowledge base.
        </p>
      </div>

      <div className="max-w-2xl">
        <SearchInput onSearch={handleSearch} />
      </div>

      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {documents.length} result{documents.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </div>
      )}

      <DocumentList documents={documents} loading={loading} onUpdate={() => fetchDocuments(searchQuery)} />
    </div>
  );
}
