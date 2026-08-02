-- Nudge PostgREST to reload its schema cache so the new invitations table
-- (and any other fresh objects) become visible to the REST API immediately.
notify pgrst, 'reload schema';
