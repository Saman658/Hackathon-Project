-- ============================================================================
-- Remove debug table created during RLS investigation
-- ----------------------------------------------------------------------------
-- The `test_rls` table was a temporary debugging artifact created while
-- verifying the `rls_disabled_in_public` fix. It is not referenced by the
-- application and is safe to remove. Dropping it (rather than editing a
-- committed migration) keeps the live schema aligned with the migration
-- history.
-- ============================================================================

drop table if exists public.test_rls cascade;
