/**
 * Parses a date string in DD.MM.YYYY format to a JS Date object.
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Handle cases where Google Sheets sends a full ISO string or other formats
  if (dateStr.includes('-')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
  }

  const parts = dateStr.trim().split('.');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Adds days to a Date object.
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Formats a Date object back to DD.MM.YYYY string.
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Extracts a string representation from a Google Sheet cell value which might be a Date string or specific format.
 * Google Visualization API often returns "Date(year, month, day)" string for date cells.
 */
export const extractDateFromCell = (val: string | number | null): string => {
  if (val === null) return '';
  const strVal = String(val);

  // Handle "Date(2026,0,30)" format from gviz
  if (strVal.startsWith('Date(')) {
    const content = strVal.substring(5, strVal.length - 1);
    const parts = content.split(',');
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10); // 0-indexed in gviz too
      const d = parseInt(parts[2], 10);
      return formatDate(new Date(y, m, d));
    }
  }
  return strVal;
};