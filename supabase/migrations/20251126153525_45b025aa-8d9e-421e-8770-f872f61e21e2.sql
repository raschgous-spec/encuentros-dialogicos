-- Remove public access policy from cursos table
-- This policy was allowing unauthenticated users to view all course data
DROP POLICY IF EXISTS "Allow course code verification only" ON cursos;