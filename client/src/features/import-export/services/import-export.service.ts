import { EmployeeListQuery } from '@salary/shared';
import { apiClient } from '@/shared/services/api-client';

export interface ImportResult {
  imported: number;
  updated: number;
  unchanged: number;
  rejected: number;
  rejectedCsv: string | null;
}

const filteredExportParams = (query: EmployeeListQuery): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
};

export const ImportExportService = {
  importCsv: (file: File, lang = 'en') => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<ImportResult>(`/import/employees?lang=${lang}`, form);
  },
  // Blob download — the CSV file IS the response (no JSend envelope).
  exportCsv: (query: EmployeeListQuery) =>
    apiClient.getBlob(`/export/employees?${filteredExportParams(query)}`),
};
