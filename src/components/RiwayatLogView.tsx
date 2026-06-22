import React, { useState } from 'react';
import { ProductionRecord } from '../types';

interface RiwayatLogViewProps {
  records: ProductionRecord[];
  onDeleteRecord: (id: string) => void;
}

export default function RiwayatLogView({ records, onDeleteRecord }: RiwayatLogViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');

  // Filter records based on search and shift toggles
  const filteredRecords = records.filter(r => {
    const custMatch = r.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const modelMatch = r.model.toLowerCase().includes(searchTerm.toLowerCase());
    const itemMatch = r.item.toLowerCase().includes(searchTerm.toLowerCase());
    const processMatch = r.process.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = custMatch || modelMatch || itemMatch || processMatch;
    const matchesShift = filterShift === 'all' || r.shift === filterShift;

    return matchesSearch && matchesShift;
  });

  // Sort by date/timestamp descending
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6 pb-28 animate-fadeIn max-w-md mx-auto">
      
      {/* Set Header */}
      <div className="flex justify-between items-center bg-white dark:bg-[#050508] border-b border-slate-100 dark:border-red-950/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-red-50 uppercase tracking-wide">Riwayat Antrean WIP</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Daftar detail entri log hasil produksi harian</p>
          </div>
        </div>
      </div>

      {/* FILTER SEARCH BUBBLES */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-2xl p-4 shadow-sm space-y-3.5">
        
        {/* Search Input Box */}
        <div className="relative">
          <input
            id="input-cari-riwayat"
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

        {/* Shift Filter horizontal selector scroll */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {[
            { id: 'all', label: 'Semua Shift' },
            { id: 'pagi', label: '☀️ Pagi' },
            { id: 'siang', label: '⛅ Siang' },
            { id: 'malam', label: '🌙 Malam' }
          ].map((shiftOpt) => (
            <button
              key={shiftOpt.id}
              onClick={() => setFilterShift(shiftOpt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                filterShift === shiftOpt.id
                  ? 'bg-red-600 border-red-650 dark:bg-red-950/50 dark:text-yellow-400 text-white font-extrabold shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                  : 'bg-slate-50 dark:bg-black/30 dark:border-red-950/25 text-slate-600 dark:text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              {shiftOpt.label}
            </button>
          ))}
        </div>

      </div>

      {/* ITEMS ACCORDION LIST */}
      <div className="space-y-3">
        
        {sortedRecords.length === 0 ? (
          <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/30 p-10 rounded-2xl text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 dark:text-red-950/40 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400 text-xs font-bold uppercase">Hasil nihil</p>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">Tidak ada data WIP yang cocok dengan saringan sasis Anda.</p>
          </div>
        ) : (
          sortedRecords.map((r) => {
            const total = r.qtyOk + r.qtyNg;
            const longTime = new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={r.id}
                className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 rounded-xl p-4 shadow-sm space-y-3 flex flex-col hover:border-slate-200 dark:hover:border-red-950/70 transition"
              >
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.shift === 'pagi' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                          : r.shift === 'siang'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                      }`}>
                        Shift {r.shift}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{r.date} • {longTime}</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1.5">{r.customer}</h3>
                  </div>
                  
                  {/* Delete button option */}
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus log produksi ini?')) {
                        onDeleteRecord(r.id);
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-all"
                    title="Hapus entri"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Values body */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 dark:border-slate-800/80 pt-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Model &amp; Proses</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">{r.model}</span>
                    <span className="text-[11px] text-slate-500 font-mono italic mt-0.5 block">{r.process}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Yield Total: {total} pcs</span>
                    <div className="flex flex-col items-end space-y-0.5 mt-1">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">OK: {r.qtyOk} pcs</span>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">NG: {r.qtyNg} pcs</span>
                    </div>
                  </div>
                </div>

                {/* Additional notes rendering */}
                {r.notes && (
                  <div className="bg-red-50/40 dark:bg-red-950/20 text-red-800 dark:text-red-300 p-2.5 rounded-lg text-[11px] font-medium border border-red-100/50 dark:border-red-950/20">
                    <span className="font-bold">Catatan:</span> &ldquo;{r.notes}&rdquo;
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
