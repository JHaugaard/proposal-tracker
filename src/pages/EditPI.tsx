import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PI } from '@/hooks/useProposalData';

const EditPI = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pi, setPI] = useState<PI | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPI = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('pis')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setPI(data);
        setName(data.name);
      } catch (error) {
        console.error('Error fetching PI:', error);
        toast({
          title: "Error",
          description: "Failed to load PI details",
          variant: "destructive",
        });
        navigate('/pis');
      } finally {
        setLoading(false);
      }
    };

    fetchPI();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!id || !name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pis')
        .update({ name: name.trim() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PI updated successfully",
      });
      navigate('/pis');
    } catch (error) {
      console.error('Error updating PI:', error);
      toast({
        title: "Error",
        description: "Failed to update PI",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pis')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PIs
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading PI details...</p>
        </div>
      </div>
    );
  }

  if (!pi) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pis')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PIs
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">PI not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pis')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PIs
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Principal Investigator</h1>
        </div>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>PI Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pi-name">PI Name</Label>
              <Input
                id="pi-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter PI name"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPI;