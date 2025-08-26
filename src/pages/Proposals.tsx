import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Proposals = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">
            Manage and track all your proposals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Proposal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
          <CardDescription>
            A list of all proposals in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No proposals found. Add your first proposal to get started.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Proposal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Proposals;