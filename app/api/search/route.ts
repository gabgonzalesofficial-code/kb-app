import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';

// Cache search results for 30 seconds (non-searchable queries)
export const revalidate = 30;

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  s3_key: string;
  content_text: string | null;
  created_at: string;
  created_by: string;
  relevance?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';

    const supabase = await createServerSupabaseClient();

    // Determine document visibility based on role
    // Admins: can see all documents
    // Editors: can only see public documents + their own private documents
    // Viewers: can only see public documents + their own private documents
    const isAdmin = user.role === 'admin';
    const isEditor = user.role === 'editor';

    if (!query) {
      // Return all documents if no query - use cached response
      let documentsQuery = supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply visibility filters
      if (!isAdmin) {
        // Editors and viewers can only see public documents or documents they created
        documentsQuery = documentsQuery.or(`is_public.eq.true,created_by.eq.${user.id}`);
      }

      const { data, error } = await documentsQuery;

      if (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
          { error: 'Failed to fetch documents' },
          { status: 500 }
        );
      }

      // Filter client-side as well for safety (RLS allows all documents)
      const filteredData = (data || []).filter((doc) => {
        // Normalize is_public value (handle boolean, string, null, undefined)
        const isPublicValue = doc.is_public;
        const isPublic = isPublicValue === true || isPublicValue === 'true' || isPublicValue === null || isPublicValue === undefined;
        const isPrivate = isPublicValue === false || isPublicValue === 'false';
        
        // Always show public documents
        if (isPublic) {
          return true;
        }
        
        // For private documents, check permissions
        if (isPrivate) {
          // Admins can see all private documents
          if (isAdmin) {
            return true;
          }
          // Editors and viewers can only see their own private documents
          return doc.created_by === user.id;
        }
        
        // If we can't determine, hide it
        return false;
      });

      // Add cache headers for non-search queries
      return NextResponse.json(
        { results: filteredData },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    // Use Postgres full-text search with tsvector
    // First, ensure the search_vector column exists (or use a computed column)
    // For now, we'll use a text search on title and description
    const searchQuery = query
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => `%${word}%`)
      .join(' ');

    // Use Postgres full-text search with to_tsvector
    // This requires a search_vector column or we can use ilike for simpler search
    // For better performance, we'll use a combination of text search and ranking

    const { data: rpcData, error: rpcError } = await supabase.rpc('search_documents', {
      search_query: query,
    });

    // If RPC exists and returns data, we need to fetch is_public separately and filter
    if (!rpcError && rpcData && rpcData.length > 0) {
      // Fetch full document data including is_public for the RPC results
      const documentIds = rpcData.map((doc: { id: string }) => doc.id);
      let fullDataQuery = supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
        .in('id', documentIds);

      // Apply visibility filter
      if (!isAdmin) {
        // Editors and viewers can only see public documents or documents they created
        fullDataQuery = fullDataQuery.or(`is_public.eq.true,created_by.eq.${user.id}`);
      }

      const { data: fullData, error: fullDataError } = await fullDataQuery;

      if (fullDataError) {
        console.error('Error fetching full document data:', fullDataError);
        // Fall through to ilike search
      } else if (fullData) {
        // Filter client-side as well for safety (RLS allows all documents)
        const filteredRpcData = fullData.filter((doc) => {
          // Normalize is_public value
          const isPublicValue = doc.is_public;
          const isPublic = isPublicValue === true || isPublicValue === 'true' || isPublicValue === null || isPublicValue === undefined;
          const isPrivate = isPublicValue === false || isPublicValue === 'false';
          
          if (isPublic) return true;
          if (isPrivate) {
            // Admins can see all private documents
            if (isAdmin) return true;
            // Editors and viewers can only see their own private documents
            return doc.created_by === user.id;
          }
          return false;
        });

        // Merge relevance from RPC results
        const relevanceMap = new Map(
          (rpcData || []).map((doc: { id: string; relevance?: number }) => [
            doc.id,
            doc.relevance || 0,
          ])
        );

        const resultsWithRelevance = filteredRpcData.map((doc) => ({
          ...doc,
          relevance: relevanceMap.get(doc.id) || 0,
        }));

        // Sort by relevance (higher first), then by created_at
        resultsWithRelevance.sort((a, b) => {
          if (a.relevance !== b.relevance) {
            return (b.relevance || 0) - (a.relevance || 0);
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return NextResponse.json({ results: resultsWithRelevance });
      }
    }

    // If RPC doesn't exist or failed, fall back to ilike search with manual ranking
    if (rpcError) {
      console.log('RPC not available, using ilike search:', rpcError.message);

      // Use full-text search on title and content_text (matching your GIN index)
      // Your schema has: to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,''))
      let titleQuery = supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
        .ilike('title', `%${query}%`);

      let contentQuery = supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
        .ilike('content_text', `%${query}%`);

      let descQuery = supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
        .ilike('description', `%${query}%`);

      // Apply visibility filter
      if (!isAdmin) {
        // Editors and viewers can only see public documents or documents they created
        const visibilityFilter = `is_public.eq.true,created_by.eq.${user.id}`;
        titleQuery = titleQuery.or(visibilityFilter);
        contentQuery = contentQuery.or(visibilityFilter);
        descQuery = descQuery.or(visibilityFilter);
      }

      const { data: titleResults, error: titleError } = await titleQuery;
      const { data: contentResults, error: contentError } = await contentQuery;
      const { data: descResults, error: descError } = await descQuery;

      if (titleError || contentError || descError) {
        console.error('Error searching documents:', titleError || contentError || descError);
        return NextResponse.json(
          { error: 'Failed to search documents' },
          { status: 500 }
        );
      }

      // Combine and deduplicate results, prioritizing title matches, then content_text
      const titleIds = new Set((titleResults || []).map((d) => d.id));
      const contentIds = new Set((contentResults || []).map((d) => d.id));
      let combined = [
        ...(titleResults || []).map((d) => ({ ...d, relevance: 3 })),
        ...(contentResults || []).filter((d) => !titleIds.has(d.id)).map((d) => ({ ...d, relevance: 2 })),
        ...(descResults || []).filter((d) => !titleIds.has(d.id) && !contentIds.has(d.id)).map((d) => ({ ...d, relevance: 1 })),
      ];

      // Filter client-side as well for safety (RLS allows all documents)
      combined = combined.filter((doc) => {
        // Normalize is_public value
        const isPublicValue = doc.is_public;
        const isPublic = isPublicValue === true || isPublicValue === 'true' || isPublicValue === null || isPublicValue === undefined;
        const isPrivate = isPublicValue === false || isPublicValue === 'false';
        
        if (isPublic) return true;
        if (isPrivate) {
          // Admins can see all private documents
          if (isAdmin) return true;
          // Editors and viewers can only see their own private documents
          return doc.created_by === user.id;
        }
        return false;
      });

      // Sort by relevance (higher first), then by created_at
      combined.sort((a, b) => {
        if (a.relevance !== b.relevance) {
          return (b.relevance || 0) - (a.relevance || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return NextResponse.json({ results: combined });
    }

    // If RPC exists, use it (results should already be sorted by relevance)
    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
