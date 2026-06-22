import React, { useState } from 'react';
import { ProductionRecord } from '../types';
import { MODEL_PROCESS_MAP } from '../initialData';

interface DataStockViewProps {
  records: ProductionRecord[];
  onNavigateToInput?: () => void;
}

interface StockItem {
  customer: string;
  model: string;
  item: string;
  processes: {
    name: string;
    qtyOk: number;
    qtyNg: number;
    wipRemaining: number;
  }[];
  totalStock: number;
  totalNg: number;
}

export default function DataStockView({ records }: DataStockViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  // 1. Calculate stock & WIP for each unique combination of Customer + Model + Item
  const calculateStockData = (): StockItem[] => {
    // Group records by Customer + Model + Item
    const groups: { [key: string]: ProductionRecord[] } = {};
    
    records.forEach(r => {
      const key = `${r.customer.trim()}||${r.model.trim()}||${r.item.trim()}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(r);
    });

    const stockItems: StockItem[] = [];

    Object.keys(groups).forEach(key => {
      const [customer, model, item] = key.split('||');
      const groupRecords = groups[key];

      // Get defined process sequence for this model, or gather from records
      let processSequence = MODEL_PROCESS_MAP[model] || [];
      if (processSequence.length === 0) {
        // Fallback: gather all unique processes for this model from records and order them
        const uniqueProcesses = Array.from(new Set(groupRecords.map(r => r.process)));
        // Try to sort them by date-time first entered
        uniqueProcesses.sort((a, b) => {
          const firstA = groupRecords.find(r => r.process === a);
          const firstB = groupRecords.find(r => r.process === b);
          const timeA = firstA ? new Date(firstA.timestamp).getTime() : 0;
          const timeB = firstB ? new Date(firstB.timestamp).getTime() : 0;
          return timeA - timeB;
        });
        processSequence = uniqueProcesses;
      }

      // If still no processes, skip
      if (processSequence.length === 0) return;

      // Calculate total production at each stage
      const stageTotals = processSequence.map(procName => {
        const procRecords = groupRecords.filter(r => r.process.trim() === procName.trim());
        const qtyOk = procRecords.reduce((sum, r) => sum + r.qtyOk, 0);
        const qtyNg = procRecords.reduce((sum, r) => sum + r.qtyNg, 0);
        return {
          name: procName,
          qtyOk,
          qtyNg,
          wipRemaining: 0 // to be calculated below
        };
      });

      // Calculate remaining WIP at each sequence step:
      // Sisa WIP di Proses i = QtyOK di Proses i - QtyOK di Proses i+1
      for (let i = 0; i < stageTotals.length; i++) {
        const currentQtyOk = stageTotals[i].qtyOk;
        const nextQtyOk = i + 1 < stageTotals.length ? stageTotals[i + 1].qtyOk : 0;
        stageTotals[i].wipRemaining = Math.max(0, currentQtyOk - nextQtyOk);
      }

      // Stock is the quantity of the final step in the process sequence
      const finalStage = stageTotals[stageTotals.length - 1];
      const totalStock = finalStage ? finalStage.qtyOk : 0;
      const totalNg = stageTotals.reduce((sum, s) => sum + s.qtyNg, 0);

      stockItems.push({
        customer,
        model,
        item,
        processes: stageTotals,
        totalStock,
        totalNg
      });
    });

    return stockItems;
  };

  const allItems = calculateStockData();

  // Filter items based on search term
  const filteredItems = allItems.filter(item => {
    const s = searchTerm.toLowerCase();
    return (
      item.customer.toLowerCase().includes(s) ||
      item.model.toLowerCase().includes(s) ||
      item.item.toLowerCase().includes(s) ||
      item.processes.some(p => p.name.toLowerCase().includes(s))
    );
  });

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Export Stock Report helper
  const handleExportStockReport = () => {
    const headers = [
      'Customer',
      'Model',
      'Item SKU',
      'Tahapan Proses',
      'Qty OK Produksi',
      'Qty NG Cacat',
      'WIP Tersimpan (Sisa)',
      'Total Stok Akhir (Ready)'
    ];

    const rows: string[][] = [];
    filteredItems.forEach(item => {
      item.processes.forEach((proc, idx) => {
        const isLast = idx === item.processes.length - 1;
        rows.push([
          item.customer.replace(/"/g, '""'),
          item.model.replace(/"/g, '""'),
          item.item.replace(/"/g, '""'),
          proc.name.replace(/"/g, '""'),
          proc.qtyOk.toString(),
          proc.qtyNg.toString(),
          proc.wipRemaining.toString(),
          isLast ? item.totalStock.toString() : '0'
        ]);
      });
    });

    const CSVContent = "\uFEFF" + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([CSVContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Stok_WIP_Finishing_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn max-w-md mx-auto">
      
      {/* Set Header */}
      <div className="flex justify-between items-center bg-white dark:bg-[#050508] border-b border-slate-100 dark:border-red-950/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-red-50 uppercase tracking-wide">Data Stock</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Stok &amp; sisa saldo WIP di masing-masing area kerja</p>
          </div>
        </div>
      </div>

      {/* Filter and Export Controller */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Customer, Model, Item, Proses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-red-950/20 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-650 outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportStockReport}
          disabled={filteredItems.length === 0}
          className="w-full py-2 px-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:scale-95 dark:text-red-400 text-red-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Unduh Laporan Stok (CSV)</span>
        </button>
      </div>

      {/* Stock Cards Listing grouped by Customer */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/30 p-10 rounded-2xl text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 dark:text-red-950/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-400 text-xs font-bold uppercase">Stok Kosong</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">Belum ada aktivitas produksi atau tidak ada filter yang cocok.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const key = `${item.customer}_${item.model}_${item.item}`;
            const isExpanded = expandedItems[key] || false;

            return (
              <div 
                key={key}
                className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-4 shadow-sm space-y-3 hover:border-slate-200 dark:hover:border-red-950/70 transition"
              >
                {/* Header Item */}
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleExpand(key)}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-widest font-bold text-red-600 dark:text-red-400 uppercase leading-none block">
                      {item.customer}
                    </span>
                    <h2 className="text-sm font-black text-slate-800 dark:text-red-50 mt-1">
                      {item.model}
                    </h2>
                    <div className="inline-flex items-center space-x-1.5 mt-1 bg-slate-100 dark:bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-red-950/15">
                      <span>Item SKU:</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{item.item}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end flex-shrink-0 pl-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ready Stock</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {item.totalStock.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">pcs</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center">
                      Detail WIP
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-3 w-3 ml-0.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Progress / Pipeline Visualization */}
                <div className="pt-2">
                  <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-thin">
                    {item.processes.map((p, pIdx) => {
                      const isLast = pIdx === item.processes.length - 1;
                      const hasActiveWip = p.wipRemaining > 0;
                      return (
                        <React.Fragment key={p.name}>
                          {/* Process Node */}
                          <div 
                            className={`flex flex-col items-center p-2 rounded-xl border text-center min-w-[75px] max-w-[100px] flex-shrink-0 transition ${
                              isLast 
                                ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                : hasActiveWip 
                                  ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                                  : 'bg-slate-50 dark:bg-black/30 border-slate-200 dark:border-red-950/15 text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            <span className="text-[9px] font-black truncate w-full" title={p.name}>
                              {p.name.replace(/\(.*?\)/g, '').trim()}
                            </span>
                            <span className="text-xs font-black font-mono mt-1">
                              {isLast ? p.qtyOk : p.wipRemaining}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                              {isLast ? 'STOK' : 'WIP'}
                            </span>
                          </div>
                          
                          {/* Connector Arrow */}
                          {!isLast && (
                            <div className="text-slate-300 dark:text-red-950/40 flex-shrink-0 font-extrabold text-xs px-0.5">
                              &rarr;
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Detailed Breakdown Listing */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-red-950/25 space-y-2 animate-fadeIn">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1">
                      Rincian Log Tahapan Proses
                    </h4>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {item.processes.map((proc, pIdx) => {
                        const isLast = pIdx === item.processes.length - 1;
                        return (
                          <div 
                            key={proc.name}
                            className="flex justify-between items-center py-1.5 px-2 bg-slate-50 dark:bg-black/20 rounded border border-slate-100 dark:border-red-950/10"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-[9px] text-slate-400 font-bold block w-4 text-center">
                                {pIdx + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                                {proc.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0 pl-2">
                              <span className="text-[10px] text-slate-400">
                                OK: <strong className="text-slate-700 dark:text-slate-200">{proc.qtyOk}</strong>
                              </span>
                              {proc.qtyNg > 0 && (
                                <span className="text-[10px] text-rose-500 font-bold">
                                  NG: {proc.qtyNg}
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-500">
                                Sisa: <strong className={proc.wipRemaining > 0 ? 'text-amber-500 font-extrabold' : 'text-slate-400'}>{isLast ? `${item.totalStock} (Stok)` : `${proc.wipRemaining} (WIP)`}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
