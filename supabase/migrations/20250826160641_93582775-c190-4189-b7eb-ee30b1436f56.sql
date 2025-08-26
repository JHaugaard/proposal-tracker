-- Create status enum for proposals
CREATE TYPE public.proposal_status AS ENUM (
  'In',
  'Pending', 
  'Pending Signatures',
  'Process',
  'Done',
  'On Hold',
  'Withdrawn'
);

-- Create PIs table
CREATE TABLE public.pis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Sponsors table  
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Files table (main proposals table)
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  db_no TEXT NOT NULL UNIQUE,
  pi_id UUID NOT NULL REFERENCES public.pis(id) ON DELETE RESTRICT,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE RESTRICT,
  cayuse TEXT,
  status public.proposal_status NOT NULL DEFAULT 'In',
  date_received DATE,
  date_status_change TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  to_set_up DATE,
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create File_Attachments table
CREATE TABLE public.file_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.pis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for single-user application (authenticated user can access all data)
CREATE POLICY "Authenticated users can manage PIs" 
ON public.pis 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage Sponsors" 
ON public.sponsors 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage Files" 
ON public.files 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage File Attachments" 
ON public.file_attachments 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on files table
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_files_db_no ON public.files(db_no);
CREATE INDEX idx_files_pi_id ON public.files(pi_id);
CREATE INDEX idx_files_sponsor_id ON public.files(sponsor_id);
CREATE INDEX idx_files_status ON public.files(status);
CREATE INDEX idx_file_attachments_file_id ON public.file_attachments(file_id);