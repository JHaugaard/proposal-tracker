import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Sponsors = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage funding organizations and sponsors
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
          <CardDescription>
            Funding organizations in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No sponsors found. Add your first sponsor to get started.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Sponsor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sponsors;