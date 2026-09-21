-- Par For Purpose Seed Data
-- Initial mock data for testing

-- Insert Plans (replace stripe_price_id with your actual Stripe price IDs)
INSERT INTO public.plans (name, billing_interval, price, currency, stripe_price_id, active) VALUES
  ('Monthly Hero', 'monthly', 9.99, 'USD', 'price_monthly_test', true),
  ('Yearly Hero', 'yearly', 99.99, 'USD', 'price_yearly_test', true);

-- Insert Charities
INSERT INTO public.charities (id, name, description, image_url, website_url, is_featured, is_active) VALUES
  (uuid_generate_v4(), 'First Tee', 'Empowering youth through golf education and character development programs.', 'https://images.unsplash.com/photo-1535131749006-b7f558bce614?w=400', 'https://www.firsttee.org', true, true),
  (uuid_generate_v4(), 'Golf for Cause', 'Connecting golf communities with charitable giving initiatives worldwide.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400', 'https://www.golfforcause.org', true, true),
  (uuid_generate_v4(), 'Green Fairways Foundation', 'Dedicated to environmental sustainability in golf courses and communities.', 'https://images.unsplash.com/photo-1593111774240-d529f12cfd7c?w=400', 'https://www.greenfairways.org', false, true),
  (uuid_generate_v4(), 'Youth Golf Alliance', 'Providing golf opportunities to underprivileged youth across the nation.', 'https://images.unsplash.com/photo-1592919505780-303950717480?w=400', 'https://www.youthgolfalliance.org', false, true);

-- Insert Charity Events
INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Annual Golf Tournament 2026',
  'Join us for our biggest fundraising event of the year!',
  '2026-06-15',
  'golf_day'
FROM public.charities c
WHERE c.name = 'First Tee'
LIMIT 1;

INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Community Golf Day',
  'A fun day of golf for all skill levels with proceeds going to charity.',
  '2026-04-20',
  'golf_day'
FROM public.charities c
WHERE c.name = 'Golf for Cause'
LIMIT 1;

-- Insert Charity Events for Green Fairways
INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Course Conservation Workshop',
  'Learn about sustainable practices in golf course management.',
  '2026-05-10',
  'workshop'
FROM public.charities c
WHERE c.name = 'Green Fairways Foundation'
LIMIT 1;

-- Insert Charity Events for Youth Golf Alliance
INSERT INTO public.charity_events (charity_id, title, description, event_date, event_type)
SELECT 
  c.id,
  'Junior Golf Championship',
  'Annual tournament for young golfers ages 8-18.',
  '2026-07-22',
  'golf_day'
FROM public.charities c
WHERE c.name = 'Youth Golf Alliance'
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
