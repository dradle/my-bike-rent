export interface PaymentRecord {
  date: string; // Original string DD.MM.YYYY
  dateObj: Date; // Parsed JS Date
  amount: number;
}

export interface CustomerData {
  sheetName: string;
  bikeName: string; // A1
  tariff: number; // B1
  debtFlag: number; // C1
  adminMessage: string; // D1
  debtAmount: number; // E2
  lastPayment: PaymentRecord | null;
  nextPaymentDate: Date | null;
}

export interface SheetCell {
  v: string | number | null; // value
  f?: string; // formatted value
}

export interface SheetRow {
  c: (SheetCell | null)[];
}

export interface SheetResponse {
  table: {
    cols: any[];
    rows: SheetRow[];
  };
}