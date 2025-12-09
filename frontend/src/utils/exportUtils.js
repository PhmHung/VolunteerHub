/**
 * @file exportUtils.js
 * @description Utilities for exporting data to CSV and JSON formats
 * @pattern Utility Module Pattern
 */

/**
 * Export data array to CSV file
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => headers.map(fieldName => {
      let value = row[fieldName];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle strings with commas, quotes, or newlines
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      // Handle objects/arrays (stringify them)
      if (typeof value === 'object') {
        value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(','))
  ].join('\n');

  // Create download link with BOM for Excel compatibility
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export data array to JSON file
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 */
export const exportToJSON = (data, filename) => {
  if (!data || !data.length) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
