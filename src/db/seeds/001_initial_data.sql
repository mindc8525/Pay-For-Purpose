-- Par For Purpose Seed Data
-- Initial mock data for testing

-- Insert Plans (replace stripe_price_id with your actual Stripe price IDs)
INSERT INTO public.plans (name, billing_interval, price, currency, stripe_price_id, active) VALUES
  ('Monthly Hero', 'monthly', 9.99, 'USD', 'price_monthly_test', true),
  ('Yearly Hero', 'yearly', 99.99, 'USD', 'price_yearly_test', true);

-- Insert Charities
INSERT INTO public.charities (id, name, description, image_url, website_url, is_featured, is_active) VALUES
  (uuid_generate_v4(), 'First Tee', 'Empowering youth through life skills, character education, and mentorship programs that build confidence on and off the golf course.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=80', 'https://firsttee.org', true, true),
  (uuid_generate_v4(), 'Folds of Honor', 'Providing life-changing educational scholarships to spouses and children of America’s fallen or disabled military and first responders through golf initiatives.', 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&auto=format&fit=crop&q=80', 'https://foldsofhonor.org', true, true),
  (uuid_generate_v4(), 'St. Jude Children’s Research Hospital', 'Leading the way the world understands, treats, and defeats childhood cancer and other life-threatening pediatric diseases.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', 'https://www.stjude.org', true, true),
  (uuid_generate_v4(), 'Make-A-Wish Foundation', 'Creating life-changing wishes for children with critical illnesses, bringing hope, strength, and joy to families worldwide.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80', 'https://wish.org', false, true);

-- Insert Charity Events
INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Annual Youth Mentorship Day 2026',
  'Join junior golfers and community mentors for an inspiring charity invitational.',
  '2026-06-15',
  'golf_day'
FROM public.charities c
WHERE c.name = 'First Tee'
LIMIT 1;

INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Patriot Golf Day Invitational',
  'A premier charity tournament raising academic scholarships for families of fallen heroes.',
  '2026-05-25',
  'golf_day'
FROM public.charities c
WHERE c.name = 'Folds of Honor'
LIMIT 1;

INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'St. Jude Charity Pro-Am Classic',
  'Annual scramble raising critical funding for pediatric cancer research and patient families.',
  '2026-07-18',
  'golf_day'
FROM public.charities c
WHERE c.name LIKE '%St. Jude%'
LIMIT 1;

INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Wishes on the Fairway Scramble',
  'Community golf day granting wishes for children with life-threatening illnesses.',
  '2026-09-10',
  'golf_day'
FROM public.charities c
WHERE c.name LIKE '%Make-A-Wish%'
LIMIT 1;

-- Create a function to create test users (for development)
-- Note: In production, users are created via Supabase Auth
CREATE OR REPLACE FUNCTION public.create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT DEFAULT 'USER'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This would normally be done via Supabase Auth API
  -- For seed data purposes, we'll return a generated UUID
  new_user_id := uuid_generate_v4();
  
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (new_user_id, user_email, user_role, user_full_name);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Create admin user (run this manually with real Supabase Auth)
-- SELECT public.create_test_user('admin@digitalheroes.com', 'admin123', 'Admin User', 'ADMIN');
-- SELECT public.create_test_user('user@digitalheroes.com', 'user123', 'Test User', 'USER');
