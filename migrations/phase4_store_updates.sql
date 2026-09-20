-- phase4_store_updates.sql

-- 1. Create training applications table
CREATE TABLE IF NOT EXISTS public.training_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    item_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    preferred_dates TEXT,
    attendees INTEGER,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.training_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own training applications" 
    ON public.training_applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own training applications" 
    ON public.training_applications FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. Update existing store items
-- Rename ODeX and change cost
UPDATE public.store_items 
SET item = '50% off an ODeX Discovery Session', cost = 200 
WHERE item = '20% off an ODeX Discovery Session';

-- Change Public Training cost
UPDATE public.store_items 
SET cost = 200 
WHERE item = '25% off a seat on a public Training Programme';

-- Change In-house Training cost
UPDATE public.store_items 
SET cost = 200 
WHERE item = '10% off an In-house Training Engagement';

-- Rename Chapter Debrief and change cost
UPDATE public.store_items 
SET item = '20-min 1:1 Chapter Debrief with a Coach', cost = 2000 
WHERE item = '15-min 1:1 Chapter Debrief with a Coach';

-- Change Audit Walk-through cost
UPDATE public.store_items 
SET cost = 20000 
WHERE item = '45-min Audit Report Walk-through with Manoj';

-- Note: No need to update triggers or anything else. 
-- The rewards page will now use string matching to categorize these items.
