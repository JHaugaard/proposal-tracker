import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileAttachment {
  id: string;
  file_id: string;
  filename: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export function useFileAttachments(fileId: string) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { toast } = useToast();

  const fetchAttachments = async () => {
    if (!fileId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_attachments')
        .select('*')
        .eq('file_id', fileId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch file attachments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    try {
      // Add to progress tracking
      const progressEntry: UploadProgress = {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };
      setUploadProgress(prev => [...prev, progressEntry]);

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileId}/${fileName}`;

      // Upload to storage with progress simulation
      const { error: uploadError } = await supabase.storage
        .from('file-attachments')
        .upload(filePath, file);

      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name && p.progress < 90
              ? { ...p, progress: p.progress + 10 }
              : p
          )
        );
      }, 100);

      setTimeout(() => clearInterval(progressInterval), 500);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from('file_attachments')
        .insert({
          file_id: fileId,
          filename: file.name,
          file_size: file.size,
          file_path: filePath,
        });

      if (dbError) throw dbError;

      // Update progress to success
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileName === file.name 
            ? { ...p, progress: 100, status: 'success' }
            : p
        )
      );

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully.`,
      });

      fetchAttachments(); // Refresh the list
      
      // Remove from progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
      }, 2000);

      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Update progress to error
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileName === file.name 
            ? { ...p, status: 'error' }
            : p
        )
      );

      toast({
        title: "Error",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });

      // Remove from progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
      }, 3000);

      return false;
    }
  };

  const deleteAttachment = async (attachment: FileAttachment): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('file-attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully.",
      });

      fetchAttachments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('file-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [fileId]);

  return {
    attachments,
    loading,
    uploadProgress,
    uploadFile,
    deleteAttachment,
    downloadFile,
    refetch: fetchAttachments,
  };
}