import { NextResponse } from 'next/server'
import { WinnerService } from '@/server/services/winner-service'
import { requireAdmin } from '@/lib/supabase/server'

export async function POST(request, { params }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const winner = await WinnerService.verify(id, status)
    return NextResponse.json(winner)
  } catch (error) {
    console.error('Error verifying winner:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to verify winner' }, { status: 500 })
  }
}
