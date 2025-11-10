-- Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  admin_response TEXT,
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_creator_id ON public.support_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests(created_at DESC);

-- Create function to maintain updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trg_support_requests_updated_at ON public.support_requests;
CREATE TRIGGER trg_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "insert_own_support_request" ON public.support_requests;
DROP POLICY IF EXISTS "select_own_support_requests" ON public.support_requests;
DROP POLICY IF EXISTS "select_all_for_admins" ON public.support_requests;
DROP POLICY IF EXISTS "update_all_for_admins" ON public.support_requests;

-- Creators/users can insert their own requests
CREATE POLICY "insert_own_support_request" ON public.support_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own requests
CREATE POLICY "select_own_support_requests" ON public.support_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins see all (if you maintain an admin_users table)
CREATE POLICY "select_all_for_admins" ON public.support_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));

-- Admins can update all requests
CREATE POLICY "update_all_for_admins" ON public.support_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));

-- Create admin RPC function
CREATE OR REPLACE FUNCTION public.get_all_support_requests()
RETURNS SETOF public.support_requests
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM public.support_requests ORDER BY created_at DESC;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.support_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_support_requests() TO authenticated;
