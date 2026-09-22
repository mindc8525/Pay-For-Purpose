import { createClient } from '@/lib/supabase/server';
import { isMockDatabase } from '@/lib/supabase/db-mode';

const inMemoryScores = new Map();

export class ScoreService {
  static async listByUser(userId) {
    if (isMockDatabase()) {
      const userScores = inMemoryScores.get(userId) || [
        { id: 'sc_1', user_id: userId, score_date: '2026-03-10', stableford_score: 36, created_at: new Date().toISOString() },
        { id: 'sc_2', user_id: userId, score_date: '2026-03-05', stableford_score: 41, created_at: new Date().toISOString() },
        { id: 'sc_3', user_id: userId, score_date: '2026-02-27', stableford_score: 38, created_at: new Date().toISOString() },
        { id: 'sc_4', user_id: userId, score_date: '2026-02-20', stableford_score: 34, created_at: new Date().toISOString() },
        { id: 'sc_5', user_id: userId, score_date: '2026-02-14', stableford_score: 39, created_at: new Date().toISOString() },
      ];
      return userScores.sort((a, b) => new Date(b.score_date) - new Date(a.score_date)).slice(0, 5);
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .order('score_date', { ascending: false })
          .limit(5),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || [];
    } catch {
      return inMemoryScores.get(userId) || [];
    }
  }

  static async create(userId, scoreDate, stablefordScore) {
    if (stablefordScore < 1 || stablefordScore > 45) {
      throw new Error('Score must be between 1 and 45');
    }

    if (isMockDatabase()) {
      let list = inMemoryScores.get(userId) || [
        { id: 'sc_1', user_id: userId, score_date: '2026-03-10', stableford_score: 36, created_at: new Date().toISOString() },
        { id: 'sc_2', user_id: userId, score_date: '2026-03-05', stableford_score: 41, created_at: new Date().toISOString() },
        { id: 'sc_3', user_id: userId, score_date: '2026-02-27', stableford_score: 38, created_at: new Date().toISOString() },
        { id: 'sc_4', user_id: userId, score_date: '2026-02-20', stableford_score: 34, created_at: new Date().toISOString() },
        { id: 'sc_5', user_id: userId, score_date: '2026-02-14', stableford_score: 39, created_at: new Date().toISOString() },
      ];
      if (list.some((s) => s.score_date === scoreDate)) {
        throw new Error('A score already exists for this date');
      }
      const newScore = {
        id: 'sc_' + Date.now(),
        user_id: userId,
        score_date: scoreDate,
        stableford_score: stablefordScore,
        created_at: new Date().toISOString(),
      };
      list.push(newScore);
      list.sort((a, b) => new Date(b.score_date) - new Date(a.score_date));
      if (list.length > 5) {
        list = list.slice(0, 5);
      }
      inMemoryScores.set(userId, list);
      return newScore;
    }

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
    if (stablefordScore < 1 || stablefordScore > 45) {
      throw new Error('Score must be between 1 and 45');
    }

    if (isMockDatabase()) {
      let list = inMemoryScores.get(userId) || [];
      if (list.some((s) => s.score_date === scoreDate && s.id !== scoreId)) {
        throw new Error('A score already exists for this date');
      }
      const score = list.find((s) => s.id === scoreId);
      if (!score) throw new Error('Score not found');
      score.score_date = scoreDate;
      score.stableford_score = stablefordScore;
      list.sort((a, b) => new Date(b.score_date) - new Date(a.score_date));
      inMemoryScores.set(userId, list);
      return score;
    }

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
    if (isMockDatabase()) {
      let list = inMemoryScores.get(userId) || [];
      list = list.filter((s) => s.id !== scoreId);
      inMemoryScores.set(userId, list);
      return;
    }

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
