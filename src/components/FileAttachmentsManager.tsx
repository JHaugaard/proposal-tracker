import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { useFileAttachments, FileAttachment } from '@/hooks/useFileAttachments';

interface FileAttachmentsManagerProps {
  fileId: string;
  readOnly?: boolean;
}

export function FileAttachmentsManager({ fileId, readOnly = false }: FileAttachmentsManagerProps) {
  const { attachments, loading, uploadFile, deleteAttachment, downloadFile } = useFileAttachments(fileId);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (attachments.length + files.length > 2) {
      alert('Maximum 2 files allowed per proposal.');
      return;
    }

    for (const file of Array.from(files)) {
      // Check file type (PDF only)
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF file. Only PDF files are allowed.`);
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`);
        continue;
      }

      await uploadFile(file);
    }

    // Clear the input
    event.target.value = '';
  }, [attachments.length, uploadFile]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Attachments
        </CardTitle>
        <CardDescription>
          Upload PDF documents related to this proposal (max 2 files, 10MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        {!readOnly && attachments.length < 2 && (
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop PDF files here or click to browse
            </p>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose Files
            </Button>
          </div>
        )}

        {/* Attachments list */}
        <div className="space-y-3">
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading attachments...</p>
            </div>
          )}
          
          {!loading && attachments.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No files attached</p>
            </div>
          )}

          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-medium text-sm">{attachment.filename}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(attachment)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {!readOnly && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{attachment.filename}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAttachment(attachment)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}