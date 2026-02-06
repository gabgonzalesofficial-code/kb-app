'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchInput from '@/app/(authenticated)/documents/components/SearchInput';
import { usePermissionsContext } from '@/app/contexts/PermissionsContext';

interface Tool {
  id: string;
  name: string;
  url: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
  } | null;
}

export default function ToolsList() {
  const { permissions, userId, role } = usePermissionsContext();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTools(tools);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.url.toLowerCase().includes(query) ||
        (tool.description && tool.description.toLowerCase().includes(query))
    );
    setFilteredTools(filtered);
  }, [searchQuery, tools]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      setTools(data.tools || []);
      setFilteredTools(data.tools || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/tools/${editingId}` : '/api/tools';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tool');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', url: '', description: '' });
      fetchTools();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save tool');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingId(tool.id);
    setFormData({
      name: tool.name,
      url: tool.url,
      description: tool.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete tool');
      }

      fetchTools();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete tool');
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
    return <div className="text-gray-600 dark:text-gray-400">Loading tools...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Tools ({searchQuery ? filteredTools.length : tools.length})
        </h2>
        {permissions?.canEditEmailTemplates && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', url: '', description: '' });
            }}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
          >
            + New Tool
          </button>
        )}
      </div>

      <div className="max-w-2xl">
        <SearchInput
          onSearch={handleSearch}
          debounceMs={300}
          placeholder="Search tools..."
        />
      </div>

      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
        </div>
      )}

      {showForm && permissions?.canEditEmailTemplates && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? 'Edit Tool' : 'New Tool'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Tool name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Tool description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', url: '', description: '' });
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? `No tools found matching "${searchQuery}"`
              : 'No tools yet. Create your first tool!'}
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {tool.name}
                    </h3>
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 break-all"
                  >
                    {tool.url}
                  </a>
                  {tool.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Added: {formatDate(tool.created_at)}</span>
                    {tool.profiles && (
                      <span>• Added by: {tool.profiles.full_name || 'Unknown'}</span>
                    )}
                  </div>
                </div>
                {permissions?.canEditEmailTemplates && (() => {
                  // Editors can only edit/delete tools they created
                  // Admins can edit/delete any tool
                  const isOwnTool = tool.created_by === userId;
                  const canEditThisTool = role === 'admin' || isOwnTool;
                  
                  if (!canEditThisTool) return null;
                  
                  return (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(tool)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
