-- Allow null values for date_status_change column to support "empty" status change dates
ALTER TABLE public.files ALTER COLUMN date_status_change DROP NOT NULL;