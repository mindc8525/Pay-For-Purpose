import { NextResponse } from 'next/server'
import { SubscriptionService } from '@/server/services/subscription-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function POST() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await SubscriptionService.cancelSubscription(user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
