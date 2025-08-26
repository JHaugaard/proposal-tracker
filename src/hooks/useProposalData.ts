import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PI {
  id: string;
  name: string;
}

export interface Sponsor {
  id: string;
  name: string;
}

export function usePIs() {
  const [pis, setPis] = useState<PI[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPIs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pis')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setPis(data || []);
    } catch (error) {
      console.error('Error fetching PIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPI = async (name: string): Promise<PI | null> => {
    try {
      const { data, error } = await supabase
        .from('pis')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newPI = data as PI;
      setPis(prev => [...prev, newPI]);
      return newPI;
    } catch (error) {
      console.error('Error creating PI:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  return { pis, loading, createPI, refetch: fetchPIs };
}

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSponsor = async (name: string): Promise<Sponsor | null> => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newSponsor = data as Sponsor;
      setSponsors(prev => [...prev, newSponsor]);
      return newSponsor;
    } catch (error) {
      console.error('Error creating sponsor:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  return { sponsors, loading, createSponsor, refetch: fetchSponsors };
}