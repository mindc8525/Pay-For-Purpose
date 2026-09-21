import { NextResponse } from 'next/server'
import { ScoreService } from '@/server/services/score-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scores = await ScoreService.listByUser(user.id)
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { score_date, stableford_score } = body

    if (!score_date || typeof stableford_score !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const score = await ScoreService.create(user.id, score_date, stableford_score)
    return NextResponse.json(score, { status: 201 })
  } catch (error) {
    console.error('Error creating score:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create score' },
      { status: 500 }
    )
  }
}
