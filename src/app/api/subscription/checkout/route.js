import { NextResponse } from 'next/server'
import { SubscriptionService } from '@/server/services/subscription-service'
import { getAuthUser } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { price_id, plan_id } = body

    if (!price_id || !plan_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const checkoutUrl = await SubscriptionService.createCheckoutSession(
      user.id,
      user.email,
      price_id,
      plan_id
    )

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
