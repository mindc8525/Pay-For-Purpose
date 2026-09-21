import { createClient } from '@/lib/supabase/server';

export class ScoreService {
  static async listByUser(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data;
  }

  static async create(userId, scoreDate, stablefordScore) {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .eq('score_date', scoreDate)
      .single();
    
    if (existing) {
      throw new Error('A score already exists for this date');
    }
    
    if (stablefordScore < 1 || stablefordScore > 45) {
      throw new Error('Score must be between 1 and 45');
    }
    
    const { data, error } = await supabase
      .from('scores')
      .insert({
        user_id: userId,
        score_date: scoreDate,
        stableford_score: stablefordScore,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    await this.enforceFiveScoreLimit(userId, supabase);
    
    return data;
  }

  static async update(userId, scoreId, scoreDate, stablefordScore) {
    const supabase = await createClient();
    
    const { data: existing } = await supabase
      .from('scores')
      .select('id, score_date')
      .eq('user_id', userId)
      .eq('score_date', scoreDate)
      .neq('id', scoreId)
      .single();
    
    if (existing) {
      throw new Error('A score already exists for this date');
    }
    
    if (stablefordScore < 1 || stablefordScore > 45) {
      throw new Error('Score must be between 1 and 45');
    }
    
    const { data, error } = await supabase
      .from('scores')
      .update({
        score_date: scoreDate,
        stableford_score: stablefordScore,
      })
      .eq('id', scoreId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Score not found');
    
    return data;
  }

  static async delete(userId, scoreId) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  static async enforceFiveScoreLimit(userId, supabase) {
    const { data: scores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('score_date', { ascending: false });
    
    if (scores && scores.length > 5) {
      const idsToDelete = scores.slice(5).map(s => s.id);
      
      const { error } = await supabase
        .from('scores')
        .delete()
        .in('id', idsToDelete);
      
      if (error) throw error;
    }
  }
}
