import { createClient } from '@/lib/supabase/server';
import { isMockDatabase } from '@/lib/supabase/db-mode';

let MOCK_WINNERS = [
  {
    id: 'win_1',
    user_id: 'user_1',
    draw_id: 'draw_prev_1',
    matches_count: 4,
    match_type: 'Match 4',
    prize_tier: 'major',
    prize_amount: 1750.0,
    calculated_prize: 1750.0,
    proof_url: '/sample-scorecard.svg',
    verification_status: 'approved',
    payout_status: 'paid',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    users: { email: 'member@example.com', full_name: 'Jordan Spieth' },
    draws: { draw_period: '2026-02-28' },
  },
  {
    id: 'win_2',
    user_id: 'user_member_demo',
    draw_id: 'draw_prev_1',
    matches_count: 3,
    match_type: 'Match 3',
    prize_tier: 'bonus',
    prize_amount: 450.0,
    calculated_prize: 450.0,
    proof_url: '/sample-scorecard.svg',
    verification_status: 'pending',
    payout_status: 'pending',
    created_at: new Date().toISOString(),
    users: { email: 'user@example.com', full_name: 'Alex Morgan' },
    draws: { draw_period: '2026-02-28' },
  },
];

export class WinnerService {
  static async listAll() {
    if (isMockDatabase()) {
      return MOCK_WINNERS;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('winners')
          .select(`
            *,
            users (email, full_name),
            draws (draw_period)
          `)
          .order('created_at', { ascending: false }),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || MOCK_WINNERS;
    } catch {
      return MOCK_WINNERS;
    }
  }

  static async getById(winnerId) {
    if (isMockDatabase()) {
      return MOCK_WINNERS.find((w) => w.id === winnerId) || null;
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('winners')
        .select('*')
        .eq('id', winnerId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch {
      return MOCK_WINNERS.find((w) => w.id === winnerId) || null;
    }
  }

  static async uploadProof(winnerId, userId, proofUrl) {
    if (isMockDatabase()) {
      const winner = MOCK_WINNERS.find((w) => w.id === winnerId) || {
        id: winnerId,
        user_id: userId,
        draw_id: 'draw_prev_2',
        proof_url: proofUrl,
        verification_status: 'pending',
        calculated_prize: 875.50,
      };
      winner.proof_url = proofUrl;
      winner.verification_status = 'pending';
      return winner;
    }

    const supabase = await createClient();
    
    const { data: winner, error: checkError } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !winner) {
      throw new Error('Winner record not found');
    }
    
    const { data, error } = await supabase
      .from('winners')
      .update({
        proof_url: proofUrl,
        verification_status: 'pending',
      })
      .eq('id', winnerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async verify(winnerId, status) {
    if (isMockDatabase()) {
      const winner = MOCK_WINNERS.find((w) => w.id === winnerId);
      if (winner) {
        winner.verification_status = status;
        if (status === 'rejected') winner.payout_status = 'pending';
        return winner;
      }
      return { id: winnerId, verification_status: status };
    }

    const supabase = await createClient();
    
    if (status === 'rejected') {
      const { data, error } = await supabase
        .from('winners')
        .update({
          verification_status: 'rejected',
          payout_status: 'pending',
        })
        .eq('id', winnerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const { data, error } = await supabase
      .from('winners')
      .update({
        verification_status: 'approved',
      })
      .eq('id', winnerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async markPaid(winnerId) {
    if (isMockDatabase()) {
      const winner = MOCK_WINNERS.find((w) => w.id === winnerId);
      if (winner) {
        winner.payout_status = 'paid';
        return winner;
      }
      return { id: winnerId, payout_status: 'paid' };
    }

    const supabase = await createClient();
    
    const { data: winner, error: checkError } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .single();
    
    if (checkError || !winner) {
      throw new Error('Winner record not found');
    }
    
    if (winner.verification_status !== 'approved') {
      throw new Error('Winner must be approved before marking as paid');
    }
    
    if (winner.payout_status === 'paid') {
      throw new Error('Winner has already been paid');
    }
    
    const { data, error } = await supabase
      .from('winners')
      .update({
        payout_status: 'paid',
      })
      .eq('id', winnerId)
      .select()
      .single();
    
    if (error) throw error;
    
    await this.logAudit(winnerId, 'payout_completed', supabase);
    
    return data;
  }

  static async logAudit(targetId, action, supabase) {
    if (isMockDatabase()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_audit_log')
          .insert({
            actor_id: user.id,
            action,
            target_type: 'winner',
            target_id: targetId,
          });
      }
    } catch {}
  }
}

