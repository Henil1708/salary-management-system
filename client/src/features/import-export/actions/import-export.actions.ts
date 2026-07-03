import { EmployeeListQuery } from '@salary/shared';
import { AppThunk } from '@/app/store/types';
import { fetchEmployees } from '@/features/employees';
import { ImportExportService, ImportResult } from '../services/import-export.service';

// Import returns the summary to the dialog and refreshes the directory so new
// rows appear. Rethrows on failure so the dialog can show the error.
export const runImport =
  (file: File): AppThunk<Promise<ImportResult>> =>
  async (dispatch) => {
    const result = await ImportExportService.importCsv(file);
    void dispatch(fetchEmployees());
    return result;
  };

// Fire-and-forget file save (the documented blob exception to
// "components dispatch thunks" — there's no state worth storing).
export const downloadExport =
  (query: EmployeeListQuery): AppThunk<Promise<void>> =>
  async () => {
    const blob = await ImportExportService.exportCsv(query);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };
