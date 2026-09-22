import { createClient } from '@/lib/supabase/server';
import { isMockDatabase } from '@/lib/supabase/db-mode';

let MOCK_DRAWS = [
  {
    id: 'draw_prev_1',
    draw_period: '2026-02-28',
    strategy_type: 'random',
    status: 'completed',
    winning_numbers: [7, 14, 21, 28, 35],
    total_pool: 20000,
    created_at: new Date().toISOString(),
  },
];

const MOCK_UPCOMING = {
  id: 'draw_upcoming_1',
  draw_period: '2026-03-31',
  strategy_type: 'random',
  status: 'configured',
  total_pool: 25000,
  created_at: new Date().toISOString(),
};

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
    if (isMockDatabase()) {
      return MOCK_DRAWS;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('draws')
          .select('*')
          .in('status', ['published', 'completed'])
          .order('draw_period', { ascending: false }),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || MOCK_DRAWS;
    } catch {
      return MOCK_DRAWS;
    }
  }

  static async getUpcoming() {
    if (isMockDatabase()) {
      return MOCK_UPCOMING;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('draws')
          .select('*')
          .eq('status', 'configured')
          .order('draw_period')
          .limit(1)
          .single(),
        timeoutPromise,
      ]);
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch {
      return MOCK_UPCOMING;
    }
  }

  static async create(drawPeriod, strategyType, config = {}) {
    if (isMockDatabase()) {
      const newDraw = {
        id: `draw_${Date.now()}`,
        draw_period: drawPeriod,
        strategy_type: strategyType,
        config: config || {},
        status: 'configured',
        winning_numbers: null,
        total_pool: 25000,
        created_at: new Date().toISOString(),
      };
      MOCK_DRAWS.unshift(newDraw);
      return newDraw;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('draws')
          .insert({
            draw_period: drawPeriod,
            strategy_type: strategyType,
            config: config,
            status: 'configured',
          })
          .select()
          .single(),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data;
    } catch {
      const newDraw = {
        id: `draw_${Date.now()}`,
        draw_period: drawPeriod,
        strategy_type: strategyType,
        config: config || {},
        status: 'configured',
        winning_numbers: null,
        total_pool: 25000,
        created_at: new Date().toISOString(),
      };
      MOCK_DRAWS.unshift(newDraw);
      return newDraw;
    }
  }

  static async simulate(drawId) {
    if (isMockDatabase()) {
      const draw = MOCK_DRAWS.find((d) => d.id === drawId);
      if (!draw) throw new Error('Draw not found');
      const strategy = draw.strategy_type === 'random' 
        ? new RandomDrawStrategy() 
        : new AlgorithmicDrawStrategy();
      draw.winning_numbers = strategy.generate([7, 14, 21, 28, 35]);
      draw.status = 'simulated';
      return { draw, participants: [] };
    }

    try {
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
    } catch {
      const draw = MOCK_DRAWS.find((d) => d.id === drawId);
      if (draw) {
        const strategy = draw.strategy_type === 'random' 
          ? new RandomDrawStrategy() 
          : new AlgorithmicDrawStrategy();
        draw.winning_numbers = strategy.generate([7, 14, 21, 28, 35]);
        draw.status = 'simulated';
        return { draw, participants: [] };
      }
      throw new Error('Draw not found');
    }
  }

  static async publish(drawId) {
    if (isMockDatabase()) {
      const draw = MOCK_DRAWS.find((d) => d.id === drawId);
      if (!draw) throw new Error('Draw not found');
      draw.status = 'published';
      draw.published_at = new Date().toISOString();
      return draw;
    }

    try {
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
    } catch {
      const draw = MOCK_DRAWS.find((d) => d.id === drawId);
      if (draw) {
        draw.status = 'published';
        draw.published_at = new Date().toISOString();
        return draw;
      }
      throw new Error('Draw not found');
    }
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
    if (isMockDatabase()) {
      return [
        {
          id: 'part_prev_1',
          user_id: userId,
          draw_id: 'draw_prev_1',
          draw_numbers: [14, 40, 36, 41, 38],
          match_count: 3,
          is_winner: true,
          created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
          draws: {
            id: 'draw_prev_1',
            draw_period: '2026-02-28',
            winning_numbers: [7, 14, 21, 36, 38],
            status: 'completed',
          },
        },
      ];
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('draw_participants')
          .select('*, draws (*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }

  static async getUserWinnings(userId) {
    if (isMockDatabase()) {
      return [
        {
          id: 'win_demo_1',
          user_id: userId,
          draw_id: 'draw_prev_1',
          match_type: '3-match',
          calculated_prize: 350.00,
          verification_status: 'approved',
          payout_status: 'paid',
          proof_url: 'https://images.unsplash.com/photo-1535131749006-b7f558bce614?w=600&auto=format&fit=crop',
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          draws: {
            id: 'draw_prev_1',
            draw_period: '2026-02-28',
            winning_numbers: [7, 14, 21, 36, 38],
          },
        },
        {
          id: 'win_demo_2',
          user_id: userId,
          draw_id: 'draw_prev_2',
          match_type: '4-match',
          calculated_prize: 875.50,
          verification_status: 'pending',
          payout_status: 'pending',
          proof_url: null,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          draws: {
            id: 'draw_prev_2',
            draw_period: '2026-03-15',
            winning_numbers: [14, 28, 36, 38, 42],
          },
        },
      ];
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('winners')
          .select('*, draws (*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        timeoutPromise,
      ]);
      
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }
}

