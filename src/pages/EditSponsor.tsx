import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sponsor } from '@/hooks/useProposalData';

const EditSponsor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSponsor = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('sponsors')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setSponsor(data);
        setName(data.name);
      } catch (error) {
        console.error('Error fetching sponsor:', error);
        toast({
          title: "Error",
          description: "Failed to load sponsor details",
          variant: "destructive",
        });
        navigate('/sponsors');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!id || !name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsors')
        .update({ name: name.trim() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor updated successfully",
      });
      navigate('/sponsors');
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast({
        title: "Error",
        description: "Failed to update sponsor",
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
          <Button variant="ghost" onClick={() => navigate('/sponsors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sponsors
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading sponsor details...</p>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/sponsors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sponsors
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Sponsor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/sponsors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sponsors
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Sponsor</h1>
        </div>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sponsor-name">Sponsor Name</Label>
              <Input
                id="sponsor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sponsor name"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditSponsor;