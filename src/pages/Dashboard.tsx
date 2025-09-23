import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Building2, TrendingUp, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProposalForm } from '@/components/ProposalForm';
import { useDashboard } from '@/hooks/useDashboard';
import { useFiles } from '@/hooks/useFiles';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ProposalsTable } from '@/components/ProposalsTable';
import { useState } from 'react';

const Dashboard = () => {
  const { stats, loading } = useDashboard();
  const { 
    files, 
    loading: filesLoading, 
    updateFileStatus, 
    handleSort, 
    sortField, 
    sortDirection,
    refetch
  } = useFiles();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const statusCards = [
    { status: 'In', icon: FileText, label: 'In' },
    { status: 'Pending', icon: TrendingUp, label: 'Pending' },
    { status: 'Pending Signatures', icon: Users, label: 'Pending Signatures' },
    { status: 'Process', icon: Building2, label: 'Process' },
  ];

  const handleCardClick = (status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  const handleEditProposal = (file: any) => {
    navigate(`/proposals/${file.id}`);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const filteredFiles = selectedStatus 
    ? files.filter(file => file.status === selectedStatus)
    : [];
  
  return (
    <div className="max-w-7xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Proposals
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statusCards.map(({ status, icon: Icon, label }) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedStatus === status ? 'bg-accent' : ''
            }`}
            onClick={() => handleCardClick(status)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : (stats.statusCounts[status] || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                proposals
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-start mt-6">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Proposal</DialogTitle>
            </DialogHeader>
            <ProposalForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {selectedStatus && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selectedStatus} Proposals ({filteredFiles.length})
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setSelectedStatus(null)}
            >
              Close
            </Button>
          </div>
          <div className="border rounded-lg p-4">
            <ProposalsTable
              files={filteredFiles}
              loading={filesLoading}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onStatusChange={updateFileStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;