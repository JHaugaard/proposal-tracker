import { ProposalRecord } from './spreadsheetProcessor';

export interface FilterOptions {
  selectedStatuses: string[];
}

export function filterRecords(records: ProposalRecord[], options: FilterOptions): ProposalRecord[] {
  let filtered = records;
  
  // First filter by GCO/GCA/SCCO (hard-coded to "Haugaard")
  filtered = filtered.filter(record =>
    record.gco_gca_scco === "Haugaard"
  );
  
  // Then filter by status (exact match only)
  if (options.selectedStatuses.length > 0) {
    filtered = filtered.filter(record => 
      options.selectedStatuses.includes(record.status)
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