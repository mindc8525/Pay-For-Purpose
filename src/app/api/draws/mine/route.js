import { NextResponse } from 'next/server'
import { DrawService } from '@/server/services/draw-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participations = await DrawService.getUserParticipations(user.id)
    return NextResponse.json(participations)
  } catch (error) {
    console.error('Error fetching participations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 }
    )
  }
}
