import { NextResponse } from 'next/server'
import { CharityService } from '@/server/services/charity-service'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined

    const charities = await CharityService.list(search)
    return NextResponse.json(charities)
  } catch (error) {
    console.error('Error fetching charities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch charities' },
      { status: 500 }
    )
  }
}
