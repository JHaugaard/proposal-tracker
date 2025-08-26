import React from 'react';
import { FileText, FileImage, File, FileSpreadsheet, FileCode } from 'lucide-react';

export const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return React.createElement(FileText, { className: "h-8 w-8 text-red-600" });
    case 'doc':
    case 'docx':
      return React.createElement(FileText, { className: "h-8 w-8 text-blue-600" });
    case 'xls':
    case 'xlsx':
      return React.createElement(FileSpreadsheet, { className: "h-8 w-8 text-green-600" });
    case 'txt':
    case 'md':
      return React.createElement(FileCode, { className: "h-8 w-8 text-gray-600" });
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return React.createElement(FileImage, { className: "h-8 w-8 text-purple-600" });
    default:
      return React.createElement(File, { className: "h-8 w-8 text-gray-500" });
  }
};

export const getFileTypeLabel = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'PDF Document';
    case 'doc':
    case 'docx':
      return 'Word Document';
    case 'xls':
    case 'xlsx':
      return 'Excel Spreadsheet';
    case 'txt':
      return 'Text File';
    case 'md':
      return 'Markdown File';
    default:
      return 'File';
  }
};

export const isValidFileType = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'md'];
  return allowedExtensions.includes(extension || '');
};

export const getMaxFileSize = () => 25 * 1024 * 1024; // 25MB
export const getMaxFiles = () => 4;