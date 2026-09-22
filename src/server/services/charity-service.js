import { createClient } from '@/lib/supabase/server';

function isMockDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('placeholder') || url.includes('example.com');
}

// In-memory high performance mock store when Supabase is in mock/unconnected mode
let inMemoryCharities = [
  {
    id: "1",
    name: "First Tee Initiative",
    description:
      "Empowering youth through life skills, character education, and mentorship programs that build confidence on and off the course.",
    image_url:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop",
    website_url: "https://www.firsttee.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e1",
        charity_id: "1",
        title: "Annual Youth Mentorship Day 2026",
        description: "Join junior golfers and community mentors for an inspiring charity invitational.",
        event_date: "2026-06-15",
        event_type: "golf_day",
      },
      {
        id: "e2",
        charity_id: "1",
        title: "Life Skills & Mentorship Clinic",
        description: "An inspiring workshop introducing underprivileged kids to leadership fundamentals.",
        event_date: "2026-08-20",
        event_type: "workshop",
      },
    ],
  },
  {
    id: "2",
    name: "Global Aid Network",
    description:
      "Connecting athletes and supporters to fund urgent emergency relief, pediatric medical aid, clean water access, and community rehabilitation.",
    image_url:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop",
    website_url: "https://www.golfforcause.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e3",
        charity_id: "2",
        title: "Community Charity Pro-Am",
        description: "A premier tournament where 100% of proceeds fund community health programs.",
        event_date: "2026-05-12",
        event_type: "golf_day",
      },
    ],
  },
  {
    id: "3",
    name: "Green Habitat Trust",
    description:
      "Dedicated to environmental sustainability, water conservation, biodiversity corridors, and eco-friendly land stewardship.",
    image_url:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
    website_url: "https://www.greenfairways.org",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e4",
        charity_id: "3",
        title: "Eco-Course Sustainability Summit",
        description: "Workshops with groundskeepers and environmentalists on sustainable land stewardship.",
        event_date: "2026-07-08",
        event_type: "workshop",
      },
    ],
  },
  {
    id: "4",
    name: "Youth Inclusion Alliance",
    description:
      "Providing equipment, coaching, and life opportunities to underprivileged young athletes striving to play.",
    image_url:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop",
    website_url: "https://www.youthgolfalliance.org",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [],
  },
];

let inMemoryPreferences = new Map();

export class CharityService {
  static async list(search) {
    if (isMockDatabase()) {
      let list = inMemoryCharities.filter((c) => c.is_active);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
      }
      return list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    try {
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

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([query, timeoutPromise]);
      if (error) throw error;
      return data || inMemoryCharities;
    } catch {
      return inMemoryCharities;
    }
  }

  static async getById(id) {
    if (isMockDatabase()) {
      const charity = inMemoryCharities.find((c) => c.id === id && c.is_active);
      return charity || null;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('charities')
          .select(`*, charity_events (*)`)
          .eq('id', id)
          .eq('is_active', true)
          .single(),
        timeoutPromise,
      ]);

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch {
      return inMemoryCharities.find((c) => c.id === id) || null;
    }
  }

  static async getFeatured() {
    if (isMockDatabase()) {
      return inMemoryCharities.filter((c) => c.is_active && c.is_featured).slice(0, 3);
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 2000)
      );

      const { data, error } = await Promise.race([
        supabase
          .from('charities')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(3),
        timeoutPromise,
      ]);

      if (error) throw error;
      return data;
    } catch {
      return inMemoryCharities.filter((c) => c.is_active && c.is_featured).slice(0, 3);
    }
  }

  static async getUserPreference(userId) {
    if (isMockDatabase()) {
      return inMemoryPreferences.get(userId) || null;
    }

    try {
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
    } catch {
      return inMemoryPreferences.get(userId) || null;
    }
  }

  static async setUserPreference(userId, charityId, contributionPercentage) {
    if (contributionPercentage < 10 || contributionPercentage > 100) {
      throw new Error('Contribution percentage must be between 10 and 100');
    }

    const charity = await this.getById(charityId);
    if (!charity) {
      throw new Error('Charity not found');
    }

    if (isMockDatabase()) {
      const pref = {
        user_id: userId,
        charity_id: charityId,
        contribution_percentage: contributionPercentage,
        updated_at: new Date().toISOString(),
      };
      inMemoryPreferences.set(userId, pref);
      return pref;
    }

    const supabase = await createClient();
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
    if (isMockDatabase()) {
      const newCharity = {
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        charity_events: [],
        ...data,
      };
      inMemoryCharities.push(newCharity);
      return newCharity;
    }

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
    if (isMockDatabase()) {
      const idx = inMemoryCharities.findIndex((c) => c.id === id);
      if (idx !== -1) {
        inMemoryCharities[idx] = { ...inMemoryCharities[idx], ...data, updated_at: new Date().toISOString() };
        return inMemoryCharities[idx];
      }
      throw new Error('Charity not found');
    }

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
    if (isMockDatabase()) {
      const idx = inMemoryCharities.findIndex((c) => c.id === id);
      if (idx !== -1) {
        inMemoryCharities[idx].is_active = false;
      }
      return;
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('charities')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }
}
