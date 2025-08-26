import { useCallback, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Download, Trash2, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { getFileIcon, getFileTypeLabel, isValidFileType, getMaxFileSize, getMaxFiles } from '@/utils/fileUtils';
import { cn } from '@/lib/utils';

interface FileAttachmentsManagerProps {
  fileId: string;
  readOnly?: boolean;
}

export function FileAttachmentsManager({ fileId, readOnly = false }: FileAttachmentsManagerProps) {
  const { attachments, loading, uploadProgress, uploadFile, deleteAttachment, downloadFile } = useFileAttachments(fileId);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (attachments.length + fileArray.length > getMaxFiles()) {
      alert(`Maximum ${getMaxFiles()} files allowed per proposal.`);
      return;
    }

    for (const file of fileArray) {
      // Check file type
      if (!isValidFileType(file.name)) {
        alert(`${file.name} is not a supported file type. Allowed: PDF, Word, Excel, TXT, MD files.`);
        continue;
      }

      // Check file size
      if (file.size > getMaxFileSize()) {
        alert(`${file.name} is too large. Maximum file size is ${Math.round(getMaxFileSize() / (1024 * 1024))}MB.`);
        continue;
      }

      await uploadFile(file);
    }
  }, [attachments.length, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (readOnly) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload, readOnly]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) {
      setIsDragActive(true);
    }
  }, [readOnly]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          File Attachments
          {attachments.length > 0 && (
            <Badge variant="secondary">{attachments.length}/{getMaxFiles()}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Upload documents related to this proposal (PDF, Word, Excel, TXT, MD files - max {getMaxFiles()} files, {Math.round(getMaxFileSize() / (1024 * 1024))}MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        {!readOnly && attachments.length < getMaxFiles() && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragActive 
                ? "border-primary bg-primary/10" 
                : "border-muted hover:border-muted-foreground/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className={cn(
              "h-8 w-8 mx-auto mb-2",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-sm text-muted-foreground mb-2">
              {isDragActive 
                ? "Drop files here..." 
                : "Drop files here or click to browse"
              }
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Supported: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), Text (.txt), Markdown (.md)
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
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

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Uploading...</h4>
            {uploadProgress.map((progress) => (
              <div key={progress.fileName} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{progress.fileName}</span>
                  <div className="flex items-center gap-2">
                    {progress.status === 'uploading' && (
                      <span className="text-muted-foreground">{Math.round(progress.progress)}%</span>
                    )}
                    {progress.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {progress.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={progress.progress} 
                  className={cn(
                    "h-2",
                    progress.status === 'error' && "bg-red-100"
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Attachments list */}
        <div className="space-y-3">
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading attachments...</p>
            </div>
          )}
          
          {!loading && attachments.length === 0 && uploadProgress.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No files attached</p>
            </div>
          )}

          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.filename)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{attachment.filename}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getFileTypeLabel(attachment.filename)}</span>
                    <span>•</span>
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
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
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {!readOnly && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" title="Delete file">
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

        {/* Storage info */}
        {!readOnly && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Storage: {attachments.length}/{getMaxFiles()} files used</p>
            <p>Total size: {formatFileSize(attachments.reduce((sum, file) => sum + file.file_size, 0))}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}