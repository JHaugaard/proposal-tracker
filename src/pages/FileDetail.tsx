import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Trash2, ExternalLink, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileRecord } from '@/hooks/useFiles';
import { FileAttachmentsManager } from '@/components/FileAttachmentsManager';
import { RelatedProposalsPopover } from '@/components/RelatedProposalsPopover';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePIs } from '@/hooks/useProposalData';
import { useSponsors } from '@/hooks/useProposalData';

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
  
  // Individual field states for inline editing
  const [editingPI, setEditingPI] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(false);
  const [editingDateReceived, setEditingDateReceived] = useState(false);
  const [editingStatusDate, setEditingStatusDate] = useState(false);
  const [editingDBNo, setEditingDBNo] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  
  // Loading states for individual fields
  const [savingPI, setSavingPI] = useState(false);
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [savingDateReceived, setSavingDateReceived] = useState(false);
  const [savingStatusDate, setSavingStatusDate] = useState(false);
  const [savingDBNo, setSavingDBNo] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Temporary values for editing
  const [tempDBNo, setTempDBNo] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  
  // Get PI and Sponsor data for autocomplete
  const { pis, createPI } = usePIs();
  const { sponsors, createSponsor } = useSponsors();

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

  // Individual field save functions
  const handlePIChange = async (piId: string) => {
    if (!file || savingPI) return;

    setSavingPI(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          pi_id: piId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PI updated successfully.",
      });

      await fetchFile();
      setEditingPI(false);
    } catch (error) {
      console.error('Error updating PI:', error);
      toast({
        title: "Error",
        description: "Failed to update PI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingPI(false);
    }
  };

  const handleSponsorChange = async (sponsorId: string) => {
    if (!file || savingSponsor) return;

    setSavingSponsor(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          sponsor_id: sponsorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor updated successfully.",
      });

      await fetchFile();
      setEditingSponsor(false);
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast({
        title: "Error",
        description: "Failed to update sponsor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingSponsor(false);
    }
  };

  const handleDateReceivedChange = async (date: Date | undefined) => {
    if (!file || savingDateReceived) return;

    setSavingDateReceived(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          date_received: date?.toISOString().split('T')[0] || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Date received updated successfully.",
      });

      await fetchFile();
      setEditingDateReceived(false);
    } catch (error) {
      console.error('Error updating date received:', error);
      toast({
        title: "Error",
        description: "Failed to update date received. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingDateReceived(false);
    }
  };

  const handleStatusDateChange = async (date: Date | undefined) => {
    if (!file || savingStatusDate) return;

    setSavingStatusDate(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          date_status_change: date?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status date updated successfully.",
      });

      await fetchFile();
      setEditingStatusDate(false);
    } catch (error) {
      console.error('Error updating status date:', error);
      toast({
        title: "Error",
        description: "Failed to update status date. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingStatusDate(false);
    }
  };

  const handleDBNoChange = async () => {
    if (!file || savingDBNo || !tempDBNo.trim()) return;

    setSavingDBNo(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          db_no: tempDBNo.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "DB No. updated successfully.",
      });

      await fetchFile();
      setEditingDBNo(false);
    } catch (error) {
      console.error('Error updating DB No.:', error);
      toast({
        title: "Error",
        description: "Failed to update DB No. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingDBNo(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!file || savingStatus) return;

    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          status: newStatus as any,
          date_status_change: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully.",
      });

      await fetchFile();
      setEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleNotesChange = async () => {
    if (!file || savingNotes) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('files')
        .update({
          notes: tempNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notes updated successfully.",
      });

      await fetchFile();
      setEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Information */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">DB No.</label>
                  <div className="mt-1">
                    {editingDBNo ? (
                      <div className="flex gap-2">
                        <Input
                          value={tempDBNo}
                          onChange={(e) => setTempDBNo(e.target.value)}
                          placeholder="Enter DB No."
                          disabled={savingDBNo}
                        />
                        <Button
                          size="sm"
                          onClick={handleDBNoChange}
                          disabled={savingDBNo || !tempDBNo.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingDBNo(false);
                            setTempDBNo(file.db_no);
                          }}
                          disabled={savingDBNo}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{file.db_no}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTempDBNo(file.db_no);
                            setEditingDBNo(true);
                          }}
                          disabled={savingDBNo}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {editingStatus ? (
                      <div className="flex gap-2 items-center">
                        <Select value={tempStatus} onValueChange={setTempStatus} disabled={savingStatus}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(tempStatus)}
                          disabled={savingStatus || !tempStatus}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingStatus(false);
                            setTempStatus(file.status);
                          }}
                          disabled={savingStatus}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusColor(file.status)} className="justify-start text-left">
                          {file.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTempStatus(file.status);
                            setEditingStatus(true);
                          }}
                          disabled={savingStatus}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PI</label>
                  <div className="mt-1">
                    {editingPI ? (
                      <AutocompleteInput
                        items={pis}
                        value={file.pi_id}
                        onSelect={handlePIChange}
                        onCreate={async (name) => {
                          const newPI = await createPI(name);
                          if (newPI) {
                            handlePIChange(newPI.id);
                          }
                        }}
                        placeholder="Select or create PI"
                        createLabel="Create new PI"
                        disabled={savingPI}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <RelatedProposalsPopover
                          entityId={file.pi_id}
                          entityName={file.pi_name}
                          entityType="pi"
                        >
                          <button className="font-medium text-primary hover:underline text-left">
                            {file.pi_name}
                          </button>
                        </RelatedProposalsPopover>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPI(true)}
                          disabled={savingPI}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sponsor</label>
                  <div className="mt-1">
                    {editingSponsor ? (
                      <AutocompleteInput
                        items={sponsors}
                        value={file.sponsor_id}
                        onSelect={handleSponsorChange}
                        onCreate={async (name) => {
                          const newSponsor = await createSponsor(name);
                          if (newSponsor) {
                            handleSponsorChange(newSponsor.id);
                          }
                        }}
                        placeholder="Select or create sponsor"
                        createLabel="Create new sponsor"
                        disabled={savingSponsor}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <RelatedProposalsPopover
                          entityId={file.sponsor_id}
                          entityName={file.sponsor_name}
                          entityType="sponsor"
                        >
                          <button className="font-medium text-primary hover:underline text-left">
                            {file.sponsor_name}
                          </button>
                        </RelatedProposalsPopover>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSponsor(true)}
                          disabled={savingSponsor}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
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

              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <div className="mt-1">
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Enter notes"
                        rows={4}
                        disabled={savingNotes}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleNotesChange}
                          disabled={savingNotes}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotes(false);
                            setTempNotes(file.notes || '');
                          }}
                          disabled={savingNotes}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm whitespace-pre-wrap flex-1">
                          {file.notes || 'No notes added'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTempNotes(file.notes || '');
                            setEditingNotes(true);
                          }}
                          disabled={savingNotes}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date Received</label>
                <div className="mt-1">
                  {editingDateReceived ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !file.date_received && "text-muted-foreground"
                          )}
                          disabled={savingDateReceived}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {file.date_received ? format(new Date(file.date_received), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={file.date_received ? new Date(file.date_received) : undefined}
                          onSelect={handleDateReceivedChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {file.date_received 
                          ? new Date(file.date_received).toLocaleDateString()
                          : 'Not set'
                        }
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDateReceived(true)}
                        disabled={savingDateReceived}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Last Changed</label>
                <div className="mt-1">
                  {editingStatusDate ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !file.date_status_change && "text-muted-foreground"
                          )}
                          disabled={savingStatusDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {file.date_status_change 
                            ? format(new Date(file.date_status_change), "PPP") 
                            : "Pick a date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={file.date_status_change ? new Date(file.date_status_change) : undefined}
                          onSelect={handleStatusDateChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {file.date_status_change 
                          ? (() => {
                              const d = new Date(file.date_status_change);
                              return !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Not set';
                            })()
                          : 'Not set'
                        }
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStatusDate(true)}
                        disabled={savingStatusDate}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
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

      {/* File Attachments */}
      <FileAttachmentsManager fileId={file.id} />
    </div>
  );
}