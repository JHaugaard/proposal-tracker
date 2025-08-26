import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useProposalData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Sponsors = () => {
  const { sponsors, loading, createSponsor, refetch } = useSponsors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  const { toast } = useToast();

  const handleCreateSponsor = async () => {
    if (!newSponsorName.trim()) return;
    
    const result = await createSponsor(newSponsorName.trim());
    if (result) {
      setNewSponsorName('');
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Sponsor created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create sponsor",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage funding organizations and sponsors
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sponsor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sponsor-name">Sponsor Name</Label>
                <Input
                  id="sponsor-name"
                  value={newSponsorName}
                  onChange={(e) => setNewSponsorName(e.target.value)}
                  placeholder="Enter sponsor name"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSponsor()}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSponsor} disabled={!newSponsorName.trim()}>
                  Create Sponsor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
          <CardDescription>
            Funding organizations in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading sponsors...</p>
            </div>
          ) : sponsors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No sponsors found. Add your first sponsor to get started.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Sponsor
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium">{sponsor.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sponsors;