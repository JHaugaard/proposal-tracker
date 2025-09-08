import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileRecord } from '@/hooks/useFiles';

export function useRelatedProposals(entityId: string | null, entityType: 'pi' | 'sponsor') {
  const [proposals, setProposals] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) {
      setProposals([]);
      return;
    }

    const fetchRelatedProposals = async () => {
      setLoading(true);
      try {
        const filterField = entityType === 'pi' ? 'pi_id' : 'sponsor_id';
        
        const { data, error } = await supabase
          .from('files')
          .select(`
            *,
            pis!inner(name),
            sponsors!inner(name)
          `)
          .eq(filterField, entityId)
          .order('date_received', { ascending: false });

        if (error) throw error;

        const formattedProposals = data.map(file => ({
          ...file,
          pi_name: file.pis.name,
          sponsor_name: file.sponsors.name,
        }));

        setProposals(formattedProposals);
      } catch (error) {
        console.error('Error fetching related proposals:', error);
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProposals();
  }, [entityId, entityType]);

  return { proposals, loading };
}