import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';

    const supabase = await createServerSupabaseClient();

    if (!query) {
      // Return all documents if no query
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
          { error: 'Failed to fetch documents' },
          { status: 500 }
        );
      }

      return NextResponse.json({ results: data || [] });
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

    const { data, error } = await supabase.rpc('search_documents', {
      search_query: query,
    });

    // If RPC doesn't exist, fall back to ilike search with manual ranking
    if (error) {
      console.log('RPC not available, using ilike search:', error.message);

      // Use full-text search on title and content_text (matching your GIN index)
      // Your schema has: to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,''))
      const { data: titleResults, error: titleError } = await supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by')
        .ilike('title', `%${query}%`);

      const { data: contentResults, error: contentError } = await supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by')
        .ilike('content_text', `%${query}%`);

      const { data: descResults, error: descError } = await supabase
        .from('documents')
        .select('id, title, description, s3_key, content_text, created_at, created_by')
        .ilike('description', `%${query}%`);

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
      const combined = [
        ...(titleResults || []).map((d) => ({ ...d, relevance: 3 })),
        ...(contentResults || []).filter((d) => !titleIds.has(d.id)).map((d) => ({ ...d, relevance: 2 })),
        ...(descResults || []).filter((d) => !titleIds.has(d.id) && !contentIds.has(d.id)).map((d) => ({ ...d, relevance: 1 })),
      ];

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
