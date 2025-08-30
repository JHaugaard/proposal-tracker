import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Save, X, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileRecord } from '@/hooks/useFiles';
import { ProposalForm } from '@/components/ProposalForm';
import { FileAttachmentsManager } from '@/components/FileAttachmentsManager';

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

export default function FileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<FileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editedStatus, setEditedStatus] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchFile();
    }
  }, [id]);

  const fetchFile = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          pis!inner(name),
          sponsors!inner(name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Error",
          description: "File not found.",
          variant: "destructive",
        });
        navigate('/proposals');
        return;
      }

      const formattedFile = {
        ...data,
        pi_name: data.pis.name,
        sponsor_name: data.sponsors.name,
      };

      setFile(formattedFile);
      setEditedStatus(formattedFile.status);
    } catch (error) {
      console.error('Error fetching file:', error);
      toast({
        title: "Error",
        description: "Failed to fetch file details. Please try again.",
        variant: "destructive",
      });
      navigate('/proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proposal deleted successfully.",
      });

      navigate('/proposals');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchFile(); // Refresh the data
  };

  const handleStatusChange = (newStatus: string) => {
    setEditedStatus(newStatus);
    setHasChanges(file?.status !== newStatus);
  };

  const handleSaveChanges = async () => {
    if (!file || !hasChanges) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({
          status: editedStatus as any,
          date_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proposal status updated successfully.",
      });

      setHasChanges(false);
      await fetchFile(); // Refresh the data
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusOptions = ['In', 'Process', 'Pending', 'Pending Signatures', 'Done', 'On Hold', 'Withdrawn'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">File not found.</p>
          <Button onClick={() => navigate('/proposals')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/proposals')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Proposal {file.db_no}
            </h1>
            <p className="text-muted-foreground">
              {file.pi_name} • {file.sponsor_name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              {hasChanges && (
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this proposal? This action cannot be undone and will also delete all associated file attachments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Proposal
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode */
        <Card>
          <CardHeader>
            <CardTitle>Edit Proposal</CardTitle>
            <CardDescription>
              Update the proposal information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProposalForm 
              onSuccess={handleEditSuccess} 
              editingFile={file}
            />
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Information */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
              <CardDescription>
                Key details about this proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">DB No.</label>
                  <p className="font-medium">{file.db_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Select
                      value={editedStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <Badge variant={getStatusColor(editedStatus)}>
                            {editedStatus}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            <Badge variant={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Principal Investigator</label>
                  <p className="font-medium">{file.pi_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sponsor</label>
                  <p className="font-medium">{file.sponsor_name}</p>
                </div>
              </div>

              {file.cayuse && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cayuse</label>
                  <p className="font-medium">{file.cayuse}</p>
                </div>
              )}

              {file.external_link && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">External Link</label>
                  <a
                    href={file.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {file.external_link}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {file.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm whitespace-pre-wrap">{file.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
              <CardDescription>
                Timeline information for this proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date Received</label>
                <p className="font-medium">
                  {file.date_received 
                    ? new Date(file.date_received).toLocaleDateString()
                    : 'Not set'
                  }
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Last Changed</label>
                <p className="font-medium">
                  {file.date_status_change 
                    ? (() => {
                        const d = new Date(file.date_status_change);
                        return !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Not set';
                      })()
                    : 'Not set'
                  }
                </p>
              </div>

              {file.to_set_up && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">To Set Up</label>
                  <p className="font-medium">
                    {new Date(file.to_set_up).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Attachments */}
      {!isEditing && (
        <FileAttachmentsManager fileId={file.id} />
      )}
    </div>
  );
}