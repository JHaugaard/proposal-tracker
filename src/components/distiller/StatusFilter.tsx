import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

interface StatusFilterProps {
  statuses: string[];
  selectedStatuses: string[];
  onStatusChange: (status: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function StatusFilter({ 
  statuses, 
  selectedStatuses, 
  onStatusChange, 
  onSelectAll, 
  onClearAll 
}: StatusFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter by Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
          >
            Clear All
          </Button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {statuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={(checked) => 
                  onStatusChange(status, checked as boolean)
                }
              />
              <label
                htmlFor={status}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {status}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}