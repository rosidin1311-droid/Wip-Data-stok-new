import { ProductionRecord, ShiftType } from './types';

export const INITIAL_CUSTOMERS = [
  'PT Astra Otoparts TBK',
  'PT Toyota Motor Manufacturing',
  'PT Agung Jaya Presisi',
  'CV Berkah Mandiri Sejahtera',
  'PT Global Tech Indonesia',
  'PT Polytron Electronics',
  'PT Panasonic Manufacturing'
];

export const INITIAL_MODELS = [
  'Bracket-A10 (Steel S45C)',
  'Gear-Pinion-X2 (Medium Carbon)',
  'Cover-Housing-V4',
  'Shaft-Steering-87',
  'プレート Plate-Latch-C',
  'Base-Frame-Pro'
];

export const MODEL_PROCESS_MAP: { [key: string]: string[] } = {
  'Bracket-A10 (Steel S45C)': ['Potong (Cutting)', 'Tekuk (Bending)', 'Las (Welding)', 'Finishing (Coating)', 'Inspeksi QC'],
  'Gear-Pinion-X2 (Medium Carbon)': ['Tempa (Forging)', 'Bubut (Turning)', 'Gigi (Hobbing)', 'Heat Treatment', 'Inspeksi QC'],
  'Cover-Housing-V4': ['Injeksi Plastik', 'Milling', 'Pengecatan', 'Perakitan (Assembly)', 'Inspeksi QC'],
  'Shaft-Steering-87': ['Cutting', 'Machining (CNC)', 'Grinding', 'Hardening', 'Inspeksi QC'],
  'プレート Plate-Latch-C': ['Stamping', 'Deburring', 'Plating', 'QC Final Check'],
  'Base-Frame-Pro': ['Laser Cutting', 'Bending CNC', 'Welding Robotic', 'Powder Coating', 'QC Final Check']
};

export const DEFAULT_PROCESSES = [
  'Potong (Cutting)',
  'Frais (Milling)',
  'Bubut (Turning)',
  'Las (Welding)',
  'Rakit (Assembly)',
  'Pengecatan (Painting)',
  'Finishing',
  'Inspeksi QC'
];

export const INITIAL_RECORDS: ProductionRecord[] = [
  {
    id: 'rec-1',
    timestamp: '2026-06-21T07:15:00Z',
    date: '2026-06-21',
    customer: 'PT Astra Otoparts TBK',
    model: 'Bracket-A10 (Steel S45C)',
    item: 'BRK-A10-01',
    process: 'Potong (Cutting)',
    qtyOk: 150,
    qtyNg: 3,
    shift: 'pagi',
    notes: 'Pisau potong agak aus, sudah diganti'
  },
  {
    id: 'rec-2',
    timestamp: '2026-06-21T09:30:00Z',
    date: '2026-06-21',
    customer: 'PT Astra Otoparts TBK',
    model: 'Bracket-A10 (Steel S45C)',
    item: 'BRK-A10-01',
    process: 'Tekuk (Bending)',
    qtyOk: 145,
    qtyNg: 5,
    shift: 'pagi',
    notes: 'Sudut tekukan aman'
  },
  {
    id: 'rec-3',
    timestamp: '2026-06-21T15:00:00Z',
    date: '2026-06-21',
    customer: 'PT Toyota Motor Manufacturing',
    model: 'Gear-Pinion-X2 (Medium Carbon)',
    item: 'GER-X2-M',
    process: 'Tempa (Forging)',
    qtyOk: 210,
    qtyNg: 8,
    shift: 'siang',
    notes: 'Suhu furnace disesuaikan'
  },
  {
    id: 'rec-4',
    timestamp: '2026-06-21T19:45:00Z',
    date: '2026-06-21',
    customer: 'CV Berkah Mandiri Sejahtera',
    model: 'Cover-Housing-V4',
    item: 'COV-V4-PL',
    process: 'Injeksi Plastik',
    qtyOk: 320,
    qtyNg: 12,
    shift: 'siang',
    notes: 'Tekanan injeksi stabil'
  },
  {
    id: 'rec-5',
    timestamp: '2026-06-21T23:10:00Z',
    date: '2026-06-21',
    customer: 'PT Global Tech Indonesia',
    model: 'Base-Frame-Pro',
    item: 'FRM-PRO-09',
    process: 'Laser Cutting',
    qtyOk: 85,
    qtyNg: 1,
    shift: 'malam',
    notes: 'Lensa laser diganti di awal shift'
  },
  {
    id: 'rec-6',
    timestamp: '2026-06-22T02:15:00Z',
    date: '2026-06-22',
    customer: 'PT Global Tech Indonesia',
    model: 'Base-Frame-Pro',
    item: 'FRM-PRO-09',
    process: 'Bending CNC',
    qtyOk: 80,
    qtyNg: 4,
    shift: 'malam',
    notes: 'Setting mesin bending butuh kalibrasi ulang'
  }
];

export function getShiftFromTime(hour: number): ShiftType {
  // Shift Pagi: 06:00 - 14:00 (hour >= 6 && hour < 14)
  // Shift Siang: 14:00 - 22:00 (hour >= 14 && hour < 22)
  // Shift Malam: 22:00 - 06:00 (hour >= 22 || hour < 6)
  if (hour >= 6 && hour < 14) {
    return 'pagi';
  } else if (hour >= 14 && hour < 22) {
    return 'siang';
  } else {
    return 'malam';
  }
}

export function exportToCSV(records: ProductionRecord[], filterActive: boolean) {
  // Filter records with values > 0 if filterActive is true
  const filtered = filterActive 
    ? records.filter(r => r.qtyOk > 0 || r.qtyNg > 0) 
    : records;

  // Header row
  const headers = [
    'ID',
    'Tanggal',
    'Waktu',
    'Customer',
    'Model',
    'Item',
    'Proses (Tahapan)',
    'Shift',
    'Quantity OK',
    'Quantity NG (Not Good)',
    'Total Produksi',
    'Catatan / Notes'
  ];

  const rows = filtered.map(r => {
    const timeString = new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const shiftLabel = r.shift === 'pagi' ? 'Shift Pagi' : r.shift === 'siang' ? 'Shift Siang' : 'Shift Malam';
    const total = r.qtyOk + r.qtyNg;
    return [
      r.id,
      r.date,
      timeString,
      r.customer.replace(/"/g, '""'),
      r.model.replace(/"/g, '""'),
      r.item.replace(/"/g, '""'),
      r.process.replace(/"/g, '""'),
      shiftLabel,
      r.qtyOk,
      r.qtyNg,
      total,
      (r.notes || '').replace(/"/g, '""')
    ];
  });

  // Combine into CSV string (using semicolons commonly needed for excel opening standard directly or commas with BOM)
  // We include a UTF-8 Byte Order Mark (BOM) to force Excel to open it correctly in Indonesian locales.
  const CSVContent = "\uFEFF" + 
    [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

  const blob = new Blob([CSVContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `WIP_Laporan_Produksi_${today}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
