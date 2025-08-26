import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalProposals: number;
  activePIs: number;
  totalSponsors: number;
  inProgressCount: number;
  statusCounts: Record<string, number>;
  recentActivity: Array<{
    id: string;
    db_no: string;
    status: string;
    updated_at: string;
    pi_name: string;
  }>;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProposals: 0,
    activePIs: 0,
    totalSponsors: 0,
    inProgressCount: 0,
    statusCounts: {},
    recentActivity: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch proposals with PI names for recent activity
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select(`
          *,
          pis!inner(name)
        `)
        .order('updated_at', { ascending: false });

      if (filesError) throw filesError;

      // Fetch unique PIs count
      const { data: pis, error: pisError } = await supabase
        .from('pis')
        .select('id');

      if (pisError) throw pisError;

      // Fetch sponsors count
      const { data: sponsors, error: sponsorsError } = await supabase
        .from('sponsors')
        .select('id');

      if (sponsorsError) throw sponsorsError;

      // Calculate stats
      const totalProposals = files?.length || 0;
      const activePIs = pis?.length || 0;
      const totalSponsors = sponsors?.length || 0;
      
      const statusCounts = files?.reduce((acc, file) => {
        acc[file.status] = (acc[file.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const inProgressCount = (statusCounts['Pending'] || 0) + 
                             (statusCounts['Pending Signatures'] || 0) + 
                             (statusCounts['Process'] || 0);

      const recentActivity = files?.slice(0, 5).map(file => ({
        id: file.id,
        db_no: file.db_no,
        status: file.status,
        updated_at: file.updated_at,
        pi_name: file.pis.name,
      })) || [];

      setStats({
        totalProposals,
        activePIs,
        totalSponsors,
        inProgressCount,
        statusCounts,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}