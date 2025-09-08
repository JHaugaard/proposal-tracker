import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRelatedProposals } from '@/hooks/useRelatedProposals';
import { format } from 'date-fns';

interface RelatedProposalsPopoverProps {
  entityId: string;
  entityName: string;
  entityType: 'pi' | 'sponsor';
  children: React.ReactNode;
}

export function RelatedProposalsPopover({ 
  entityId, 
  entityName, 
  entityType, 
  children 
}: RelatedProposalsPopoverProps) {
  const [open, setOpen] = useState(false);
  const { proposals, loading } = useRelatedProposals(open ? entityId : null, entityType);
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In': return 'default';
      case 'Pending': return 'secondary';
      case 'Pending Signatures': return 'outline';
      case 'Process': return 'default';
      case 'Done': return 'default';
      case 'On Hold': return 'destructive';
      case 'Withdrawn': return 'secondary';
      default: return 'default';
    }
  };

  const handleProposalClick = (proposalId: string) => {
    navigate(`/proposals/${proposalId}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {entityType === 'pi' ? (
              <User className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
            <h4 className="font-medium text-sm">{entityName}</h4>
          </div>
          
          <div className="border-t pt-3">
            <h5 className="text-xs font-medium text-muted-foreground mb-2">
              Related Proposals ({loading ? '...' : proposals.length})
            </h5>
            
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : proposals.length === 0 ? (
              <div className="text-xs text-muted-foreground">No proposals found</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleProposalClick(proposal.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">
                          {proposal.db_no}
                        </div>
                        {entityType === 'pi' && (
                          <div className="text-xs text-muted-foreground truncate">
                            {proposal.sponsor_name}
                          </div>
                        )}
                        {entityType === 'sponsor' && (
                          <div className="text-xs text-muted-foreground truncate">
                            {proposal.pi_name}
                          </div>
                        )}
                        {proposal.date_received && (
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(proposal.date_received), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={getStatusColor(proposal.status) as any}
                      className="text-xs flex-shrink-0 ml-2"
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}