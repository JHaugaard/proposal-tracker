import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProposalRecord } from '@/utils/distiller/spreadsheetProcessor';
import { getStatusColor } from '@/utils/distiller/spreadsheetFilter';

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
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-sm">{record.db_no}</td>
                  <td className="p-2 text-sm">{record.date_received || '-'}</td>
                  <td className="p-2">{record.pi_name}</td>
                  <td className="p-2">{record.sponsor_name}</td>
                  <td className="p-2 text-sm">{record.cayuse || '-'}</td>
                  <td className="p-2">
                    <Badge variant="secondary" className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">{record.status_date || '-'}</td>
                  <td className="p-2 text-sm">{record.old_db || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}