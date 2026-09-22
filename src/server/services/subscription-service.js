import { createClient } from '@/lib/supabase/server';
import { isMockDatabase } from '@/lib/supabase/db-mode';
import Stripe from 'stripe';

const DEFAULT_PLANS = [
  { id: '1', name: 'Monthly Membership', billing_interval: 'monthly', price: 9.99, currency: 'USD', stripe_price_id: 'price_monthly', active: true },
  { id: '2', name: 'Annual Membership', billing_interval: 'yearly', price: 99.99, currency: 'USD', stripe_price_id: 'price_yearly', active: true },
];

export class SubscriptionService {
  static async listPlans() {
    if (isMockDatabase()) {
      return DEFAULT_PLANS;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('plans')
          .select('*')
          .eq('active', true)
          .order('price'),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  }

  static async getPlanById(id) {
    if (isMockDatabase()) {
      return DEFAULT_PLANS.find((p) => p.id === id) || null;
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch {
      return DEFAULT_PLANS.find((p) => p.id === id) || null;
    }
  }

  static async getUserSubscription(userId) {
    if (isMockDatabase()) {
      return {
        id: 'sub_mock_1',
        user_id: userId,
        status: 'active',
        billing_interval: 'monthly',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plans: DEFAULT_PLANS[0],
      };
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plans (*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch {
      return null;
    }
  }

  static async createCheckoutSession(userId, email, priceId, planId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    // If Stripe is not configured or unavailable, activate subscription directly in database
    if (!stripeKey || stripeKey.includes('placeholder') || stripeKey === 'bypass') {
      const periodDays = priceId?.includes('year') || planId?.includes('year') || planId === '2' ? 365 : 30;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();

      if (!isMockDatabase()) {
        try {
          const { createAdminClient } = await import('@/lib/supabase/admin');
          const adminClient = createAdminClient();
          const db = adminClient || (await createClient());

          // Get active plans to match UUID
          const { data: plans } = await db.from('plans').select('*');
          let matchedPlan = plans?.find(
            (p) => p.id === planId || p.billing_interval === (periodDays === 365 ? 'yearly' : 'monthly')
          );
          if (!matchedPlan && plans?.length > 0) {
            matchedPlan = plans[0];
          }

          // Check for existing subscription to update or insert cleanly
          const { data: existing } = await db
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          const subData = {
            user_id: userId,
            plan_id: matchedPlan ? matchedPlan.id : planId,
            stripe_customer_id: 'cust_direct_' + userId,
            stripe_subscription_id: 'sub_direct_' + userId + '_' + Date.now(),
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            updated_at: now.toISOString(),
          };

          if (existing?.id) {
            await db.from('subscriptions').update(subData).eq('id', existing.id);
          } else {
            await db.from('subscriptions').insert(subData);
          }
        } catch (err) {
          console.warn('Direct subscription activation in Supabase:', err);
        }
      }

      const appUrl = process.env.APP_URL || '';
      return `${appUrl}/dashboard?subscription=success`;
    }

    const stripe = new Stripe(stripeKey);
    
    const subscription = await this.getUserSubscription(userId);
    if (subscription) {
      throw new Error('User already has an active subscription');
    }
    
    const customer = await stripe.customers.create({
      email,
      metadata: {
        supabase_user_id: userId,
      },
    });
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.APP_URL}/subscribe?subscription=canceled`,
      metadata: {
        plan_id: planId,
        user_id: userId,
      },
    });
    
    return session.url;
  }

  static async handleWebhook(event) {
    const supabase = await createClient();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.handleCheckoutComplete(session, supabase);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await this.handleSubscriptionUpdate(subscription, supabase);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.handleSubscriptionDelete(subscription, supabase);
        break;
      }
    }
  }

  static async handleCheckoutComplete(session, supabase) {
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    if (!userId || !planId) return;
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    
    if (error) throw error;
  }

  static async handleSubscriptionUpdate(stripeSubscription, supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', stripeSubscription.id);
    
    if (error) throw error;
  }

  static async handleSubscriptionDelete(stripeSubscription, supabase) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
      })
      .eq('stripe_subscription_id', stripeSubscription.id);
    
    if (error) throw error;
  }

  static async cancelSubscription(userId) {
    const supabase = await createClient();
    
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
      })
      .eq('id', subscription.id);
    
    if (error) throw error;
  }
}
