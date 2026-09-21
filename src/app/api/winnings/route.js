import { NextResponse } from 'next/server'
import { DrawService } from '@/server/services/draw-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const winnings = await DrawService.getUserWinnings(user.id)
    return NextResponse.json(winnings)
  } catch (error) {
    console.error('Error fetching winnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch winnings' },
      { status: 500 }
    )
  }
}
