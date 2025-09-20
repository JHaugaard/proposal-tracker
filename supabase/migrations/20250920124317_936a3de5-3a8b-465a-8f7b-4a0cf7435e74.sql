-- Temporarily disable RLS on main tables to allow data access while authentication is disabled
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments DISABLE ROW LEVEL SECURITY;