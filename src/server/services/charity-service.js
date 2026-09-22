import { createClient } from '@/lib/supabase/server';

function isMockDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('placeholder') || url.includes('example.com');
}

// In-memory high performance mock store when Supabase is in mock/unconnected mode
let inMemoryCharities = [
  {
    id: "4279b35e-c635-4ee0-9946-7b051ff32278",
    name: "First Tee",
    description:
      "Empowering youth through life skills, character education, and mentorship programs that build confidence on and off the golf course.",
    image_url:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=80",
    website_url: "https://firsttee.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e1",
        charity_id: "4279b35e-c635-4ee0-9946-7b051ff32278",
        title: "Annual Youth Mentorship Day 2026",
        description: "Join junior golfers and community mentors for an inspiring charity invitational.",
        event_date: "2026-06-15",
        event_type: "golf_day",
      },
      {
        id: "e2",
        charity_id: "4279b35e-c635-4ee0-9946-7b051ff32278",
        title: "Life Skills & Mentorship Clinic",
        description: "An inspiring workshop introducing underprivileged kids to leadership fundamentals.",
        event_date: "2026-08-20",
        event_type: "workshop",
      },
    ],
  },
  {
    id: "fc3c6044-b1fe-4c1c-9070-fc4e1d7b7e9d",
    name: "Folds of Honor",
    description:
      "Providing life-changing educational scholarships to spouses and children of America’s fallen or disabled military and first responders through golf initiatives.",
    image_url:
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&auto=format&fit=crop&q=80",
    website_url: "https://foldsofhonor.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e3",
        charity_id: "fc3c6044-b1fe-4c1c-9070-fc4e1d7b7e9d",
        title: "Patriot Golf Day Invitational",
        description: "A premier charity tournament raising academic scholarships for families of fallen heroes.",
        event_date: "2026-05-25",
        event_type: "golf_day",
      },
    ],
  },
  {
    id: "7076a5df-e700-4f75-83dc-176f8e207621",
    name: "St. Jude Children’s Research Hospital",
    description:
      "Leading the way the world understands, treats, and defeats childhood cancer and other life-threatening pediatric diseases.",
    image_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    website_url: "https://www.stjude.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e4",
        charity_id: "7076a5df-e700-4f75-83dc-176f8e207621",
        title: "St. Jude Charity Pro-Am Classic",
        description: "Annual scramble raising critical funding for pediatric cancer research and patient families.",
        event_date: "2026-07-18",
        event_type: "golf_day",
      },
    ],
  },
  {
    id: "3a7f396c-5222-409f-9239-e26def6b910a",
    name: "Make-A-Wish Foundation",
    description:
      "Creating life-changing wishes for children with critical illnesses, bringing hope, strength, and joy to families worldwide.",
    image_url:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
    website_url: "https://wish.org",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e5",
        charity_id: "3a7f396c-5222-409f-9239-e26def6b910a",
        title: "Wishes on the Fairway Scramble",
        description: "Community golf day granting wishes for children with life-threatening illnesses.",
        event_date: "2026-09-10",
        event_type: "golf_day",
      },
    ],
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
        setTimeout(() => reject(new Error('Database query timed out')), 6000)
      );

      const { data, error } = await Promise.race([query, timeoutPromise]);
      if (error) throw error;
      return data || inMemoryCharities;
    } catch {
      return inMemoryCharities;
    }
  }

  static async getById(id) {
    if (id === "1") id = "4279b35e-c635-4ee0-9946-7b051ff32278";
    if (id === "2") id = "fc3c6044-b1fe-4c1c-9070-fc4e1d7b7e9d";
    if (id === "3") id = "7076a5df-e700-4f75-83dc-176f8e207621";
    if (id === "4") id = "3a7f396c-5222-409f-9239-e26def6b910a";

    if (isMockDatabase()) {
      const charity = inMemoryCharities.find((c) => c.id === id && c.is_active);
      return charity || null;
    }

    try {
      const supabase = await createClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 6000)
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
