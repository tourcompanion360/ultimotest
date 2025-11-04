-- Create end_client_users mapping table
CREATE TABLE public.end_client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_end_client_users_auth_user_id ON public.end_client_users(auth_user_id);
CREATE INDEX idx_end_client_users_end_client_id ON public.end_client_users(end_client_id);

-- Enable RLS
ALTER TABLE public.end_client_users ENABLE ROW LEVEL SECURITY;

-- RLS policy: end-clients can only see their own mapping
CREATE POLICY "End clients can view their own mapping" ON public.end_client_users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- RLS policy: creators can manage mappings for their clients
CREATE POLICY "Creators can manage mappings for their clients" ON public.end_client_users
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );



