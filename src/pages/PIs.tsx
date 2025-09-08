import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { usePIs } from '@/hooks/useProposalData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RelatedProposalsPopover } from '@/components/RelatedProposalsPopover';

const PIs = () => {
  const { pis, loading, createPI, refetch } = usePIs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPIName, setNewPIName] = useState('');
  const { toast } = useToast();

  const handleCreatePI = async () => {
    if (!newPIName.trim()) return;
    
    const result = await createPI(newPIName.trim());
    if (result) {
      setNewPIName('');
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "PI created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create PI",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Investigators</h1>
          <p className="text-muted-foreground">
            Manage the PIs associated with proposals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add PI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Principal Investigator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pi-name">PI Name</Label>
                <Input
                  id="pi-name"
                  value={newPIName}
                  onChange={(e) => setNewPIName(e.target.value)}
                  placeholder="Enter PI name"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePI()}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePI} disabled={!newPIName.trim()}>
                  Create PI
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All PIs</CardTitle>
          <CardDescription>
            Principal Investigators in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Loading PIs...</p>
            </div>
          ) : pis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No PIs found. Add your first PI to get started.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First PI
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {pis.map((pi) => (
                <div key={pi.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <RelatedProposalsPopover
                      entityId={pi.id}
                      entityName={pi.name}
                      entityType="pi"
                    >
                      <button className="text-left hover:text-primary transition-colors">
                        <h3 className="font-medium">{pi.name}</h3>
                      </button>
                    </RelatedProposalsPopover>
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

export default PIs;