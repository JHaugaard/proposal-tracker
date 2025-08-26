import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProposalForm } from '@/components/ProposalForm';
import { ProposalsTable } from '@/components/ProposalsTable';
import { StatusFilters } from '@/components/StatusFilters';
import { useFiles, FileRecord } from '@/hooks/useFiles';

const Proposals = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileRecord | null>(null);
  
  const {
    files,
    loading,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    handleSort,
    statusCounts,
    updateFileStatus,
    refetch,
  } = useFiles();

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingFile(null);
    refetch();
  };

  const handleEdit = (file: FileRecord) => {
    setEditingFile(file);
    setIsFormOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">
            Manage and track all your proposals
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFile ? 'Edit Proposal' : 'Add New Proposal'}
              </DialogTitle>
            </DialogHeader>
            <ProposalForm 
              onSuccess={handleFormSuccess} 
              editingFile={editingFile}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>All Proposals</CardTitle>
              <CardDescription>
                Filter and manage your proposals
              </CardDescription>
            </div>
          </div>
          <StatusFilters
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
            statusCounts={statusCounts}
          />
        </CardHeader>
        <CardContent>
          {files.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No proposals found. Add your first proposal to get started.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Proposal
              </Button>
            </div>
          ) : (
            <ProposalsTable
              files={files}
              loading={loading}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onStatusChange={updateFileStatus}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Proposals;