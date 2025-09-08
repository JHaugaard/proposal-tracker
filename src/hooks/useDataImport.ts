import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

interface ValidationResults {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    pisToCreate: number;
    sponsorsToCreate: number;
    filesToCreate: number;
  };
}

interface ImportProgress {
  stage: string;
  current: number;
  total: number;
}

interface ImportResults {
  pisCreated: number;
  sponsorsCreated: number;
  filesCreated: number;
}

interface PIData {
  name: string;
  db_no: string;
}

interface SponsorData {
  sponsor: string;
  db_no: string;
}

interface FileData {
  db_no: string;
  status: string;
  pi_name: string;
  sponsor_name: string;
  cayuse: string;
  date_received: string;
  date_status_change: string;
  notes: string;
  to_set_up: string;
  external_link: string;
}

const VALID_STATUSES = ['In', 'Pending', 'Pending Signatures', 'Process', 'Done', 'On Hold', 'Withdrawn'];

// Normalize status values to handle common variations
function normalizeStatus(status: string): string {
  const trimmed = status.trim();
  // Map "Pending Signature" (singular) to "Pending Signatures" (plural)
  if (trimmed === 'Pending Signature') {
    return 'Pending Signatures';
  }
  return trimmed;
}

export function useDataImport() {
  const [step, setStep] = useState(1);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [isDryRun, setIsDryRun] = useState(true);
  const [parsedData, setParsedData] = useState<{
    pis: PIData[];
    sponsors: SponsorData[];
    files: FileData[];
  } | null>(null);
  const { toast } = useToast();

  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const normalizeString = (str: string): string => {
    return str?.trim().toLowerCase() || '';
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const validateData = async (pisData: PIData[], sponsorsData: SponsorData[], filesData: FileData[]): Promise<ValidationResults> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Create lookup maps for PIs and Sponsors
    const piNameMap = new Map<string, PIData[]>();
    const sponsorNameMap = new Map<string, SponsorData[]>();

    pisData.forEach(pi => {
      const normalizedName = normalizeString(pi.name);
      if (!piNameMap.has(normalizedName)) {
        piNameMap.set(normalizedName, []);
      }
      piNameMap.get(normalizedName)!.push(pi);
    });

    sponsorsData.forEach(sponsor => {
      const normalizedName = normalizeString(sponsor.sponsor);
      if (!sponsorNameMap.has(normalizedName)) {
        sponsorNameMap.set(normalizedName, []);
      }
      sponsorNameMap.get(normalizedName)!.push(sponsor);
    });

    // Validate files data
    filesData.forEach((file, index) => {
      const rowNum = index + 2; // Account for header row

      // Check required fields
      if (!file.db_no || file.db_no.trim() === '') {
        errors.push({
          row: rowNum,
          field: 'db_no',
          message: 'db_no is required'
        });
      }

      if (!file.status || file.status.trim() === '') {
        errors.push({
          row: rowNum,
          field: 'status',
          message: 'status is required'
        });
      } else {
        const normalizedStatus = normalizeStatus(file.status);
        if (!VALID_STATUSES.includes(normalizedStatus)) {
          errors.push({
            row: rowNum,
            field: 'status',
            message: `Invalid status: ${file.status}. Must be one of: ${VALID_STATUSES.join(', ')}`
          });
        }
        // Update the file status to the normalized version
        file.status = normalizedStatus;
      }

      // Check PI exists
      const normalizedPiName = normalizeString(file.pi_name);
      if (!piNameMap.has(normalizedPiName)) {
        errors.push({
          row: rowNum,
          field: 'pi_name',
          message: `PI not found: ${file.pi_name}`
        });
      }

      // Check Sponsor exists
      const normalizedSponsorName = normalizeString(file.sponsor_name);
      if (!sponsorNameMap.has(normalizedSponsorName)) {
        errors.push({
          row: rowNum,
          field: 'sponsor_name',
          message: `Sponsor not found: ${file.sponsor_name}`
        });
      }

      // Validate dates
      if (file.date_received && file.date_received.trim() !== '') {
        const date = parseDate(file.date_received);
        if (!date) {
          errors.push({
            row: rowNum,
            field: 'date_received',
            message: `Invalid date format: ${file.date_received}. Expected YYYY-MM-DD`
          });
        }
      }

      if (file.to_set_up && file.to_set_up.trim() !== '') {
        const date = parseDate(file.to_set_up);
        if (!date) {
          errors.push({
            row: rowNum,
            field: 'to_set_up',
            message: `Invalid date format: ${file.to_set_up}. Expected YYYY-MM-DD`
          });
        }
      }
    });

    // Calculate unique counts
    const uniquePiNames = new Set(pisData.map(pi => normalizeString(pi.name)));
    const uniqueSponsorNames = new Set(sponsorsData.map(sponsor => normalizeString(sponsor.sponsor)));

    return {
      errors,
      warnings,
      stats: {
        pisToCreate: uniquePiNames.size,
        sponsorsToCreate: uniqueSponsorNames.size,
        filesToCreate: filesData.length
      }
    };
  };

  const uploadFiles = async (pisFile: File, sponsorsFile: File, filesFile: File) => {
    try {
      setImportProgress({ stage: 'Parsing CSV files...', current: 0, total: 3 });

      const pisData = await parseCsvFile(pisFile) as PIData[];
      setImportProgress({ stage: 'Parsing CSV files...', current: 1, total: 3 });

      const sponsorsData = await parseCsvFile(sponsorsFile) as SponsorData[];
      setImportProgress({ stage: 'Parsing CSV files...', current: 2, total: 3 });

      const filesData = await parseCsvFile(filesFile) as FileData[];
      setImportProgress({ stage: 'Validating data...', current: 3, total: 3 });

      const results = await validateData(pisData, sponsorsData, filesData);
      setValidationResults(results);
      setParsedData({ pis: pisData, sponsors: sponsorsData, files: filesData });
      setImportProgress(null);

      if (results.errors.length === 0) {
        toast({
          title: "Validation Successful",
          description: `Ready to import ${results.stats.pisToCreate} PIs, ${results.stats.sponsorsToCreate} sponsors, and ${results.stats.filesToCreate} files.`,
        });
      } else {
        toast({
          title: "Validation Errors Found",
          description: `Found ${results.errors.length} errors that need to be fixed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during upload and validation:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
      setImportProgress(null);
    }
  };

  const executeImport = async (pisData: PIData[], sponsorsData: SponsorData[], filesData: FileData[]) => {
    if (!validationResults) return;

    try {
      let totalOperations = pisData.length + sponsorsData.length + filesData.length;
      let currentOperation = 0;

      // Create unique PI names mapping
      const uniquePis = new Map<string, PIData>();
      pisData.forEach(pi => {
        const normalizedName = normalizeString(pi.name);
        if (!uniquePis.has(normalizedName)) {
          uniquePis.set(normalizedName, pi);
        }
      });

      // Create unique Sponsor names mapping
      const uniqueSponsors = new Map<string, SponsorData>();
      sponsorsData.forEach(sponsor => {
        const normalizedName = normalizeString(sponsor.sponsor);
        if (!uniqueSponsors.has(normalizedName)) {
          uniqueSponsors.set(normalizedName, sponsor);
        }
      });

      setImportProgress({ stage: 'Creating PIs...', current: 0, total: totalOperations });

      // Upsert PIs
      const piInserts = Array.from(uniquePis.values()).map(pi => ({ name: pi.name }));
      const { data: createdPis, error: piError } = await supabase
        .from('pis')
        .upsert(piInserts, { onConflict: 'name', ignoreDuplicates: false })
        .select();

      if (piError) throw piError;
      currentOperation += piInserts.length;

      setImportProgress({ stage: 'Creating Sponsors...', current: currentOperation, total: totalOperations });

      // Upsert Sponsors
      const sponsorInserts = Array.from(uniqueSponsors.values()).map(sponsor => ({ name: sponsor.sponsor }));
      const { data: createdSponsors, error: sponsorError } = await supabase
        .from('sponsors')
        .upsert(sponsorInserts, { onConflict: 'name', ignoreDuplicates: false })
        .select();

      if (sponsorError) throw sponsorError;
      currentOperation += sponsorInserts.length;

      // Create lookup maps for IDs
      const piNameToId = new Map<string, string>();
      createdPis?.forEach(pi => {
        piNameToId.set(normalizeString(pi.name), pi.id);
      });

      const sponsorNameToId = new Map<string, string>();
      createdSponsors?.forEach(sponsor => {
        sponsorNameToId.set(normalizeString(sponsor.name), sponsor.id);
      });

      setImportProgress({ stage: 'Creating Files...', current: currentOperation, total: totalOperations });

      // Insert Files with normalized db_no (strip "DB " prefix)
      const fileInserts = filesData.map(file => {
        const piId = piNameToId.get(normalizeString(file.pi_name));
        const sponsorId = sponsorNameToId.get(normalizeString(file.sponsor_name));
        
        let normalizedDbNo = file.db_no;
        if (typeof normalizedDbNo === 'string' && normalizedDbNo.toUpperCase().startsWith('DB ')) {
          normalizedDbNo = normalizedDbNo.substring(3).trim();
        }

        return {
          db_no: normalizedDbNo,
          status: file.status as any,
          pi_id: piId,
          sponsor_id: sponsorId,
          cayuse: file.cayuse || null,
          date_received: parseDate(file.date_received)?.toISOString().split('T')[0] || null,
          notes: file.notes || null,
          to_set_up: parseDate(file.to_set_up)?.toISOString().split('T')[0] || null,
          external_link: file.external_link || null,
          date_status_change: new Date().toISOString() // Set current timestamp
        };
      });

      const { data: createdFiles, error: fileError } = await supabase
        .from('files')
        .upsert(fileInserts, { onConflict: 'db_no', ignoreDuplicates: false })
        .select();

      if (fileError) throw fileError;

      const results: ImportResults = {
        pisCreated: piInserts.length,
        sponsorsCreated: sponsorInserts.length,
        filesCreated: createdFiles?.length || 0
      };

      setImportResults(results);
      setImportProgress(null);

      toast({
        title: "Import Successful",
        description: `Created ${results.pisCreated} PIs, ${results.sponsorsCreated} sponsors, and ${results.filesCreated} files.`,
      });
    } catch (error) {
      console.error('Error during import:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
      setImportProgress(null);
    }
  };

  const executeImportWithData = async () => {
    if (!parsedData) return;
    await executeImport(parsedData.pis, parsedData.sponsors, parsedData.files);
  };

  const resetImport = () => {
    setStep(1);
    setValidationResults(null);
    setImportProgress(null);
    setImportResults(null);
    setParsedData(null);
  };

  return {
    step,
    setStep,
    uploadFiles,
    validationResults,
    importProgress,
    importResults,
    executeImport: executeImportWithData,
    resetImport,
    isDryRun,
    setIsDryRun
  };
}