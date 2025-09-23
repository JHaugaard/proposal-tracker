import { Button } from '@/components/ui/button';
import { Plus, Building2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSponsors } from '@/hooks/useProposalData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RelatedProposalsPopover } from '@/components/RelatedProposalsPopover';
import { SearchBar } from '@/components/SearchBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';

const Sponsors = () => {
  const { sponsors, loading, createSponsor, refetch } = useSponsors();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const { toast } = useToast();

  const handleCreateSponsor = async (name: string) => {
    const result = await createSponsor(name.trim());
    if (result) {
      setNewSponsorName('');
      setSelectedSponsorId(result.id);
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

  const handleSelectSponsor = (sponsorId: string) => {
    setSelectedSponsorId(sponsorId);
    setIsDialogOpen(false);
    const selectedSponsor = sponsors.find(sponsor => sponsor.id === sponsorId);
    if (selectedSponsor) {
      toast({
        title: "Selected",
        description: `Selected ${selectedSponsor.name}`,
      });
    }
  };

  // Filter sponsors based on search query and selected letter
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !selectedLetter || sponsor.name.toLowerCase().startsWith(selectedLetter.toLowerCase());
    return matchesSearch && matchesLetter;
  });

  // Generate alphabet array
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sponsor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sponsor-autocomplete">Search or Add Sponsor</Label>
                <AutocompleteInput
                  items={sponsors.map(sponsor => ({ id: sponsor.id, name: sponsor.name }))}
                  value={selectedSponsorId}
                  onSelect={handleSelectSponsor}
                  onCreate={handleCreateSponsor}
                  placeholder="Search existing sponsors or type new name"
                  createLabel="Create Sponsor"
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedSponsorId('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-1/2">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={filteredSponsors.length}
          loading={loading}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-4">All Sponsors</h2>
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
          ) : filteredSponsors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No sponsors match your current filters.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 pr-4">
                {filteredSponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center space-x-3 py-1 px-2 border-b hover:bg-muted/50 transition-colors">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <RelatedProposalsPopover
                        entityId={sponsor.id}
                        entityName={sponsor.name}
                        entityType="sponsor"
                      >
                        <button className="text-left hover:text-primary transition-colors">
                          <span className="text-sm font-medium">{sponsor.name}</span>
                        </button>
                      </RelatedProposalsPopover>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/sponsors/${sponsor.id}/edit`)}
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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
  );
};

export default Sponsors;