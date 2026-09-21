import { NextResponse } from 'next/server'
import { ScoreService } from '@/server/services/score-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { score_date, stableford_score } = body

    if (!score_date || typeof stableford_score !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const score = await ScoreService.update(user.id, id, score_date, stableford_score)
    return NextResponse.json(score)
  } catch (error) {
    console.error('Error updating score:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await ScoreService.delete(user.id, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting score:', error)
    return NextResponse.json(
      { error: 'Failed to delete score' },
      { status: 500 }
    )
  }
}
