import { NextResponse } from 'next/server';
import { DrawService } from '@/server/services/draw-service';
import { requireAdmin } from '@/lib/supabase/server';

export async function POST(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const draw = await DrawService.publish(id);
    return NextResponse.json(draw);
  } catch (error) {
    console.error('Error publishing draw:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to publish draw' }, { status: 500 });
  }
}
