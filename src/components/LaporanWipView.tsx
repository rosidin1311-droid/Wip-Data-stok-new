import React, { useState } from 'react';
import { ProductionRecord, ShiftType } from '../types';
import { exportToCSV } from '../initialData';

interface LaporanWipViewProps {
  records: ProductionRecord[];
}

export default function LaporanWipView({ records }: LaporanWipViewProps) {
  // Option: Show empty entries filter (On/Off based on User requested value > 0)
  const [filterGreaterThanZero, setFilterGreaterThanZero] = useState(false);

  // Grouping records into shifts
  const getShiftRecords = (shiftName: ShiftType): ProductionRecord[] => {
    let list = records.filter(r => r.shift === shiftName);
    
    // Apply filter if "Hanya Jumlah > 0" is active
    if (filterGreaterThanZero) {
      list = list.filter(r => r.qtyOk > 0 || r.qtyNg > 0);
    }
    
    return list;
  };

  const pagiRecords = getShiftRecords('pagi');
  const siangRecords = getShiftRecords('siang');
  const malamRecords = getShiftRecords('malam');

  // Compute stats for each card
  const calculateStats = (list: ProductionRecord[]) => {
    const ok = list.reduce((sum, r) => sum + r.qtyOk, 0);
    const ng = list.reduce((sum, r) => sum + r.qtyNg, 0);
    const total = ok + ng;
    const progressPercent = total > 0 ? Math.round((ok / total) * 100) : 0;
    
    // Determine industrial status label based on rates
    let statusLabel = 'Belum Ada Output';
    let statusColor = 'text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500';
    
    if (total > 0) {
      const ngRatio = ng / total;
      if (ngRatio > 0.08) {
        statusLabel = 'Kualitas Rendah ⚠️';
        statusColor = 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border border-current';
      } else if (ngRatio > 0.03) {
        statusLabel = 'Butuh Perhatian ⚡';
        statusColor = 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-current';
      } else {
        statusLabel = 'Kualitas Stabil ✓';
        statusColor = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-current';
      }
    }

    return { ok, ng, total, progressPercent, statusLabel, statusColor };
  };

  const statsPagi = calculateStats(pagiRecords);
  const statsSiang = calculateStats(siangRecords);
  const statsMalam = calculateStats(malamRecords);

  // Export functions
  const handleExportAll = () => {
    exportToCSV(records, filterGreaterThanZero);
  };

  const handleExportShiftOnly = (shift: ShiftType) => {
    const shiftRecords = records.filter(r => r.shift === shift);
    exportToCSV(shiftRecords, filterGreaterThanZero);
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn max-w-md mx-auto">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white dark:bg-[#050508] border-b border-slate-100 dark:border-red-950/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-red-50 uppercase tracking-wide">Laporan WIP Shift</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Pantau real-time output & kualitas produk</p>
          </div>
        </div>
      </div>

      {/* Controller Controls: Filters & Multi-button Exporters */}
      <div className="bg-[#fdfdfe] dark:bg-[#09090f] border border-slate-200/60 dark:border-red-950/40 rounded-2xl p-4.5 shadow-sm space-y-4">
        
        {/* Toggle filter */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-red-950/20">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Filter Jumlah Output &gt; 0</span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Sembunyikan log kosong tanpa rekapitulasi nilai</p>
          </div>
          <button
            id="btn-filter-wip"
            onClick={() => setFilterGreaterThanZero(!filterGreaterThanZero)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              filterGreaterThanZero ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                filterGreaterThanZero ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Export buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Ekspor Excel / CSV</span>
          <button
            id="btn-export-excel"
            onClick={handleExportAll}
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Unduh Akumulasi Harian (.CSV Excel)</span>
          </button>
        </div>
      </div>

      {/* REKAPITULASI SHIFT (DESIGN CARD-BASED FOR MOBILE VIEWS) */}
      <div className="space-y-4">
        
        {/* CARD 1: SHIFT PAGI */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle logo bg */}
          <div className="absolute top-5 right-5 text-amber-500/10">
            ☀️
          </div>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                Shift Pagi
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-yellow-400 mt-2 font-mono">Waktu Ops: 06:00 - 14:00</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statsPagi.statusColor}`}>
              {statsPagi.statusLabel}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-black/30 p-3 rounded-xl ring-1 ring-slate-100 dark:ring-red-950/20">
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total OK</span>
              <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">{statsPagi.ok.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total NG</span>
              <span className="text-sm font-extrabold text-rose-500 mt-0.5 block">{statsPagi.ng.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Progres</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                {statsPagi.progressPercent}%
              </span>
            </div>
          </div>

          {/* Short dynamic description */}
          <div className="text-xs text-slate-500 flex justify-between items-center pt-1">
            <span>Terdaftar {pagiRecords.length} tipe pengerjaan</span>
            <button
              onClick={() => handleExportShiftOnly('pagi')}
              disabled={pagiRecords.length === 0}
              className="text-[11px] font-bold text-red-650 dark:text-red-400 hover:underline flex items-center disabled:opacity-30"
            >
              Ekspor Shift &rarr;
            </button>
          </div>
        </div>

        {/* CARD 2: SHIFT SIANG */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle logo bg */}
          <div className="absolute top-5 right-5 text-sky-500/10">
            ☀️
          </div>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-2.5 py-1 rounded-full">
                Shift Siang
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-yellow-400 mt-2 font-mono">Waktu Ops: 14:00 - 22:00</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statsSiang.statusColor}`}>
              {statsSiang.statusLabel}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-black/30 p-3 rounded-xl ring-1 ring-slate-100 dark:ring-red-950/20">
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total OK</span>
              <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">{statsSiang.ok.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total NG</span>
              <span className="text-sm font-extrabold text-rose-500 mt-0.5 block">{statsSiang.ng.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Progres</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                {statsSiang.progressPercent}%
              </span>
            </div>
          </div>

          {/* Short dynamic description */}
          <div className="text-xs text-slate-500 flex justify-between items-center pt-1">
            <span>Terdaftar {siangRecords.length} tipe pengerjaan</span>
            <button
              onClick={() => handleExportShiftOnly('siang')}
              disabled={siangRecords.length === 0}
              className="text-[11px] font-bold text-red-650 dark:text-red-400 hover:underline flex items-center disabled:opacity-30"
            >
              Ekspor Shift &rarr;
            </button>
          </div>
        </div>

        {/* CARD 3: SHIFT MALAM */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle logo bg */}
          <div className="absolute top-5 right-5 text-indigo-500/10">
            🌙
          </div>

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full">
                Shift Malam
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-yellow-400 mt-2 font-mono">Waktu Ops: 22:00 - 06:00</h2>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statsMalam.statusColor}`}>
              {statsMalam.statusLabel}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-black/30 p-3 rounded-xl ring-1 ring-slate-100 dark:ring-red-950/20">
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total OK</span>
              <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">{statsMalam.ok.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center border-r border-slate-100 dark:border-red-950/15">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total NG</span>
              <span className="text-sm font-extrabold text-rose-500 mt-0.5 block">{statsMalam.ng.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Progres</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                {statsMalam.progressPercent}%
              </span>
            </div>
          </div>

          {/* Short dynamic description */}
          <div className="text-xs text-slate-500 flex justify-between items-center pt-1">
            <span>Terdaftar {malamRecords.length} tipe pengerjaan</span>
            <button
              onClick={() => handleExportShiftOnly('malam')}
              disabled={malamRecords.length === 0}
              className="text-[11px] font-bold text-red-650 dark:text-red-400 hover:underline flex items-center disabled:opacity-30"
            >
              Ekspor Shift &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
