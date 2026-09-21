import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export class SubscriptionService {
  static async listPlans() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('price');
    
    if (error) throw error;
    return data;
  }

  static async getPlanById(id) {
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
  }

  static async getUserSubscription(userId) {
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
  }

  static async createCheckoutSession(userId, email, priceId, planId) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
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
