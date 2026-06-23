import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductionRecord } from '../types';
import InputProduksiView from './InputProduksiView';

interface DashboardViewProps {
  records: ProductionRecord[];
  onAddRecord: (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => void;
  onNavigateToInput?: () => void;
  customers: string[];
  models: string[];
  processes?: string[];
  onAddCustomer: (name: string) => void;
  onAddModel: (name: string) => void;
  onAddProcess?: (name: string) => void;
}

export default function DashboardView({ 
  records, 
  onAddRecord, 
  onNavigateToInput,
  customers,
  models,
  processes,
  onAddCustomer,
  onAddModel,
  onAddProcess
}: DashboardViewProps) {
  const [showInputForm, setShowInputForm] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  // Compute counts
  const uniqueCustomers = Array.from(new Set(records.map(r => r.customer.trim().toLowerCase()))).length;
  const uniqueModels = Array.from(new Set(records.map(r => r.model.trim().toLowerCase()))).length;
  const uniqueItems = Array.from(new Set(records.map(r => r.item.trim().toLowerCase()))).length;

  // Compute stats
  const totalOk = records.reduce((sum, r) => sum + r.qtyOk, 0);
  const totalNg = records.reduce((sum, r) => sum + r.qtyNg, 0);
  const totalQty = totalOk + totalNg;
  const okRate = totalQty > 0 ? ((totalOk / totalQty) * 100).toFixed(1) : '0.0';
  const ngRate = totalQty > 0 ? ((totalNg / totalQty) * 100).toFixed(1) : '0.0';

  // Latest production entries
  const sortedRecords = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const newestRecords = sortedRecords.slice(0, 3);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-650 via-red-900 to-black text-white p-6 shadow-xl border border-red-800/60 neon-glow-red">
        <div className="absolute right-[-10px] bottom-[-20px] opacity-15">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        </div>
        <span className="text-xs font-bold bg-amber-400 text-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(234,179,8,0.5)]">
          Ringkasan Harian
        </span>
        <h1 className="text-2xl font-black tracking-tight mt-3 text-red-100 uppercase">Monitoring WIP</h1>
        <p className="text-red-200 text-xs mt-1 font-light leading-relaxed">
          Monitor status WIP, output Quantity OK & NG, serta data produksi riil per shift secara live.
        </p>
      </div>

      {/* Main KPI Counter Cards In 3 Columns */}
      <div className="grid grid-cols-3 gap-3">
        {/* Custom Card 1 */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mb-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-red-50">{uniqueCustomers}</div>
          <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Customer</div>
        </div>

        {/* Custom Card 2 */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 dark:bg-red-950/25 text-yellow-600 dark:text-yellow-400 mb-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-yellow-400">{uniqueModels}</div>
          <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Model</div>
        </div>

        {/* Custom Card 3 */}
        <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-amber-500 mb-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-amber-500">{uniqueItems}</div>
          <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Item SKU</div>
        </div>
      </div>

      {/* Production Quality Rate Metrics */}
      <div className="bg-white dark:bg-[#09090f] rounded-xl p-5 border border-slate-100 dark:border-red-950/40 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-red-100 flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-650 mr-2 animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]"></span>
          Kualitas Hasil Output Produksi
        </h2>

        {/* Big numbers */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total OK Output</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {totalOk.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded inline-flex items-center">
              ● {okRate}% Kualitas Baik
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total NG (Cacat)</div>
            <div className="text-3xl font-black text-rose-500 dark:text-red-500 mt-0.5 font-mono">
              {totalNg.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
            <div className="text-[10px] text-rose-600 dark:text-red-400 font-bold mt-1 bg-rose-50 dark:bg-red-950/35 px-2 py-0.5 rounded inline-flex items-center shadow-[0_0_6px_rgba(239,68,68,0.2)]">
              ▲ {ngRate}% Ratio Cacat
            </div>
          </div>
        </div>

        {/* Progress bar ratio */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-500">Persentase Sukses</span>
            <span className="text-slate-800 dark:text-yellow-400 font-bold font-mono">{okRate}%</span>
          </div>
          <div className="w-full h-3 bg-red-100 dark:bg-red-950/30 rounded-full overflow-hidden flex border border-red-500/10">
            <div 
              style={{ width: `${okRate}%` }} 
              className="h-full bg-gradient-to-r from-red-650 to-amber-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Target Progress Card */}
      <div className="bg-[#fdfdfe] dark:bg-[#07070d] border border-slate-200/60 dark:border-red-950/40 rounded-xl p-5 relative overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 dark:text-red-50 flex items-center">
          <svg className="w-4 h-4 mr-1 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Evaluasi Target Harian WIP
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Ekspektasi target gabungan shift adalah 5,000 pcs.</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-[20px] font-black text-slate-800 dark:text-yellow-400 font-mono">
              {totalQty.toLocaleString('id-ID')} / 5.000 <span className="text-xs text-slate-400 font-normal">pcs</span>
            </div>
            <span className="text-xs font-bold text-red-650 dark:text-red-400 mt-1 inline-flex items-center">
              {totalQty >= 5000 ? '✅ Target Terlampaui!' : `⚠️ Kebutuhan Sisa: ${(5000 - totalQty > 0 ? 5000 - totalQty : 0).toLocaleString('id-ID')} pcs`}
            </span>
          </div>
          <div className="relative flex items-center justify-center">
            {/* Simple circular metric */}
            <div className="text-xs font-extrabold text-red-700 bg-red-100 dark:bg-black dark:text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center shadow-inner border border-red-950/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              {totalQty > 0 ? Math.min(100, Math.round((totalQty / 5000) * 100)) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">Update WIP Terakhir</h2>
          <button 
            onClick={() => setShowInputForm(prev => !prev)}
            className="text-xs font-bold text-red-650 dark:text-red-400 hover:underline flex items-center"
          >
            {showInputForm ? 'Batal Input' : 'Input Baru'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showInputForm ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              )}
            </svg>
          </button>
        </div>

        {/* Collapsible Input Form Container */}
        {showInputForm && (
          <div className="bg-white dark:bg-[#09090f] border border-red-500/30 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn border-solid">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-red-950/30">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <h3 className="text-xs font-black text-slate-800 dark:text-red-100 uppercase tracking-widest leading-none">
                  Form Input WIP Baru
                </h3>
              </div>
              <button 
                onClick={() => setShowInputForm(false)}
                className="text-xs font-extrabold text-slate-400 hover:text-red-650"
              >
                Tutup &times;
              </button>
            </div>
            
            <InputProduksiView 
              onAddRecord={(newRec) => {
                onAddRecord(newRec);
                // Auto collapse after input to see the newly updated record instantly
                setShowInputForm(false);
              }}
              existingRecords={records}
              isInline={true}
              customers={customers}
              models={models}
              processes={processes}
              onAddCustomer={onAddCustomer}
              onAddModel={onAddModel}
            />
          </div>
        )}

        {newestRecords.length === 0 ? (
          <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/30 p-8 rounded-xl text-center">
            <p className="text-slate-400 text-sm">Belum ada entri produksi terdaftar.</p>
            <p className="text-slate-400 text-xs mt-1">Gunakan tombol "Input Baru" di atas untuk menginput.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {newestRecords.map((r) => {
              const total = r.qtyOk + r.qtyNg;
              const shortTime = new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              return (
                <div 
                  key={r.id}
                  className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/45 p-4 rounded-xl shadow-sm flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.shift === 'pagi' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                          : r.shift === 'siang'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                      }`}>
                        Shift {r.shift}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{r.date} • {shortTime}</span>
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{r.customer}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{r.model}</span> &rarr; {r.process}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Item SKU: {r.item}</div>
                    {r.notes && (
                      <p className="text-[11px] text-red-700/80 dark:text-red-450/80 italic font-medium bg-red-50/50 dark:bg-red-950/20 px-2 py-1 rounded">
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1 pl-2 flex-shrink-0 font-mono">
                    <span className="text-xs font-medium text-slate-400 font-sans">Yield</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {total} <span className="text-[9px] font-normal text-slate-400 font-sans">pcs</span>
                    </div>
                    <div className="flex flex-col items-end text-[10px] space-y-0.5 font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">OK: {r.qtyOk}</span>
                      <span className="text-rose-650 dark:text-red-400 font-bold">NG: {r.qtyNg}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Quick Input */}
      <button
        onClick={() => setShowQuickModal(true)}
        className="fixed bottom-[92px] right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-red-650 hover:bg-red-600 active:scale-95 text-white shadow-[0_4px_24px_rgba(220,38,38,0.55)] border border-red-500/20 transition-all hover:scale-105 group"
        title="Quick Input WIP"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-2 transition-transform group-hover:rotate-90 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Quick Input Modal Overlay */}
      <AnimatePresence>
        {showQuickModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center sm:p-0">
            {/* Dark Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 120, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 120, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-[#090910] rounded-2xl max-w-sm w-full p-5 overflow-hidden shadow-2xl border border-slate-100 dark:border-red-950/40 z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-red-950/30 mb-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-red-100 uppercase tracking-widest leading-none">
                      Quick Input WIP
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Catat cepat dari dashboard harian</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQuickModal(false)}
                  className="text-slate-400 hover:text-red-650 transition p-1 hover:bg-slate-100 dark:hover:bg-red-950/20 rounded-lg text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="overflow-y-auto pr-1 flex-grow scrollbar-thin">
                <InputProduksiView 
                  onAddRecord={(newRec) => {
                    onAddRecord(newRec);
                    // Close the modal instantly upon success
                    setShowQuickModal(false);
                  }}
                  existingRecords={records}
                  isInline={true}
                  customers={customers}
                  models={models}
                  onAddCustomer={onAddCustomer}
                  onAddModel={onAddModel}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
