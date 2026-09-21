import { NextResponse } from 'next/server';
import { CharityService } from '@/server/services/charity-service';
import { requireAdmin } from '@/lib/supabase/server';

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const charity = await CharityService.update(id, body);
    return NextResponse.json(charity);
  } catch (error) {
    console.error('Error updating charity:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update charity' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await CharityService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting charity:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to delete charity' }, { status: 500 });
  }
}
