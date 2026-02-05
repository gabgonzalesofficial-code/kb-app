'use client';

import { useState, useCallback } from 'react';
import SearchInput from './SearchInput';
import DocumentList from './DocumentList';
import type { Document } from './DocumentsServer';

interface DocumentsClientProps {
  initialDocuments: Document[];
}

export default function DocumentsClient({ initialDocuments }: DocumentsClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      fetchDocuments(query);
    } else {
      // Reset to initial documents if search is cleared
      setDocuments(initialDocuments);
    }
  }, [fetchDocuments, initialDocuments]);

  return (
    <>
      <div className="max-w-2xl">
        <SearchInput onSearch={handleSearch} />
      </div>

      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {documents.length} result{documents.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </div>
      )}

      <DocumentList documents={documents} loading={loading} onUpdate={() => fetchDocuments(searchQuery)} />
    </>
  );
}
