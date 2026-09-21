import { NextResponse } from 'next/server'
import { WinnerService } from '@/server/services/winner-service'
import { requireAdmin } from '@/lib/supabase/server'

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const winner = await WinnerService.markPaid(id)
    return NextResponse.json(winner)
  } catch (error) {
    console.error('Error marking payout:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to mark payout' }, { status: 500 })
  }
}
