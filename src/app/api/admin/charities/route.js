import { NextResponse } from 'next/server';
import { CharityService } from '@/server/services/charity-service';
import { requireAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireAdmin();
    const charities = await CharityService.list();
    return NextResponse.json(charities);
  } catch (error) {
    console.error('Error fetching charities:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch charities' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, description, image_url, website_url, is_featured } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const charity = await CharityService.create({
      name,
      description,
      image_url: image_url || null,
      website_url: website_url || null,
      is_featured: is_featured || false,
      is_active: true,
    });
    return NextResponse.json(charity, { status: 201 });
  } catch (error) {
    console.error('Error creating charity:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 });
  }
}
