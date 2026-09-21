import { createClient } from '@/lib/supabase/server';

export class WinnerService {
  static async listAll() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        users (email, full_name),
        draws (draw_period)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getById(winnerId) {
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
  }

  static async uploadProof(winnerId, userId, proofUrl) {
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
  }
}
