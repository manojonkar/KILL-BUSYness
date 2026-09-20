-- ═══════════════════════════════════════════════════════════════
-- KILL BUSYness Portal — Phase 3 Database Migrations
-- Run these in Supabase SQL Editor in order.
-- ═══════════════════════════════════════════════════════════════

-- ─── 3a. REFERRAL SYSTEM ─────────────────────────────────────

-- Every user gets a referral code (their user ID works, but a short code is nicer)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Track referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID REFERENCES auth.users(id),
  referred_email TEXT,
  credited_signup BOOLEAN DEFAULT FALSE,
  credited_audit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);

-- RLS: users can see their own referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System inserts referrals" ON public.referrals
  FOR INSERT WITH CHECK (TRUE);

-- Add referral_code to user_progress for convenience
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;


-- ─── 3b. CLAIMS QUEUE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  claim_type TEXT NOT NULL CHECK (claim_type IN ('gift_book', 'attend_training', 'organize_training')),
  details TEXT,
  credits_amount INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_claims_user ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own claims" ON public.claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users submit claims" ON public.claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can see all (handled via service role or admin check)


-- ─── 3c. READING CLUBS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT,
  founder_id UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  threshold_credited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_clubs_founder ON public.clubs(founder_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON public.club_members(user_id);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see clubs" ON public.clubs
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users create clubs" ON public.clubs
  FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders manage clubs" ON public.clubs
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Anyone can see club members" ON public.club_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users join clubs" ON public.club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave clubs" ON public.club_members
  FOR DELETE USING (auth.uid() = user_id);


-- ─── 3d. TRANSFORMER BADGE — Audit History ──────────────────

-- Track audit snapshots so we can compare BUSYness Index across cycles
CREATE TABLE IF NOT EXISTS public.audit_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  busyness_index NUMERIC(5,2),
  respondent_count INT DEFAULT 0,
  snapshot_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_snapshots_company ON public.audit_snapshots(company_id);

ALTER TABLE public.audit_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins see snapshots" ON public.audit_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id AND c.admin_user_id = auth.uid()
    )
  );
