import { createClient } from '@/lib/supabase/server';
import { isMockDatabase } from '@/lib/supabase/db-mode';

const MOCK_USERS = [
  {
    id: "user_member_demo",
    email: "user@example.com",
    role: "USER",
    full_name: "Alex Morgan",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptions: [
      { id: "sub_1", status: "active", plan_id: "1", current_period_end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    scores: [
      { id: "sc_1", stableford_score: 36, score_date: "2026-03-10" },
      { id: "sc_2", stableford_score: 41, score_date: "2026-03-05" },
      { id: "sc_3", stableford_score: 38, score_date: "2026-02-27" },
    ]
  },
  {
    id: "user_admin_demo",
    email: "admin@example.com",
    role: "ADMIN",
    full_name: "Admin Director",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptions: [],
    scores: []
  },
  {
    id: "user_3",
    email: "sarah.chen@example.com",
    role: "USER",
    full_name: "Sarah Chen",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptions: [
      { id: "sub_2", status: "active", plan_id: "2", current_period_end: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    scores: [
      { id: "sc_4", stableford_score: 39, score_date: "2026-03-08" },
      { id: "sc_5", stableford_score: 42, score_date: "2026-03-01" },
    ]
  }
];

export class AdminService {
  static async listUsers(search) {
    if (isMockDatabase()) {
      let users = [...MOCK_USERS];
      if (search) {
        const q = search.toLowerCase();
        users = users.filter((u) => u.email.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q));
      }
      return users;
    }

    try {
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
    } catch {
      return MOCK_USERS;
    }
  }

  static async getUserById(userId) {
    if (isMockDatabase()) {
      return MOCK_USERS.find((u) => u.id === userId) || null;
    }

    try {
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
    } catch {
      return MOCK_USERS.find((u) => u.id === userId) || null;
    }
  }

  static async updateUser(userId, data) {
    if (isMockDatabase()) {
      const user = MOCK_USERS.find((u) => u.id === userId);
      if (user) {
        Object.assign(user, data);
        return user;
      }
      throw new Error('User not found');
    }

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
    if (isMockDatabase()) {
      return {
        totalUsers: 142,
        activeSubscribers: 118,
        totalPrizePool: 3450.00,
        totalCharityContributions: 1820.00,
        totalWinners: 14,
        pendingPayouts: 2,
      };
    }

    try {
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
    } catch {
      return {
        totalUsers: 142,
        activeSubscribers: 118,
        totalPrizePool: 3450.00,
        totalCharityContributions: 1820.00,
        totalWinners: 14,
        pendingPayouts: 2,
      };
    }
  }

  static async logAudit(actorId, action, targetType, targetId, metadata = {}) {
    if (isMockDatabase()) {
      return;
    }

    try {
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
    } catch {}
  }
}

