import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileRecord {
  id: string;
  db_no: string;
  status: 'In' | 'Pending' | 'Pending Signatures' | 'Process' | 'Done' | 'On Hold' | 'Withdrawn';
  date_received: string | null;
  date_status_change: string | null;
  notes: string | null;
  external_link: string | null;
  cayuse: string | null;
  to_set_up: string | null;
  created_at: string;
  updated_at: string;
  pi_id: string;
  sponsor_id: string;
  pi_name: string;
  sponsor_name: string;
}

export type SortField = 'db_no' | 'pi_name' | 'sponsor_name' | 'status' | 'date_received' | 'date_status_change';
export type SortDirection = 'asc' | 'desc';

export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date_received');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          pis!inner(name),
          sponsors!inner(name)
        `)
        .order(sortField === 'pi_name' ? 'pis.name' : sortField === 'sponsor_name' ? 'sponsors.name' : sortField, { ascending: sortDirection === 'asc' });
      
      if (error) throw error;
      
      const formattedFiles = data?.map(file => ({
        ...file,
        pi_name: file.pis.name,
        sponsor_name: file.sponsors.name,
      })) || [];

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFileStatus = async (fileId: string, newStatus: 'In' | 'Pending' | 'Pending Signatures' | 'Process' | 'Done' | 'On Hold' | 'Withdrawn') => {
    try {
      const { error } = await supabase
        .from('files')
        .update({
          status: newStatus,
          date_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (error) throw error;

      // Update local state
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, status: newStatus, date_status_change: new Date().toISOString() }
          : file
      ));

      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bulkClearWithdrawnStatusChange = async () => {
    try {
      const { error } = await supabase
        .from('files')
        .update({
          date_status_change: null,
          updated_at: new Date().toISOString(),
        })
        .eq('status', 'Withdrawn');

      if (error) throw error;

      // Update local state
      setFiles(prev => prev.map(file => 
        file.status === 'Withdrawn' 
          ? { ...file, date_status_change: null, updated_at: new Date().toISOString() }
          : file
      ));

      toast({
        title: "Success",
        description: "Status changed dates cleared for all withdrawn files.",
      });
    } catch (error) {
      console.error('Error clearing withdrawn status dates:', error);
      toast({
        title: "Error",
        description: "Failed to clear status dates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesStatus = statusFilter === 'All' || file.status === statusFilter;
    const matchesSearch = !searchQuery || 
      file.db_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.pi_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = files.reduce((acc, file) => {
    acc[file.status] = (acc[file.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    fetchFiles();
  }, [sortField, sortDirection]);

  return {
    files: filteredFiles,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    statusCounts,
    updateFileStatus,
    bulkClearWithdrawnStatusChange,
    refetch: fetchFiles,
  };
}