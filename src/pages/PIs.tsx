import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PIs = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Investigators</h1>
          <p className="text-muted-foreground">
            Manage the PIs associated with proposals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add PI
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All PIs</CardTitle>
          <CardDescription>
            Principal Investigators in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No PIs found. Add your first PI to get started.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First PI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PIs;