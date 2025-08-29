import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataImport } from '@/hooks/useDataImport';
import { Upload, CheckCircle, AlertCircle, FileText, Users, Building } from 'lucide-react';

const ImportData = () => {
  const {
    step,
    setStep,
    uploadFiles,
    validationResults,
    importProgress,
    importResults,
    executeImport,
    resetImport,
    isDryRun,
    setIsDryRun
  } = useDataImport();

  const [files, setFiles] = useState<{
    pis?: File;
    sponsors?: File;
    files?: File;
  }>({});

  const handleFileUpload = (type: 'pis' | 'sponsors' | 'files') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleUploadAndValidate = async () => {
    if (!files.pis || !files.sponsors || !files.files) {
      return;
    }
    
    await uploadFiles(files.pis, files.sponsors, files.files);
    setStep(2);
  };

  const handleExecuteImport = async () => {
    await executeImport();
    setStep(4);
  };

  const canProceedToValidation = files.pis && files.sponsors && files.files;
  const canProceedToImport = validationResults && validationResults.errors.length === 0;

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Import Legacy Data</h1>
          <p className="text-muted-foreground">
            Import your cleaned CSV files for PIs, Sponsors, and Files
          </p>
        </div>

        <div className="mb-6">
          <Progress value={(step / 4) * 100} className="w-full" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Upload Files</span>
            <span>Validate Data</span>
            <span>Import</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step 1: Upload Files */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV Files
              </CardTitle>
              <CardDescription>
                Upload your three cleaned CSV files. Make sure they follow the expected format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pis-file" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    PIs File (pis.csv)
                  </Label>
                  <Input
                    id="pis-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload('pis')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected columns: name, db_no
                  </p>
                  {files.pis && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {files.pis.name}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sponsors-file" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Sponsors File (sponsors.csv)
                  </Label>
                  <Input
                    id="sponsors-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload('sponsors')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected columns: sponsor, db_no
                  </p>
                  {files.sponsors && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {files.sponsors.name}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files-file" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Files Data (files.csv)
                  </Label>
                  <Input
                    id="files-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload('files')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected columns: db_no, status, pi_name, sponsor_name, cayuse, date_received, date_status_change, notes, to_set_up, external_link
                  </p>
                  {files.files && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {files.files.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUploadAndValidate}
                  disabled={!canProceedToValidation}
                >
                  Upload and Validate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Validation Results */}
        {step === 2 && validationResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResults.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Validation Results
              </CardTitle>
              <CardDescription>
                Review the validation results before proceeding with the import.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResults.stats.pisToCreate}
                    </div>
                    <div className="text-sm text-muted-foreground">PIs to create</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationResults.stats.sponsorsToCreate}
                    </div>
                    <div className="text-sm text-muted-foreground">Sponsors to create</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {validationResults.stats.filesToCreate}
                    </div>
                    <div className="text-sm text-muted-foreground">Files to import</div>
                  </CardContent>
                </Card>
              </div>

              {validationResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Found {validationResults.errors.length} validation errors. Please fix these before proceeding.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  {validationResults.errors.length > 0 && (
                    <TabsTrigger value="errors">Errors ({validationResults.errors.length})</TabsTrigger>
                  )}
                  {validationResults.warnings.length > 0 && (
                    <TabsTrigger value="warnings">Warnings ({validationResults.warnings.length})</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    The validation process has analyzed your data and is ready to proceed.
                  </div>
                </TabsContent>

                {validationResults.errors.length > 0 && (
                  <TabsContent value="errors">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>{error.field}</TableCell>
                            <TableCell>{error.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                )}

                {validationResults.warnings.length > 0 && (
                  <TabsContent value="warnings">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Warning</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.warnings.map((warning, index) => (
                          <TableRow key={index}>
                            <TableCell>{warning.row}</TableCell>
                            <TableCell>{warning.field}</TableCell>
                            <TableCell>{warning.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                )}
              </Tabs>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Upload
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!canProceedToImport}
                >
                  Proceed to Import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Import Execution */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Execute Import</CardTitle>
              <CardDescription>
                Ready to import your data. This will create records in your database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will create {validationResults?.stats.pisToCreate} PIs, {validationResults?.stats.sponsorsToCreate} sponsors, 
                  and {validationResults?.stats.filesToCreate} file records in your database.
                </AlertDescription>
              </Alert>

              {importProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{importProgress.stage}</span>
                    <span>{importProgress.current}/{importProgress.total}</span>
                  </div>
                  <Progress value={(importProgress.current / importProgress.total) * 100} />
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back to Validation
                </Button>
                <Button 
                  onClick={executeImport}
                  disabled={!!importProgress}
                >
                  {importProgress ? 'Importing...' : 'Execute Import'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Import Results */}
        {step === 4 && importResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Import Complete
              </CardTitle>
              <CardDescription>
                Your data has been successfully imported.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.pisCreated}
                    </div>
                    <div className="text-sm text-muted-foreground">PIs created</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResults.sponsorsCreated}
                    </div>
                    <div className="text-sm text-muted-foreground">Sponsors created</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {importResults.filesCreated}
                    </div>
                    <div className="text-sm text-muted-foreground">Files imported</div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed successfully! You can now view your imported data in the Proposals section.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetImport}>
                  Import More Data
                </Button>
                <Button onClick={() => window.location.href = '/proposals'}>
                  View Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ImportData;