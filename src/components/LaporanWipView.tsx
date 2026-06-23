import React, { useState } from 'react';
import { ProductionRecord, ShiftType } from '../types';
import { exportToCSV, MODEL_PROCESS_MAP } from '../initialData';

interface LaporanWipViewProps {
  records: ProductionRecord[];
  processes?: string[];
}

export default function LaporanWipView({ records, processes }: LaporanWipViewProps) {
  // Option: Show empty entries filter (On/Off based on User requested value > 0)
  const [filterGreaterThanZero, setFilterGreaterThanZero] = useState(false);

  // Helper to check if record is finished "stok" process
  const isStokRecord = (r: ProductionRecord): boolean => {
    const activeMasterList = processes || [];
    
    // 1. Get process sequence for this model
    let processSequence = MODEL_PROCESS_MAP[r.model] ? [...MODEL_PROCESS_MAP[r.model]] : [];
    
    // Filter with master list if active
    if (activeMasterList.length > 0) {
      processSequence = processSequence.filter(p => 
        activeMasterList.some(ap => ap.trim().toLowerCase() === p.trim().toLowerCase())
      );
    }
    
    // 2. If no preset sequence exists, build from history
    if (processSequence.length === 0) {
      const modelRecords = records.filter(item => item.model === r.model);
      let uniqueProcesses = Array.from(new Set(modelRecords.map(item => item.process)));
      if (activeMasterList.length > 0) {
        uniqueProcesses = uniqueProcesses.filter(p => 
          activeMasterList.some(ap => ap.trim().toLowerCase() === p.trim().toLowerCase())
        );
      }
      uniqueProcesses.sort((a, b) => {
        const firstA = modelRecords.find(item => item.process === a);
        const firstB = modelRecords.find(item => item.process === b);
        const timeA = firstA ? new Date(firstA.timestamp).getTime() : 0;
        const timeB = firstB ? new Date(firstB.timestamp).getTime() : 0;
        return timeA - timeB;
      });
      processSequence = uniqueProcesses;
    }
    
    if (processSequence.length === 0) {
      return false;
    }
    
    // The final process in sequence is the "stok" process
    const finalProcess = processSequence[processSequence.length - 1];
    return r.process.trim().toLowerCase() === finalProcess.trim().toLowerCase();
  };

  // Grouping records into shifts
  const getShiftRecords = (shiftName: ShiftType): ProductionRecord[] => {
    let list = records.filter(r => r.shift === shiftName && !isStokRecord(r));
    
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

  // Calculate remaining WIP balance for each customer + model + item
  const calculateWipData = () => {
    const groups: { [key: string]: ProductionRecord[] } = {};
    records.forEach(r => {
      const key = `${r.customer}||${r.model}||${r.item || 'Generic Item'}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(r);
    });

    const wipItems: {
      customer: string;
      model: string;
      item: string;
      activeWipProcesses: { name: string; qty: number; qtyNg: number }[];
    }[] = [];

    Object.keys(groups).forEach(key => {
      const [customer, model, item] = key.split('||');
      const groupRecords = groups[key];

      // Get defined process sequence for this model, or gather from records
      let processSequence = MODEL_PROCESS_MAP[model] ? [...MODEL_PROCESS_MAP[model]] : [];
      const activeMasterList = processes || [];
      if (activeMasterList.length > 0) {
        processSequence = processSequence.filter(p => 
          activeMasterList.some(ap => ap.trim().toLowerCase() === p.trim().toLowerCase())
        );
      }

      if (processSequence.length === 0) {
        let uniqueProcesses = Array.from(new Set(groupRecords.map(r => r.process)));
        if (activeMasterList.length > 0) {
          uniqueProcesses = uniqueProcesses.filter(p => 
            activeMasterList.some(ap => ap.trim().toLowerCase() === p.trim().toLowerCase())
          );
        }
        uniqueProcesses.sort((a, b) => {
          const firstA = groupRecords.find(r => r.process === a);
          const firstB = groupRecords.find(r => r.process === b);
          const timeA = firstA ? new Date(firstA.timestamp).getTime() : 0;
          const timeB = firstB ? new Date(firstB.timestamp).getTime() : 0;
          return timeA - timeB;
        });
        processSequence = uniqueProcesses;
      }

      if (processSequence.length === 0) return;

      // Calculate total production at each stage
      const stageTotals = processSequence.map((procName, idx) => {
        const procRecords = groupRecords.filter(r => r.process.trim() === procName.trim());
        const qtyOk = procRecords.reduce((sum, r) => sum + r.qtyOk, 0);
        const qtyNg = procRecords.reduce((sum, r) => sum + r.qtyNg, 0);
        return {
          name: procName,
          qtyOk,
          qtyNg,
          index: idx
        };
      });

      // Calculate remaining WIP:
      // Sisa WIP di Proses i = OK di Proses i - OK di Proses i+1
      const activeWip: { name: string; qty: number; qtyNg: number }[] = [];
      for (let i = 0; i < stageTotals.length - 1; i++) {
        const currentQtyOk = stageTotals[i].qtyOk;
        const nextQtyOk = stageTotals[i + 1].qtyOk;
        const wipRemaining = Math.max(0, currentQtyOk - nextQtyOk);
        if (wipRemaining > 0) {
          activeWip.push({
            name: stageTotals[i].name,
            qty: wipRemaining,
            qtyNg: stageTotals[i].qtyNg
          });
        }
      }

      if (activeWip.length > 0) {
        wipItems.push({
          customer,
          model,
          item,
          activeWipProcesses: activeWip
        });
      }
    });

    return wipItems;
  };

  const activeWipList = calculateWipData();

  // Export functions
  const handleExportAll = () => {
    const wipOnly = records.filter(r => !isStokRecord(r));
    exportToCSV(wipOnly, filterGreaterThanZero);
  };

  const handleExportShiftOnly = (shift: ShiftType) => {
    const shiftRecords = records.filter(r => r.shift === shift && !isStokRecord(r));
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

      {/* DAFTAR SISA WIP AKTIF DI LANTAI PRODUKSI */}
      <div id="active-wip-section" className="bg-slate-50 dark:bg-[#07070c] border border-slate-200/80 dark:border-red-950/25 rounded-2xl p-4.5 space-y-4 shadow-sm font-sans">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-red-950/20">
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-yellow-400 uppercase tracking-widest">
              Sisa WIP Aktif di Lantai Produksi
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Sisa balance WIP yang belum terproses ke tahap berikutnya</p>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full font-mono">
            {activeWipList.length} Item
          </span>
        </div>

        {/* Info card rule statement */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-amber-600 dark:text-amber-400 space-y-1">
          <p className="font-bold flex items-center space-x-1">
            <span>ℹ️</span> <span>Logika Deduksi WIP Otomatis:</span>
          </p>
          <ul className="list-disc list-inside space-y-0.5 pl-1.5 leading-relaxed font-medium">
            <li>Sisa WIP pada suatu proses berkurang otomatis saat item yang sama diproduksi pada proses selanjutnya (atau langsung masuk ke Stok).</li>
            <li>Jumlah WIP bertambah otomatis jika ada proses baru pada tahap yang sama.</li>
          </ul>
        </div>

        {activeWipList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-red-950/20 rounded-xl bg-white dark:bg-[#09090f]">
            💤 Tidak ada sisa WIP aktif di proses menengah.
            <p className="text-[10px] text-slate-400/80 mt-1">Semua item sudah diselesaikan atau belum diproduksi.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {activeWipList.map((item, idx) => (
              <div 
                key={`${item.customer}-${item.model}-${idx}`}
                className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/25 rounded-xl p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                      {item.customer}
                    </span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-yellow-400 font-mono">
                      {item.model}
                    </h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-medium block">
                      Part: {item.item}
                    </span>
                  </div>
                </div>

                {/* Sub-process WIP list */}
                <div className="space-y-1.5 font-mono text-[11px] pt-1.5 border-t border-slate-100 dark:border-red-950/15">
                  {item.activeWipProcesses.map((proc) => (
                    <div 
                      key={proc.name}
                      className="flex justify-between items-center py-1 px-2 bg-amber-500/5 dark:bg-amber-950/15 border border-amber-500/10 dark:border-amber-950/20 rounded"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                        {proc.name}
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {proc.qtyNg > 0 && (
                          <span className="text-[9px] text-rose-500 font-bold bg-rose-500/10 px-1 py-0.5 rounded">
                            NG: {proc.qtyNg}
                          </span>
                        )}
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {proc.qty} Pcs WIP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
