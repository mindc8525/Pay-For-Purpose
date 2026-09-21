-- Par For Purpose Database Schema
-- Architecture Specification: 2026 Edition

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('PUBLIC', 'USER', 'ADMIN')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_price_id TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  stableford_score INTEGER NOT NULL CHECK (stableford_score >= 1 AND stableford_score <= 45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

-- Charities table
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charity events table
CREATE TABLE IF NOT EXISTS public.charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User charity preferences
CREATE TABLE IF NOT EXISTS public.user_charity_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id),
  contribution_percentage DECIMAL(5, 2) NOT NULL DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draws table
CREATE TABLE IF NOT EXISTS public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_period TEXT NOT NULL UNIQUE, -- Format: YYYY-MM
  strategy_type TEXT NOT NULL DEFAULT 'random' CHECK (strategy_type IN ('random', 'algorithmic')),
  strategy_version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'configured' CHECK (status IN ('configured', 'simulated', 'published', 'completed')),
  config JSONB NOT NULL DEFAULT '{}',
  winning_numbers INTEGER[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draw participants table
CREATE TABLE IF NOT EXISTS public.draw_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score_snapshot INTEGER[] NOT NULL,
  draw_numbers INTEGER[] NOT NULL,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  match_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- Prize pools table
CREATE TABLE IF NOT EXISTS public.prize_pools (
  draw_id UUID PRIMARY KEY REFERENCES public.draws(id) ON DELETE CASCADE,
  base_pool_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  rollover_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_pool_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  five_match_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  four_match_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  three_match_pool DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Winners table
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  calculated_prize DECIMAL(12, 2) NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charity contributions table
CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
  charity_id UUID NOT NULL REFERENCES public.charities(id),
  percentage DECIMAL(5, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_charities_active ON public.charities(is_active);
CREATE INDEX IF NOT EXISTS idx_draws_period ON public.draws(draw_period);
CREATE INDEX IF NOT EXISTS idx_draws_status ON public.draws(status);
CREATE INDEX IF NOT EXISTS idx_draw_participants_draw_id ON public.draw_participants(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON public.winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_verification ON public.winners(verification_status);
CREATE INDEX IF NOT EXISTS idx_winners_payout ON public.winners(payout_status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access
CREATE POLICY "Public charities are viewable by everyone" ON public.charities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public charity events are viewable by everyone" ON public.charity_events
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.charities WHERE charities.id = charity_events.charity_id AND charities.is_active = true
  ));

CREATE POLICY "Public plans are viewable by everyone" ON public.plans
  FOR SELECT USING (active = true);

CREATE POLICY "Published draws are viewable by everyone" ON public.draws
  FOR SELECT USING (status = 'published' OR status = 'completed');

-- RLS Policies for authenticated users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scores" ON public.scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.scores
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own charity preference" ON public.user_charity_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charity preference" ON public.user_charity_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charity preference" ON public.user_charity_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own draw participation" ON public.draw_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own winnings" ON public.winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own proof" ON public.winners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own contributions" ON public.charity_contributions
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin RLS Policies
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage all scores" ON public.scores
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all charities" ON public.charities
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all charity events" ON public.charity_events
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all draws" ON public.draws
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all draw participants" ON public.draw_participants
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all prize pools" ON public.prize_pools
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage all winners" ON public.winners
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all contributions" ON public.charity_contributions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT USING (public.is_admin());

-- Trigger to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    'USER',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_scores_updated_at
  BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_charities_updated_at
  BEFORE UPDATE ON public.charities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_charity_preferences_updated_at
  BEFORE UPDATE ON public.user_charity_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_draws_updated_at
  BEFORE UPDATE ON public.draws
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_winners_updated_at
  BEFORE UPDATE ON public.winners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
