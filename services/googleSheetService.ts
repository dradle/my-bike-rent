import { CustomerData, PaymentRecord, SheetResponse, SheetRow } from '../types';
import { parseDate, addDays, extractDateFromCell } from '../utils/dateUtils';

const SPREADSHEET_ID = '1a0D1Xae8M7AXeVw3L7HVtSNhQLQ6DTmS44si0LLz1CA';

// Google Visualization API URL
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

export const fetchCustomerData = async (sheetName: string): Promise<CustomerData> => {
  try {
    const response = await fetch(getSheetUrl(sheetName));
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }
    
    const textData = await response.text();
    
    // The response is usually wrapped in google.visualization.Query.setResponse(...);
    // We need to extract the JSON object.
    const jsonString = textData.substring(47).slice(0, -2);
    const json: SheetResponse = JSON.parse(jsonString);

    // Check for explicit API errors
    if (json.status === 'error') {
      console.error("Google API Error:", json.errors);
      throw new Error("Клиент с таким именем не найден.");
    }

    if (!json.table || !json.table.rows) {
      throw new Error("Invalid sheet structure or sheet not found.");
    }

    const rows = json.table.rows;

    // Helper to safely get cell content
    // Google Sheets rows are 0-indexed.
    // A=0, B=1, C=2, D=3, E=4, F=5
    const getCell = (rowIndex: number, colIndex: number): any => {
      if (!rows[rowIndex]) return null;
      // Provide fallback for shorter rows
      if (!rows[rowIndex].c || rows[rowIndex].c.length <= colIndex) return null;
      
      const cell = rows[rowIndex].c[colIndex];
      return cell ? (cell.v ?? null) : null;
    };

    // --- SECURITY CHECK (Validation) ---
    // Google API usually defaults to the first sheet if the requested name is wrong.
    // To prevent this, we check Cell F1 (Index 5). It MUST contain the Client Name.
    const validationName = String(getCell(0, 5) || '').trim();
    
    // If F1 is empty or doesn't match the requested sheet name (case-insensitive check), reject it.
    if (validationName.toLowerCase() !== sheetName.toLowerCase()) {
      console.warn(`Security Mismatch: Requested '${sheetName}' but sheet identity (F1) is '${validationName}'`);
      throw new Error("Клиент не найден (ошибка верификации).");
    }

    // --- Parse Header Data (Rows 1 & 2 -> Indices 0 & 1) ---

    // A1: Bike Name
    const bikeName = String(getCell(0, 0) || 'Unknown Bike');
    
    // B1: Tariff
    const tariffRaw = getCell(0, 1);
    const tariff = typeof tariffRaw === 'number' ? tariffRaw : 0;

    // C1: Debt Flag (0 = OK, >0 = Debt)
    const debtFlagRaw = getCell(0, 2);
    const debtFlag = typeof debtFlagRaw === 'number' ? debtFlagRaw : 0;

    // D1: Admin Message
    const adminMessage = String(getCell(0, 3) || '');

    // E2: Debt Amount (Note: E2 is Row index 1, Col index 4)
    const debtAmountRaw = getCell(1, 4);
    const debtAmount = typeof debtAmountRaw === 'number' ? debtAmountRaw : 0;

    // --- Parse Payment History (Starts from Row 3 -> Index 2) ---
    // Col A (0) = Date, Col C (2) = Amount
    
    let lastPayment: PaymentRecord | null = null;
    
    // Iterate backwards to find the last valid payment
    // We start looking from the end of the data provided by gviz
    for (let i = rows.length - 1; i >= 2; i--) {
      const amountVal = getCell(i, 2);
      const dateRawVal = getCell(i, 0); 

      // Check if this row has a payment amount
      if (amountVal !== null && amountVal !== '') {
          // Normalize date value (it might be a specialized Date string from GVIZ or a plain string)
          const dateStr = extractDateFromCell(dateRawVal);
          
          if (dateStr) {
             const dateObj = parseDate(dateStr);
             if (dateObj) {
               lastPayment = {
                 date: dateStr,
                 dateObj: dateObj,
                 amount: Number(amountVal)
               };
               break; // Found the last payment
             }
          }
      }
    }

    // Calculate Next Payment
    let nextPaymentDate: Date | null = null;
    if (lastPayment) {
      nextPaymentDate = addDays(lastPayment.dateObj, 7);
    }

    return {
      sheetName,
      bikeName,
      tariff,
      debtFlag,
      adminMessage,
      debtAmount,
      lastPayment,
      nextPaymentDate
    };

  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
};