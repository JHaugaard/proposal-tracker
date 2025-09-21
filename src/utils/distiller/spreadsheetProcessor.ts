import * as XLSX from 'xlsx';

export interface ProposalRecord {
  db_no: string;
  pi_name: string;
  sponsor_name: string;
  status: string;
  gco_gca_scco?: string;
  date_received?: string;
  to_set_up?: string;
  cayuse?: string;
  notes?: string;
  status_date?: string;
  old_db?: string;
}

export interface ProcessedData {
  records: ProposalRecord[];
  totalRecords: number;
  processedAt: string;
  headers: string[];
}

// Column mapping for different possible Excel headers
const COLUMN_MAPPINGS = {
  db_no: ['db_no', 'db no', 'database number', 'db#', 'proposal number', 'id'],
  pi_name: ['pi_name', 'pi name', 'principal investigator', 'pi', 'investigator'],
  sponsor_name: ['sponsor_name', 'sponsor name', 'sponsor', 'funding agency', 'sponsor/contractor'],
  status: ['status', 'proposal status', 'current status'],
  gco_gca_scco: ['gco/gca/scco', 'gco', 'gca', 'scco', 'gco gca scco', 'gco_gca_scco'],
  date_received: ['date_received', 'date received', 'received date', 'submission date'],
  to_set_up: ['to_set_up', 'to set up', 'setup date', 'due date'],
  cayuse: ['cayuse', 'cayuse number', 'cayuse id'],
  notes: ['notes', 'comments', 'remarks'],
  status_date: ['status_date', 'status date', 'date status', 'status changed'],
  old_db: ['old_db', 'old db', 'old database', 'old db#', 'previous db']
};

export function processExcelFile(file: File): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          throw new Error('No data found in Excel file');
        }
        
        // Get headers from first row
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1);
        
        // Create column mapping
        const columnMap = createColumnMapping(headers);
        
        // Log column mapping for debugging
        console.log('Column mapping detected:', columnMap);
        console.log('Headers found:', headers);
        console.log('Date Received column found at index:', columnMap.date_received);
        console.log('Status Date column found at index:', columnMap.status_date);
        
        // Process each row
        const records: ProposalRecord[] = dataRows
          .filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row: any[], index: number) => {
            const record: ProposalRecord = {
              db_no: getCellValue(row, columnMap.db_no) || '',
              pi_name: getCellValue(row, columnMap.pi_name) || '',
              sponsor_name: getCellValue(row, columnMap.sponsor_name) || '',
              status: getCellValue(row, columnMap.status) || '',
              gco_gca_scco: getCellValue(row, columnMap.gco_gca_scco),
              date_received: formatDate(getCellValue(row, columnMap.date_received)),
              to_set_up: formatDate(getCellValue(row, columnMap.to_set_up)),
              cayuse: getCellValue(row, columnMap.cayuse),
              notes: getCellValue(row, columnMap.notes),
              status_date: formatDate(getCellValue(row, columnMap.status_date)),
              old_db: getCellValue(row, columnMap.old_db)
            };
            
            // Debug first few records
            if (index < 3) {
              console.log('Raw date values for record', index + 1, ':', {
                date_received_raw: getCellValue(row, columnMap.date_received),
                status_date_raw: getCellValue(row, columnMap.status_date),
                date_received_formatted: record.date_received,
                status_date_formatted: record.status_date
              });
            }
            
            return record;
          })
          .filter(record => record.db_no || record.pi_name || record.sponsor_name); // Filter out completely empty rows
        
        resolve({
          records,
          totalRecords: records.length,
          processedAt: new Date().toISOString(),
          headers
        });
        
      } catch (error) {
        reject(new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function createColumnMapping(headers: string[]): Record<string, number | null> {
  const mapping: Record<string, number | null> = {};
  
  Object.entries(COLUMN_MAPPINGS).forEach(([key, possibleNames]) => {
    mapping[key] = null;
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase().trim();
      if (header && possibleNames.some(name => header.includes(name.toLowerCase()))) {
        mapping[key] = i;
        break;
      }
    }
  });
  
  return mapping;
}

function getCellValue(row: any[], columnIndex: number | null): string | undefined {
  if (columnIndex === null || columnIndex >= row.length) return undefined;
  
  const value = row[columnIndex];
  if (value === null || value === undefined || value === '') return undefined;
  
  return value.toString().trim();
}

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  
  // Check if it's an Excel serial number (numeric)
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue) && numericValue > 25000 && numericValue < 50000) {
    // Excel date serial number (days since 1/1/1900)
    const excelDate = new Date((numericValue - 25569) * 86400 * 1000);
    if (!isNaN(excelDate.getTime())) {
      return excelDate.toLocaleDateString('en-US'); // Returns MM/DD/YYYY format
    }
  }
  
  // Try to parse as a regular date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US'); // Returns MM/DD/YYYY format
  }
  
  // If it's already in a readable format, return as is
  return value;
}