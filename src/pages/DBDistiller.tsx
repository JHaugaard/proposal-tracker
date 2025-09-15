import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileSpreadsheet, Filter, Printer } from 'lucide-react';

export default function DBDistiller() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'OSRAA Review',
    'Internal Docs/Info Requested',
    'External Docs/Info Requested',
    'Out for Review',
    'Out for Signature'
  ]);

  const statuses = [
    'OSRAA Review',
    'Internal Docs/Info Requested',
    'External Docs/Info Requested',
    'Out for Review',
    'Out for Signature',
    'Set-up in Process',
    'Completed'
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handleSelectAll = () => {
    setSelectedStatuses([...statuses]);
  };

  const handleClearAll = () => {
    setSelectedStatuses([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ACT Database Distiller</h1>
          <h2 className="text-xl text-muted-foreground">FY 2026 Sponsored Agreements Database</h2>
          <p className="text-sm text-muted-foreground">
            Drop in the FY26 Sponsored Agreements DB as an Excel Spreadsheet. Choose the Statuses you want to show. Check/Uncheck to update.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                DB as Excel Spreadsheet
              </CardTitle>
              <CardDescription>
                Drop your FY26 Sponsored Agreements DataBase.xlsx file here or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drop your file here or click to browse
                </p>
                <Button variant="outline">
                  Select File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter by Status
              </CardTitle>
              <CardDescription>
                Select statuses to include when distilling the DB. ({selectedStatuses.length} of {statuses.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-3">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={status}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Filtered Results</CardTitle>
            <CardDescription>
              Your filtered spreadsheet data will appear here once a file is uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 mb-4" />
                <p>No spreadsheet loaded yet</p>
                <p className="text-sm">Upload an Excel file to see filtered results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            Re-upload Spreadsheet
          </Button>
        </div>
      </div>
    </div>
  );
}