import { createClient } from '@/lib/supabase/server';

export class AdminService {
  static async listUsers(search) {
    const supabase = await createClient();
    
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async getUserById(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        subscriptions (*),
        scores (*)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  static async updateUser(userId, data) {
    const supabase = await createClient();
    
    const updateData = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return user;
  }

  static async getReportsSummary() {
    const supabase = await createClient();
    
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeSubscribers } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { data: prizePools } = await supabase
      .from('prize_pools')
      .select('total_pool_amount');
    
    const totalPrizePool = (prizePools || []).reduce((sum, p) => sum + Number(p.total_pool_amount), 0);
    
    const { data: contributions } = await supabase
      .from('charity_contributions')
      .select('amount');
    
    const totalCharityContributions = (contributions || []).reduce((sum, c) => sum + Number(c.amount), 0);
    
    const { count: totalWinners } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingPayouts } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'approved')
      .eq('payout_status', 'pending');
    
    return {
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      totalPrizePool,
      totalCharityContributions,
      totalWinners: totalWinners || 0,
      pendingPayouts: pendingPayouts || 0,
    };
  }

  static async logAudit(actorId, action, targetType, targetId, metadata = {}) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        actor_id: actorId,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata: metadata,
      });
    
    if (error) throw error;
  }
}
