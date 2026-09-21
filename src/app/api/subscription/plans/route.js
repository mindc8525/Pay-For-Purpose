import { NextResponse } from 'next/server'
import { SubscriptionService } from '@/server/services/subscription-service'

export async function GET() {
  try {
    const plans = await SubscriptionService.listPlans()
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
