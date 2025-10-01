import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileRecord } from '@/hooks/useFiles';
import { format } from 'date-fns';

export function generateProposalsPDF(
  files: FileRecord[],
  statusFilter: string,
  totalCount: number
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text('Proposals Report', 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Filter: ${statusFilter}`, 14, 30);
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 14, 37);
  doc.text(`Total Proposals: ${totalCount}`, 14, 44);
  
  // Prepare table data
  const tableData = files.map(file => [
    file.db_no || '-',
    file.pi_name || '-',
    file.sponsor_name || '-',
    file.status || '-',
    file.date_received ? format(new Date(file.date_received), 'MM/dd/yyyy') : '-',
    file.date_status_change ? format(new Date(file.date_status_change), 'MM/dd/yyyy') : '-',
  ]);
  
  // Generate table
  autoTable(doc, {
    startY: 50,
    head: [['DB No.', 'PI', 'Sponsor', 'Status', 'Date Received', 'Status Changed']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 50, left: 14, right: 14 },
  });
  
  // Open in new tab
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
