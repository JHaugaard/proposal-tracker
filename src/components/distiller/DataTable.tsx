import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalRecord } from '@/utils/distiller/spreadsheetProcessor';
import { getStatusColor } from '@/utils/distiller/spreadsheetFilter';

// Helper function to format dates for display (now simplified since formatDate already returns MM/DD/YYYY)
function formatDisplayDate(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  
  // If it's already formatted properly, return it
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return dateString;
  }
  
  // Try to parse and reformat if needed
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US');
  }
  
  return dateString;
}

interface DataTableProps {
  records: ProposalRecord[];
  totalRecords: number;
  isLoading?: boolean;
}

export function DataTable({ records, totalRecords, isLoading }: DataTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Processing Excel file...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No records match the selected filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-table-container>
    <Card>
      <CardHeader>
        <CardTitle>
          Filtered Results ({records.length} of {totalRecords} records)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">ID</th>
                <th className="text-left p-2 font-medium">Date Received</th>
                <th className="text-left p-2 font-medium">Principal Investigator</th>
                <th className="text-left p-2 font-medium">Sponsor/Contractor</th>
                <th className="text-left p-2 font-medium">Cayuse ID</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Status Date</th>
                <th className="text-left p-2 font-medium">Old DB#</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="px-2 py-1 font-mono text-sm">{record.db_no}</td>
                  <td className="px-2 py-1 text-sm">{formatDisplayDate(record.date_received) || '-'}</td>
                  <td className="px-2 py-1">{record.pi_name}</td>
                  <td className="px-2 py-1">{record.sponsor_name}</td>
                  <td className="px-2 py-1 text-sm">{record.cayuse || '-'}</td>
                  <td className="px-2 py-1">
                    <Badge variant="secondary" className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-1 text-sm">{formatDisplayDate(record.status_date) || '-'}</td>
                  <td className="px-2 py-1 text-sm">{record.old_db || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}