import { createClient } from '@/lib/supabase/server';

export class RandomDrawStrategy {
  generate(numbers, _config = {}) {
    const pool = [...numbers];
    if (pool.length < 5) {
      for (let n = 1; n <= 45 && pool.length < 5; n++) {
        if (!pool.includes(n)) pool.push(n);
      }
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).sort((a, b) => a - b);
  }
}

export class AlgorithmicDrawStrategy {
  generate(numbers, config = {}) {
    const pool = [...numbers];
    if (pool.length < 5) {
      for (let n = 1; n <= 45 && pool.length < 5; n++) {
        if (!pool.includes(n)) pool.push(n);
      }
    }
    const frequency = config.frequency || {};
    
    const weighted = pool.map((n) => ({
      number: n,
      weight: frequency[n] || 1,
    }));
    
    const selected = [];
    const available = [...weighted];
    
    for (let i = 0; i < 5 && available.length > 0; i++) {
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let j = 0; j < available.length; j++) {
        random -= available[j].weight;
        if (random <= 0) {
          selected.push(available[j].number);
          available.splice(j, 1);
          break;
        }
      }
    }
    
    return selected.sort((a, b) => a - b);
  }
}

export class DrawService {
  static async list(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .in('status', ['published', 'completed'])
      .order('draw_period', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getUpcoming() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'configured')
      .order('draw_period')
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  static async create(drawPeriod, strategyType, config = {}) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('draws')
      .insert({
        draw_period: drawPeriod,
        strategy_type: strategyType,
        config: config,
        status: 'configured',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async simulate(drawId) {
    const supabase = await createClient();
    
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();
    
    if (drawError || !draw) throw new Error('Draw not found');
    
    if (draw.status === 'published' || draw.status === 'completed') {
      throw new Error('Draw has already been published and cannot be re-simulated');
    }
    
    const participants = await this.generateParticipants(drawId, supabase);
    
    const strategy = draw.strategy_type === 'random' 
      ? new RandomDrawStrategy() 
      : new AlgorithmicDrawStrategy();
    
    const allNumbers = participants.flatMap((p) => p.draw_numbers);
    const winningNumbers = strategy.generate(allNumbers, draw.config || {});
    
    const { data: updatedDraw, error } = await supabase
      .from('draws')
      .update({
        winning_numbers: winningNumbers,
        status: 'simulated',
      })
      .eq('id', drawId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { draw: updatedDraw, participants };
  }

  static async publish(drawId) {
    const supabase = await createClient();
    
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();
    
    if (drawError || !draw) throw new Error('Draw not found');

    if (draw.status === 'published' || draw.status === 'completed') {
      throw new Error('Draw is already published and cannot be modified');
    }

    if (draw.status !== 'simulated' || !draw.winning_numbers) {
      throw new Error('Draw must be simulated before publishing');
    }
    
    await this.calculatePrizePool(drawId, supabase);
    
    await this.evaluateWinners(drawId, draw.winning_numbers, supabase);
    
    const { data: publishedDraw, error } = await supabase
      .from('draws')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', drawId)
      .select()
      .single();
    
    if (error) throw error;
    
    return publishedDraw;
  }

  static async generateParticipants(drawId, supabase) {
    // Delete any existing participants for this draw to ensure idempotency on simulation
    await supabase.from('draw_participants').delete().eq('draw_id', drawId);

    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');
    
    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      return [];
    }
    
    const participants = [];
    
    for (const sub of activeSubscriptions) {
      const { data: scores } = await supabase
        .from('scores')
        .select('stableford_score')
        .eq('user_id', sub.user_id)
        .order('score_date', { ascending: false })
        .limit(5);
      
      if (!scores || scores.length === 0) continue;
      
      const scoreSnapshot = scores.map((s) => s.stableford_score);
      const drawNumbers = this.scoresToDrawNumbers(scoreSnapshot);
      
      const { data: participant, error } = await supabase
        .from('draw_participants')
        .insert({
          draw_id: drawId,
          user_id: sub.user_id,
          score_snapshot: scoreSnapshot,
          draw_numbers: drawNumbers,
        })
        .select()
        .single();
      
      if (!error && participant) {
        participants.push(participant);
      }
    }
    
    return participants;
  }

  static scoresToDrawNumbers(scores) {
    return scores.map((score) => Math.min(45, Math.max(1, score)));
  }

  static async calculatePrizePool(drawId, supabase) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_id, plans (price)')
      .eq('status', 'active');
    
    const fundingPercentage = parseFloat(process.env.PRIZE_POOL_FUNDING_PERCENTAGE || '20');
    const totalRevenue = (subscriptions || []).reduce((sum, sub) => {
      const price = sub.plans?.price || 0;
      return sum + price;
    }, 0);
    
    const basePool = totalRevenue * (fundingPercentage / 100);
    
    const { data: previousDraw } = await supabase
      .from('draws')
      .select('id')
      .neq('id', drawId)
      .order('published_at', { ascending: false })
      .limit(1)
      .single();
    
    let rollover = 0;
    if (previousDraw) {
      const { data: previousWinners } = await supabase
        .from('winners')
        .select('calculated_prize')
        .eq('draw_id', previousDraw.id)
        .eq('match_type', '5-match');
      
      if (!previousWinners || previousWinners.length === 0) {
        const { data: previousPool } = await supabase
          .from('prize_pools')
          .select('five_match_pool')
          .eq('draw_id', previousDraw.id)
          .single();
        
        rollover = previousPool?.five_match_pool || 0;
      }
    }
    
    const totalPool = basePool + rollover;
    
    const { error } = await supabase
      .from('prize_pools')
      .insert({
        draw_id: drawId,
        base_pool_amount: basePool,
        rollover_amount: rollover,
        total_pool_amount: totalPool,
        five_match_pool: totalPool * 0.4,
        four_match_pool: totalPool * 0.35,
        three_match_pool: totalPool * 0.25,
      });
    
    if (error) throw error;
  }

  static async evaluateWinners(drawId, winningNumbers, supabase) {
    const { data: participants } = await supabase
      .from('draw_participants')
      .select('*')
      .eq('draw_id', drawId);
    
    if (!participants) return;
    
    const { data: prizePool } = await supabase
      .from('prize_pools')
      .select('*')
      .eq('draw_id', drawId)
      .single();
    
    if (!prizePool) return;
    
    const winners = [];
    
    for (const participant of participants) {
      const matchCount = participant.draw_numbers.filter((n) => 
        winningNumbers.includes(n)
      ).length;
      
      if (matchCount >= 3) {
        const matchType = matchCount === 5 ? '5-match' : matchCount === 4 ? '4-match' : '3-match';
        winners.push({ matchType, userId: participant.user_id, matchCount });
        
        await supabase
          .from('draw_participants')
          .update({ is_winner: true, match_count: matchCount })
          .eq('id', participant.id);
      }
    }
    
    const winnersByType = {
      '5-match': winners.filter((w) => w.matchType === '5-match'),
      '4-match': winners.filter((w) => w.matchType === '4-match'),
      '3-match': winners.filter((w) => w.matchType === '3-match'),
    };
    
    for (const [matchType, typeWinners] of Object.entries(winnersByType)) {
      if (typeWinners.length === 0) continue;
      
      const poolAmount = matchType === '5-match' 
        ? prizePool.five_match_pool 
        : matchType === '4-match' 
          ? prizePool.four_match_pool 
          : prizePool.three_match_pool;
      
      const prizePerWinner = poolAmount / typeWinners.length;
      
      for (const winner of typeWinners) {
        await supabase
          .from('winners')
          .insert({
            draw_id: drawId,
            user_id: winner.userId,
            match_type: matchType,
            calculated_prize: prizePerWinner,
          });
      }
    }
  }

  static async getUserParticipations(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('draw_participants')
      .select('*, draws (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getUserWinnings(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('winners')
      .select('*, draws (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}
