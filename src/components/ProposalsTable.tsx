import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { FileRecord, SortField, SortDirection } from '@/hooks/useFiles';
import { HighlightText } from './HighlightText';
import { RelatedProposalsPopover } from './RelatedProposalsPopover';
import { useNavigate } from 'react-router-dom';

interface ProposalsTableProps {
  files: FileRecord[];
  loading: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onStatusChange: (fileId: string, status: string) => void;
  searchQuery?: string;
}

const statusOptions = [
  'In',
  'Pending',
  'Pending Signatures',
  'Process',
  'Done',
  'On Hold',
  'Withdrawn'
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Done':
      return 'default';
    case 'In':
    case 'Process':
      return 'secondary';
    case 'Pending':
    case 'Pending Signatures':
      return 'outline';
    case 'On Hold':
    case 'Withdrawn':
      return 'destructive';
    default:
      return 'outline';
  }
};

const SortableHeader = ({ 
  field, 
  currentField, 
  direction, 
  onSort, 
  children 
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) => {
  const isActive = currentField === field;
  
  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {children}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </TableHead>
  );
};

export function ProposalsTable({
  files,
  loading,
  sortField,
  sortDirection,
  onSort,
  onStatusChange,
  searchQuery = '',
}: ProposalsTableProps) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No proposals found with the current filters.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="db_no" currentField={sortField} direction={sortDirection} onSort={onSort}>
            DB No.
          </SortableHeader>
          <SortableHeader field="pi_name" currentField={sortField} direction={sortDirection} onSort={onSort}>
            PI
          </SortableHeader>
          <SortableHeader field="sponsor_name" currentField={sortField} direction={sortDirection} onSort={onSort}>
            Sponsor
          </SortableHeader>
          <SortableHeader field="status" currentField={sortField} direction={sortDirection} onSort={onSort}>
            Status
          </SortableHeader>
          <SortableHeader field="date_received" currentField={sortField} direction={sortDirection} onSort={onSort}>
            Date Received
          </SortableHeader>
          <SortableHeader field="date_status_change" currentField={sortField} direction={sortDirection} onSort={onSort}>
            Status Changed
          </SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium py-1">
              <button 
                onClick={() => navigate(`/proposals/${file.id}`)}
                className="text-left hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                <HighlightText text={file.db_no} searchQuery={searchQuery} />
              </button>
            </TableCell>
            <TableCell className="py-1">
              <RelatedProposalsPopover
                entityId={file.pi_id}
                entityName={file.pi_name}
                entityType="pi"
              >
                <button className="text-left hover:text-primary transition-colors">
                  <HighlightText text={file.pi_name} searchQuery={searchQuery} />
                </button>
              </RelatedProposalsPopover>
            </TableCell>
            <TableCell className="py-1">
              <RelatedProposalsPopover
                entityId={file.sponsor_id}
                entityName={file.sponsor_name}
                entityType="sponsor"
              >
                <button className="text-left hover:text-primary transition-colors">
                  <HighlightText text={file.sponsor_name} searchQuery={searchQuery} />
                </button>
              </RelatedProposalsPopover>
            </TableCell>
            <TableCell className="py-1">
              <Select
                value={file.status}
                onValueChange={(value) => onStatusChange(file.id, value)}
              >
                <SelectTrigger className="w-auto h-auto p-0 border-0 shadow-none justify-start">
                  <Badge variant={getStatusColor(file.status)} className="justify-start text-left">
                    {file.status}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="py-1">
              {file.date_received 
                ? new Date(file.date_received).toLocaleDateString()
                : '-'
              }
            </TableCell>
            <TableCell className="py-1">
              {file.date_status_change 
                ? new Date(file.date_status_change).toLocaleDateString()
                : '-'
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}