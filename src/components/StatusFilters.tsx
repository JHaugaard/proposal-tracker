import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface StatusFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  statusCounts: Record<string, number>;
  onCreatePDF: () => void;
}

const statusOptions = [
  'In',
  'Pending',
  'Pending Signatures', 
  'Process',
  'Done',
  'On Hold',
  'Withdrawn',
  'All'
];

export function StatusFilters({ activeFilter, onFilterChange, statusCounts, onCreatePDF }: StatusFiltersProps) {
  const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button
        variant="secondary"
        size="sm"
        onClick={onCreatePDF}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Create PDF
      </Button>
      
      <div className="h-6 w-px bg-border" />
      
      {statusOptions.map((status) => {
        const count = status === 'All' ? totalCount : statusCounts[status] || 0;
        const isActive = activeFilter === status;
        
        return (
          <Button
            key={status}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(status)}
            className="gap-2"
          >
            {status}
            <Badge variant="secondary" className="ml-1">
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}