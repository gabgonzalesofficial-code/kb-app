import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';

// PATCH update personal note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserWithProfile();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verify note belongs to user
    const { data: existingNote, error: fetchError } = await supabase
      .from('personal_notes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    if (existingNote.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own notes' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('personal_notes')
      .update({
        title,
        content,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: data });
  } catch (error) {
    console.error('Error in notes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE personal note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserWithProfile();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verify note belongs to user
    const { data: existingNote, error: fetchError } = await supabase
      .from('personal_notes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    if (existingNote.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own notes' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('personal_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
