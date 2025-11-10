-- Add admin policies for support_tickets table
-- This allows admins to view and manage all support tickets

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update all support tickets" ON public.support_tickets;

-- Admin can view all support tickets
CREATE POLICY "Admins can view all support tickets"
ON public.support_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Admin can update all support tickets
CREATE POLICY "Admins can update all support tickets"
ON public.support_tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Admin can insert support tickets (for testing or on behalf of users)
CREATE POLICY "Admins can insert support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);
