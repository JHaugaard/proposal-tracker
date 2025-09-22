import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { usePIs } from '@/hooks/useProposalData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RelatedProposalsPopover } from '@/components/RelatedProposalsPopover';
import { SearchBar } from '@/components/SearchBar';
import { ScrollArea } from '@/components/ui/scroll-area';

const PIs = () => {
  const { pis, loading, createPI, refetch } = usePIs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPIName, setNewPIName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const { toast } = useToast();

  // Filter PIs based on search query and selected letter
  const filteredPIs = pis.filter((pi) => {
    const matchesSearch = !searchQuery || pi.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !selectedLetter || pi.name.toLowerCase().startsWith(selectedLetter.toLowerCase());
    return matchesSearch && matchesLetter;
  });

  // Generate alphabet letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Principal Investigators</h1>
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
      </div>

      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>All PIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="w-full">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  resultsCount={filteredPIs.length}
                  loading={loading}
                />
              </div>
              
              <div className="flex gap-6">
                <div className="flex-1">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Loading PIs...</p>
                    </div>
                  ) : filteredPIs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        {pis.length === 0 ? "No PIs found. Add your first PI to get started." : "No PIs match your search criteria."}
                      </p>
                      {pis.length === 0 && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add First PI
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-1 pr-4">
                        {filteredPIs.map((pi) => (
                          <div key={pi.id} className="flex items-center space-x-3 py-1 px-2 border-b hover:bg-muted/50 transition-colors">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <RelatedProposalsPopover
                                entityId={pi.id}
                                entityName={pi.name}
                                entityType="pi"
                              >
                                <button className="text-left hover:text-primary transition-colors w-full text-sm">
                                  {pi.name}
                                </button>
                              </RelatedProposalsPopover>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                
                <div className="w-8 flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground mb-1">Filter</div>
                  <button
                    onClick={() => setSelectedLetter('')}
                    className={`text-xs py-0.5 px-1 rounded hover:bg-muted transition-colors ${
                      !selectedLetter ? 'bg-muted text-primary font-medium' : ''
                    }`}
                  >
                    All
                  </button>
                  {alphabet.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                      className={`text-xs py-0.5 px-1 rounded hover:bg-muted transition-colors ${
                        selectedLetter === letter ? 'bg-muted text-primary font-medium' : ''
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PIs;