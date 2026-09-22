import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || authUser?.id;
    const billingInterval = body.billingInterval === 'yearly' ? 'yearly' : 'monthly';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    // Ensure public.users row exists
    const email = body.email || authUser?.email;
    const fullName = body.fullName || authUser?.user_metadata?.full_name;
    if (email) {
      try {
        await adminClient.from('users').upsert(
          {
            id: userId,
            email,
            full_name: fullName || '',
            role: 'USER',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      } catch (userErr) {
        console.warn('Could not upsert public.users record:', userErr);
      }
    }

    // 1. Fetch available plans from Supabase
    const { data: plans, error: planError } = await adminClient
      .from('plans')
      .select('*')
      .eq('active', true);

    if (planError || !plans || plans.length === 0) {
      return NextResponse.json({ error: 'No active plans found' }, { status: 500 });
    }

    let plan = plans.find((p) => p.billing_interval === billingInterval) || plans[0];

    // 2. Check if user already has an active subscription
    const { data: existing } = await adminClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const periodDays = billingInterval === 'yearly' ? 365 : 30;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    const subPayload = {
      user_id: userId,
      plan_id: plan.id,
      stripe_customer_id: 'cust_direct_' + userId,
      stripe_subscription_id: 'sub_direct_' + userId + '_' + Date.now(),
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    };

    let result;
    if (existing?.id) {
      const { data, error } = await adminClient
        .from('subscriptions')
        .update(subPayload)
        .eq('id', existing.id)
        .select('*, plans(*)')
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await adminClient
        .from('subscriptions')
        .insert(subPayload)
        .select('*, plans(*)')
        .single();
      if (error) throw error;
      result = data;
    }

    // 3. Save charity preference if provided
    const charityId = body.charityId;
    const contributionPercentage = Number(body.contributionPercentage) || 10;
    if (charityId) {
      try {
        await adminClient
          .from('user_charity_preferences')
          .upsert(
            {
              user_id: userId,
              charity_id: charityId,
              contribution_percentage: Math.max(10, Math.min(100, contributionPercentage)),
              updated_at: now.toISOString(),
            },
            { onConflict: 'user_id' }
          );
      } catch (charityErr) {
        console.warn('Error saving charity preference during activation:', charityErr);
      }
    }

    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    console.error('Error activating direct subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}
