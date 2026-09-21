import { NextResponse } from 'next/server'
import { WinnerService } from '@/server/services/winner-service'
import { requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireAdmin()
    const winners = await WinnerService.listAll()
    return NextResponse.json(winners)
  } catch (error) {
    console.error('Error fetching winners:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 })
  }
}
