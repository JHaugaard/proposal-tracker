import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, RotateCcw } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { FileUpload } from '@/components/distiller/FileUpload';
import { StatusFilter } from '@/components/distiller/StatusFilter';
import { DataTable } from '@/components/distiller/DataTable';
import { useDistillerTimeout } from '@/hooks/useDistillerTimeout';

import { processExcelFile, ProcessedData, ProposalRecord } from '@/utils/distiller/spreadsheetProcessor';
import { filterRecords, getUniqueStatuses, getStatusColorForPrint } from '@/utils/distiller/spreadsheetFilter';

// Fixed 7 statuses based on UI requirements
const FIXED_STATUSES = [
  'OSRAA Review',
  'Out for Review',
  'Completed',
  'Internal Docs/Info Requested',
  'Out for Signature',
  'External Docs/Info Requested',
  'Set-Up in Process'
];

// Default selected statuses (5 out of 7 based on image)
const DEFAULT_SELECTED_STATUSES = [
  'OSRAA Review',
  'Out for Review',
  'Internal Docs/Info Requested',
  'Out for Signature',
  'External Docs/Info Requested'
];

export default function DBDistiller() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<ProposalRecord[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // 5-minute timeout functionality
  const handleTimeout = useCallback(() => {
    setProcessedData(null);
    setFilteredRecords([]);
    setAvailableStatuses([]);
    setSelectedStatuses([]);
    toast({
      title: "Session Expired",
      description: "Data has been cleared for security after 5 minutes of inactivity.",
      variant: "destructive"
    });
  }, [toast]);

  const { resetTimeout, clearTimeout: clearDistillerTimeout } = useDistillerTimeout(handleTimeout);

  // Filter records when criteria change
  useEffect(() => {
    if (processedData) {
      const filtered = filterRecords(processedData.records, {
        selectedStatuses
      });
      setFilteredRecords(filtered);
    }
  }, [processedData, selectedStatuses]);

  // Reset timeout when user interacts (separate effect)
  useEffect(() => {
    if (processedData) {
      resetTimeout();
    }
  }, [processedData, selectedStatuses, resetTimeout]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await processExcelFile(file);
      setProcessedData(data);
      
      // Use fixed 7 statuses instead of dynamic extraction
      setAvailableStatuses(FIXED_STATUSES);
      
      // Set default selected statuses
      setSelectedStatuses(DEFAULT_SELECTED_STATUSES);
      resetTimeout();
      
      toast({
        title: "File Processed Successfully",
        description: `Loaded ${data.totalRecords} records from Excel file`
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process Excel file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handleSelectAll = () => {
    setSelectedStatuses([...availableStatuses]);
  };

  const handleClearAll = () => {
    setSelectedStatuses([]);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableElement = document.querySelector('[data-table-container]');
    if (tableElement) {
      // Clone the table and add colored status badges
      const clonedTable = tableElement.cloneNode(true) as HTMLElement;
      
      // Find all table rows and target the Status column (index 5)
      const rows = clonedTable.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 5) {
          const statusCell = cells[5]; // Status column is the 6th column (index 5)
          const badge = statusCell.querySelector('span, div'); // Badge is typically a span or div
          
          if (badge) {
            const statusText = badge.textContent || '';
            const colors = getStatusColorForPrint(statusText);
            (badge as HTMLElement).style.backgroundColor = colors.bg;
            (badge as HTMLElement).style.color = colors.text;
            (badge as HTMLElement).style.padding = '2px 8px';
            (badge as HTMLElement).style.borderRadius = '12px';
            (badge as HTMLElement).style.fontSize = '12px';
            (badge as HTMLElement).style.fontWeight = '500';
          }
        }
      });
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Filtered Results - Database Distiller</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { padding: 2px 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; border-bottom: 1px solid #ddd; }
              td { border: none; }
              .badge { 
                display: inline-block; 
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 12px;
              }
              @media print {
                body { margin: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${clonedTable.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleReUpload = () => {
    setProcessedData(null);
    setFilteredRecords([]);
    setAvailableStatuses([]);
    setSelectedStatuses([]);
    clearDistillerTimeout();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Database Distiller</h1>
      </div>

      {!processedData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />

          {/* Placeholder for Status Filter */}
          <StatusFilter
            statuses={FIXED_STATUSES}
            selectedStatuses={DEFAULT_SELECTED_STATUSES}
            onStatusChange={() => {}}
            onSelectAll={() => {}}
            onClearAll={() => {}}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Info Section */}
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">File Loaded</h3>
              <p className="text-sm text-muted-foreground">
                {processedData.totalRecords} records processed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Loaded at: {new Date(processedData.processedAt).toLocaleString()}
              </p>
            </div>

            {/* Status Filter Section */}
            <StatusFilter
              statuses={FIXED_STATUSES}
              selectedStatuses={selectedStatuses}
              onStatusChange={handleStatusChange}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handlePrint}
              disabled={!processedData || filteredRecords.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleReUpload}
            >
              <RotateCcw className="h-4 w-4" />
              Re-upload Spreadsheet
            </Button>
          </div>

          {/* Data Table */}
          <DataTable 
            records={filteredRecords} 
            totalRecords={processedData.totalRecords}
            isLoading={isProcessing}
          />
        </>
      )}
    </div>
  );
}