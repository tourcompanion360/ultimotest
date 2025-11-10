# 🔧 FIX: "Could not find the table 'public.support_tickets'"

## The Problem
The `support_tickets` table doesn't exist in your Supabase database yet.

## The Solution
You need to run the SQL migrations to create the table.

---

## Option 1: Using Supabase Dashboard (EASIEST)

### Step 1: Copy the SQL
Open this file and copy ALL the content:
- `supabase/migrations/20250828013502_ca3381bf-829e-4d6f-9c8d-5ffa220cb790.sql`

### Step 2: Run in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL you copied
6. Click **Run** (or press Ctrl+Enter)

### Step 3: Add Admin Policies
Copy and run this file too:
- `supabase/migrations/20250828013503_add_admin_support_policies.sql`

---

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "c:\Users\samir\Desktop\stages\copia numero 2"

# Link to your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to database
npx supabase db push
```

---

## Option 3: Manual SQL (If migrations don't work)

Copy and paste this SQL directly into Supabase SQL Editor:

```sql
-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aperto',
  priority TEXT NOT NULL DEFAULT 'normale',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own support tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all support tickets"
ON public.support_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update all support tickets"
ON public.support_tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## Verify It Worked

After running the SQL, verify the table exists:

```sql
-- Run this in Supabase SQL Editor
SELECT * FROM public.support_tickets;
```

If you see a result (even if empty), the table exists! ✅

---

## Then Test Your App

1. **Refresh your app** (Ctrl+R or F5)
2. **Submit a support request** as a user
3. **View it in admin panel** - it should work now!

---

## Still Getting Errors?

### Error: "relation 'admin_users' does not exist"
You need to create the admin_users table first. Check if you have this migration or create it manually.

### Error: "function update_updated_at_column does not exist"
The function is created in the SQL above. Make sure you ran all of it.

### Error: Still can't see the table
1. Check you're connected to the right Supabase project
2. Check the table was created in the `public` schema
3. Try refreshing the Supabase dashboard

---

## Quick Check: Do You Have admin_users Table?

Run this to check:

```sql
SELECT * FROM public.admin_users;
```

If this fails, you need to create the admin_users table first. Let me know and I'll help!
