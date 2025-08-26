-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('file-attachments', 'file-attachments', false);

-- Create RLS policies for file attachments bucket
CREATE POLICY "Authenticated users can view their file attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'file-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload file attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'file-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their file attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'file-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their file attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'file-attachments' AND auth.role() = 'authenticated');

-- Add foreign key constraint to file_attachments table
ALTER TABLE file_attachments 
ADD CONSTRAINT fk_file_attachments_file_id 
FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE;