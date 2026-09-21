import { NextResponse } from 'next/server';
import { DrawService } from '@/server/services/draw-service';
import { requireAdmin } from '@/lib/supabase/server';

export async function POST(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await DrawService.simulate(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error simulating draw:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to simulate draw' }, { status: 500 });
  }
}
