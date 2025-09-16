import { ProposalRecord } from './spreadsheetProcessor';

export interface FilterOptions {
  selectedStatuses: string[];
  userLastName?: string;
}

export function filterRecords(records: ProposalRecord[], options: FilterOptions): ProposalRecord[] {
  let filtered = records;
  
  // Filter by status
  if (options.selectedStatuses.length > 0) {
    filtered = filtered.filter(record => 
      options.selectedStatuses.some(status => 
        record.status.toLowerCase().includes(status.toLowerCase())
      )
    );
  }
  
  // Filter by PI last name if provided
  if (options.userLastName) {
    filtered = filtered.filter(record =>
      record.pi_name.toLowerCase().includes(options.userLastName!.toLowerCase())
    );
  }
  
  return filtered;
}

export function getUniqueStatuses(records: ProposalRecord[]): string[] {
  const statuses = new Set(records.map(record => record.status).filter(Boolean));
  return Array.from(statuses).sort();
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('completed')) return 'bg-green-100 text-green-800';
  if (statusLower.includes('review')) return 'bg-yellow-100 text-yellow-800';
  if (statusLower.includes('requested')) return 'bg-blue-100 text-blue-800';
  if (statusLower.includes('signature')) return 'bg-purple-100 text-purple-800';
  if (statusLower.includes('process')) return 'bg-orange-100 text-orange-800';
  
  return 'bg-gray-100 text-gray-800';
}