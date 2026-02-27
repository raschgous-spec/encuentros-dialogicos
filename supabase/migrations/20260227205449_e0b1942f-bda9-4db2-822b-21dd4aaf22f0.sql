
-- Move unaccent extension to extensions schema for security
DROP EXTENSION IF EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;
