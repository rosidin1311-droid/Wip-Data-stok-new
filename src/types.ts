export type ShiftType = 'pagi' | 'siang' | 'malam';

export interface ProductionRecord {
  id: string;
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
  customer: string;
  model: string;
  item: string;
  process: string;
  qtyOk: number;
  qtyNg: number;
  shift: ShiftType;
  notes?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  cloudSync: boolean;
  lastSyncTime?: string;
  autoBackupLocal?: boolean; // Enable automatic local snapshots
  autoBackupDownload?: boolean; // Optional: download file automatically on new record
}

export interface BackupSnapshot {
  id: string;
  timestamp: string; // ISO String
  recordCount: number;
  records: ProductionRecord[];
  type: 'auto' | 'manual';
  note?: string;
}

export interface ShiftSummary {
  shift: ShiftType;
  name: string;
  timeRange: string;
  icon: string;
  totalOk: number;
  totalNg: number;
  itemsCount: number;
}
