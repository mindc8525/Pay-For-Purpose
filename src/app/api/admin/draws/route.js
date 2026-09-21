import { NextResponse } from 'next/server';
import { DrawService } from '@/server/services/draw-service';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const draws = await DrawService.list();
    return NextResponse.json(draws);
  } catch (error) {
    console.error('Error fetching draws:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { draw_period, strategy_type, config } = body;

    if (!draw_period || !strategy_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const draw = await DrawService.create(draw_period, strategy_type, config);
    return NextResponse.json(draw, { status: 201 });
  } catch (error) {
    console.error('Error creating draw:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create draw' }, { status: 500 });
  }
}
