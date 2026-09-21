import { NextResponse } from 'next/server'
import { CharityService } from '@/server/services/charity-service'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const charity = await CharityService.getById(id)

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 })
    }

    return NextResponse.json(charity)
  } catch (error) {
    console.error('Error fetching charity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch charity' },
      { status: 500 }
    )
  }
}
