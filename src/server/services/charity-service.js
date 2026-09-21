import { createClient } from '@/lib/supabase/server';

export class CharityService {
  static async list(search) {
    const supabase = await createClient();
    
    let query = supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('name');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async getById(id) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('charities')
      .select(`
        *,
        charity_events (*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  static async getFeatured() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(3);
    
    if (error) throw error;
    return data;
  }

  static async getUserPreference(userId) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_charity_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  static async setUserPreference(userId, charityId, contributionPercentage) {
    const supabase = await createClient();
    
    if (contributionPercentage < 10 || contributionPercentage > 100) {
      throw new Error('Contribution percentage must be between 10 and 100');
    }
    
    const charity = await this.getById(charityId);
    if (!charity) {
      throw new Error('Charity not found');
    }
    
    const { data, error } = await supabase
      .from('user_charity_preferences')
      .upsert({
        user_id: userId,
        charity_id: charityId,
        contribution_percentage: contributionPercentage,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(data) {
    const supabase = await createClient();
    
    const { data: charity, error } = await supabase
      .from('charities')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return charity;
  }

  static async update(id, data) {
    const supabase = await createClient();
    
    const { data: charity, error } = await supabase
      .from('charities')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return charity;
  }

  static async delete(id) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('charities')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
}
