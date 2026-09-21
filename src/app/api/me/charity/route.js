import { NextResponse } from 'next/server'
import { CharityService } from '@/server/services/charity-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preference = await CharityService.getUserPreference(user.id)
    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error fetching charity preference:', error)
    return NextResponse.json(
      { error: 'Failed to fetch charity preference' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { charity_id, contribution_percentage } = body

    if (!charity_id || typeof contribution_percentage !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const preference = await CharityService.setUserPreference(
      user.id,
      charity_id,
      contribution_percentage
    )
    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error updating charity preference:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update charity preference' },
      { status: 500 }
    )
  }
}
