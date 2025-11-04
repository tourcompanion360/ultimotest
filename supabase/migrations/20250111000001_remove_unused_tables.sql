-- Remove unused tables and clean up database

-- Drop unused tables that are defined but never used in the codebase
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.requests_history CASCADE;
DROP TABLE IF EXISTS public.agency_settings CASCADE;

-- Note: Keeping support_tickets and integration_settings as they are used in Settings and Support components
-- Note: Keeping appointments as it's used in useAppuntamenti hook

-- Clean up any orphaned indexes
-- (PostgreSQL will automatically drop indexes when tables are dropped)

-- Clean up any orphaned triggers
-- (PostgreSQL will automatically drop triggers when tables are dropped)

-- Clean up any orphaned RLS policies
-- (PostgreSQL will automatically drop policies when tables are dropped)
