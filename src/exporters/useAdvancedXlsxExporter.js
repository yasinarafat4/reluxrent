import { useDataProvider, useResourceContext } from 'react-admin';
import * as XLSX from 'xlsx';
import { fetchAllRecords } from './fetchAllRecords';

export const useAdvancedXlsxExporter = (config = {}) => {
  const dataProvider = useDataProvider();
  const resource = useResourceContext();

  return async (records, fetchRelated, selectedIds) => {
    let finalData = records;

    // 1️⃣ Export only selected rows if selectedIds provided
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      finalData = records.filter((r) => selectedIds.includes(r.id));
    }
    // 2️⃣ Export all records if no selection and exportAll is true
    else if (config.exportAll) {
      finalData = await fetchAllRecords(dataProvider, resource);
    }

    if (!finalData || finalData.length === 0) return;

    // --- Sorting ---
    if (config.sortBy) {
      if (typeof config.sortBy === 'function') {
        finalData.sort(config.sortBy);
      } else if (typeof config.sortBy === 'string') {
        finalData.sort((a, b) => {
          const ka = a[config.sortBy] ?? '';
          const kb = b[config.sortBy] ?? '';
          return String(ka).localeCompare(String(kb), undefined, { numeric: true });
        });
      }
    }

    // --- Columns & order ---
    const keys = config.order || Object.keys(finalData[0]);
    const ignore = config.ignore || [];
    const columns = keys.filter((k) => !ignore.includes(k));

    // --- Numeric columns detection from config.format ---
    const numericColumns = config.format ? Object.keys(config.format) : [];

    const flatten = config.flatten || {};

    // --- Prepare data with formatting ---
    const dataFormatted = finalData.map((row) => {
      const formatted = {};
      columns.forEach((col) => {
        let val = row[col];

        // Use flatten function if provided
        if (flatten[col]) {
          val = flatten[col](val);
        }

        // Convert numeric strings to numbers
        if (numericColumns.includes(col)) {
          val = Number(val);
          if (isNaN(val)) val = 0;
        }

    

        // Date formatting
        if (val instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(val)) {
          val = new Date(val).toLocaleDateString('en-GB');
        }

        formatted[col] = val ?? '';
      });
      return formatted;
    });

    // --- Worksheet ---
    const worksheet = XLSX.utils.json_to_sheet(dataFormatted, { header: columns });

    // --- Custom headers ---
    if (config.headers) {
      columns.forEach((col, i) => {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: i })];
        if (cell) cell.v = config.headers[col] || col;
      });
    }

    // --- Number formatting ---
    if (config.format) {
      Object.keys(config.format).forEach((colName) => {
        const colIndex = columns.indexOf(colName);
        if (colIndex < 0) return;
        for (let row = 1; row <= dataFormatted.length; row++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: colIndex })];
          if (cell) cell.z = config.format[colName];
        }
      });
    }

    // --- Auto column width ---
    const colWidths = columns.map((col) => {
      const maxLen = Math.max(config.headers?.[col]?.length || col.length, ...dataFormatted.map((r) => (r[col] ? r[col].toString().length : 0)));
      return { wch: maxLen + 2 };
    });
    worksheet['!cols'] = colWidths;

    // --- Apply custom column widths ---
    if (config.columnWidths) {
      Object.entries(config.columnWidths).forEach(([field, width]) => {
        const colIndex = columns.indexOf(field);
        if (colIndex >= 0 && worksheet['!cols'][colIndex]) {
          worksheet['!cols'][colIndex].wch = width;
        }
      });
    }

    // --- Example Formula ---
    const lastRow = dataFormatted.length + 1;
    worksheet['Z1'] = { t: 's', v: 'Total Rows' };
    worksheet['Z2'] = { t: 'n', f: `COUNTA(A2:A${lastRow})` };

    // --- Build workbook ---
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, resource);

    // --- Save XLSX ---
    XLSX.writeFile(workbook, `${resource}.xlsx`);
  };
};
