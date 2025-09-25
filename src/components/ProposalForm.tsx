import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { usePIs, useSponsors } from '@/hooks/useProposalData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { FileRecord } from '@/hooks/useFiles';

const proposalFormSchema = z.object({
  db_no: z.string().min(1, 'DB No. is required'),
  pi_id: z.string().min(1, 'PI is required'),
  sponsor_id: z.string().min(1, 'Sponsor is required'),
  cayuse: z.string().optional(),
  status: z.enum(['In', 'Pending', 'Pending Signatures', 'Process', 'Done', 'On Hold', 'Withdrawn']),
  date_received: z.date({ required_error: 'Date received is required' }),
  notes: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

const statusOptions = [
  'In',
  'Pending', 
  'Pending Signatures',
  'Process',
  'Done',
  'On Hold',
  'Withdrawn'
] as const;

interface ProposalFormProps {
  onSuccess?: () => void;
  editingFile?: FileRecord | null;
}

export function ProposalForm({ onSuccess, editingFile }: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pis, createPI } = usePIs();
  const { sponsors, createSponsor } = useSponsors();
  const isEditing = !!editingFile;

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      status: 'In',
      cayuse: '',
      notes: '',
    },
  });

  // Load editing data when editingFile changes
  useEffect(() => {
    if (editingFile) {
      // Normalize status to ensure it matches our options
      const normalizedStatus = statusOptions.includes(editingFile.status as any) 
        ? editingFile.status 
        : 'In';
      
      form.reset({
        db_no: editingFile.db_no,
        pi_id: editingFile.pi_id,
        sponsor_id: editingFile.sponsor_id,
        status: normalizedStatus,
        cayuse: editingFile.cayuse || '',
        notes: editingFile.notes || '',
        date_received: editingFile.date_received ? new Date(editingFile.date_received) : undefined,
      });
    } else {
      form.reset({
        status: 'In',
        cayuse: '',
        notes: '',
      });
    }
  }, [editingFile, form]);

  const handleCreatePI = async (name: string) => {
    console.log('Creating PI:', name);
    try {
      const newPI = await createPI(name);
      if (newPI) {
        form.setValue('pi_id', newPI.id);
        toast.success(`PI "${name}" created successfully`);
        console.log('PI created successfully:', newPI);
      } else {
        console.log('Failed to create PI - no return value');
        toast.error('Failed to create PI');
      }
    } catch (error) {
      console.error('Error creating PI:', error);
      toast.error('Failed to create PI');
    }
  };

  const handleCreateSponsor = async (name: string) => {
    console.log('Creating Sponsor:', name);
    try {
      const newSponsor = await createSponsor(name);
      if (newSponsor) {
        form.setValue('sponsor_id', newSponsor.id);
        toast.success(`Sponsor "${name}" created successfully`);
        console.log('Sponsor created successfully:', newSponsor);
      } else {
        console.log('Failed to create Sponsor - no return value');
        toast.error('Failed to create sponsor');
      }
    } catch (error) {
      console.error('Error creating sponsor:', error);
      toast.error('Failed to create sponsor');
    }
  };

  const onSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && editingFile) {
        // Update existing proposal
        const statusChanged = data.status !== editingFile.status;
        const updateData: any = {
          db_no: data.db_no,
          pi_id: data.pi_id,
          sponsor_id: data.sponsor_id,
          cayuse: data.cayuse || null,
          status: data.status,
          date_received: format(data.date_received, 'yyyy-MM-dd'),
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        };

        // Only update date_status_change if status actually changed
        if (statusChanged) {
          updateData.date_status_change = new Date().toISOString();
        }

        const { error } = await supabase
          .from('files')
          .update(updateData)
          .eq('id', editingFile.id);

        if (error) throw error;
        toast.success('Proposal updated successfully!');
      } else {
        // Create new proposal
        const { error } = await supabase
          .from('files')
          .insert([{
            db_no: data.db_no,
            pi_id: data.pi_id,
            sponsor_id: data.sponsor_id,
            cayuse: data.cayuse || null,
            status: data.status,
            date_received: format(data.date_received, 'yyyy-MM-dd'),
            notes: data.notes || null,
            date_status_change: new Date().toISOString(),
          }]);

        if (error) throw error;
        toast.success('Proposal created successfully!');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      if (error?.code === '23505') {
        toast.error('A proposal with this DB No. already exists');
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} proposal. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditing && editingFile) {
      // Reset to editing values
      form.reset({
        db_no: editingFile.db_no,
        pi_id: editingFile.pi_id,
        sponsor_id: editingFile.sponsor_id,
        status: editingFile.status,
        cayuse: editingFile.cayuse || '',
        notes: editingFile.notes || '',
        date_received: editingFile.date_received ? new Date(editingFile.date_received) : undefined,
      });
    } else {
      // Reset to empty form
      form.reset({
        status: 'In',
        cayuse: '',
        notes: '',
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Proposal' : 'Add New Proposal'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the proposal details below. Required fields are marked with *.'
            : 'Enter the details for a new proposal. Required fields are marked with *.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db_no">DB No. *</Label>
              <Input
                id="db_no"
                {...form.register('db_no', {
                  setValueAs: (value) => {
                    // Strip "DB " prefix if present (case insensitive)
                    if (typeof value === 'string' && value.toUpperCase().startsWith('DB ')) {
                      return value.substring(3).trim();
                    }
                    return value;
                  }
                })}
                placeholder="e.g., 1001"
                className={form.formState.errors.db_no ? 'border-destructive' : ''}
              />
              {form.formState.errors.db_no && (
                <p className="text-sm text-destructive">{form.formState.errors.db_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Principal Investigator *</Label>
              <AutocompleteInput
                items={pis}
                value={form.watch('pi_id')}
                onSelect={(value) => form.setValue('pi_id', value)}
                onCreate={handleCreatePI}
                placeholder="Select or create PI"
                createLabel="Create PI"
                className={form.formState.errors.pi_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.pi_id && (
                <p className="text-sm text-destructive">{form.formState.errors.pi_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Sponsor *</Label>
              <AutocompleteInput
                items={sponsors}
                value={form.watch('sponsor_id')}
                onSelect={(value) => form.setValue('sponsor_id', value)}
                onCreate={handleCreateSponsor}
                placeholder="Select or create sponsor"
                createLabel="Create Sponsor"
                className={form.formState.errors.sponsor_id ? 'border-destructive' : ''}
              />
              {form.formState.errors.sponsor_id && (
                <p className="text-sm text-destructive">{form.formState.errors.sponsor_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cayuse">Cayuse</Label>
              <Input
                id="cayuse"
                {...form.register('cayuse')}
                placeholder="Enter Cayuse reference"
              />
            </div>

            <div className="space-y-2">
              <Label>Date Received *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch('date_received') && "text-muted-foreground",
                      form.formState.errors.date_received && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('date_received') ? (
                      format(form.watch('date_received'), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch('date_received')}
                    onSelect={(date) => form.setValue('date_received', date!)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date_received && (
                <p className="text-sm text-destructive">{form.formState.errors.date_received.message}</p>
              )}
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Additional notes or comments"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Proposal'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              {isEditing ? 'Reset' : 'Clear Form'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}