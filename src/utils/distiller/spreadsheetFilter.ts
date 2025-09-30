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
  if (statusLower.includes('osraa')) return 'bg-blue-100 text-blue-800'; // OSRAA Review - blue
  if (statusLower.includes('review')) return 'bg-yellow-100 text-yellow-800'; // Out for Review - yellow
  if (statusLower.includes('requested')) return 'bg-indigo-100 text-indigo-800'; // Requested - indigo
  if (statusLower.includes('signature')) return 'bg-purple-100 text-purple-800';
  if (statusLower.includes('process')) return 'bg-orange-100 text-orange-800';
  
  return 'bg-gray-100 text-gray-800';
}

export function getStatusColorForPrint(status: string): { bg: string; text: string } {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('completed')) return { bg: '#dcfce7', text: '#166534' };
  if (statusLower.includes('osraa')) return { bg: '#dbeafe', text: '#1e40af' }; // OSRAA Review - blue
  if (statusLower.includes('review')) return { bg: '#fef9c3', text: '#854d0e' }; // Out for Review - yellow
  if (statusLower.includes('requested')) return { bg: '#e0e7ff', text: '#3730a3' }; // Requested - indigo
  if (statusLower.includes('signature')) return { bg: '#f3e8ff', text: '#6b21a8' };
  if (statusLower.includes('process')) return { bg: '#fed7aa', text: '#9a3412' };
  
  return { bg: '#f3f4f6', text: '#374151' };
}