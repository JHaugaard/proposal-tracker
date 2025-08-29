-- Add indexes and constraints for data import performance and integrity
-- Only add constraints that don't already exist

-- Add unique constraints on PI and Sponsor names for data integrity
ALTER TABLE public.pis ADD CONSTRAINT pis_name_unique UNIQUE (name);
ALTER TABLE public.sponsors ADD CONSTRAINT sponsors_name_unique UNIQUE (name);

-- Add unique constraint on files.db_no since it should be unique
ALTER TABLE public.files ADD CONSTRAINT files_db_no_unique UNIQUE (db_no);

-- Add indexes for better query performance with large datasets
CREATE INDEX IF NOT EXISTS idx_pis_name ON public.pis(name);
CREATE INDEX IF NOT EXISTS idx_sponsors_name ON public.sponsors(name);
CREATE INDEX IF NOT EXISTS idx_files_db_no ON public.files(db_no);
CREATE INDEX IF NOT EXISTS idx_files_status ON public.files(status);
CREATE INDEX IF NOT EXISTS idx_files_pi_id ON public.files(pi_id);
CREATE INDEX IF NOT EXISTS idx_files_sponsor_id ON public.files(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_files_date_received ON public.files(date_received);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at);