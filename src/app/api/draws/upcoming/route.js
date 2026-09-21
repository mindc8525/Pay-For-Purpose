import { NextResponse } from 'next/server'
import { DrawService } from '@/server/services/draw-service'

export async function GET() {
  try {
    const draw = await DrawService.getUpcoming()
    return NextResponse.json(draw)
  } catch (error) {
    console.error('Error fetching upcoming draw:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming draw' },
      { status: 500 }
    )
  }
}
