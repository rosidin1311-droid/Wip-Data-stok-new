import React, { useState, useEffect, useRef } from 'react';
import { ProductionRecord, ShiftType } from '../types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_MODELS, 
  MODEL_PROCESS_MAP, 
  DEFAULT_PROCESSES,
  getShiftFromTime 
} from '../initialData';

interface InputProduksiViewProps {
  onAddRecord: (record: Omit<ProductionRecord, 'id' | 'timestamp'>) => void;
  existingRecords: ProductionRecord[];
  isInline?: boolean;
  customers?: string[];
  models?: string[];
  processes?: string[];
  onAddCustomer?: (name: string) => void;
  onAddModel?: (name: string) => void;
}

export default function InputProduksiView({ 
  onAddRecord, 
  existingRecords, 
  isInline = false,
  customers,
  models,
  processes,
  onAddCustomer,
  onAddModel
}: InputProduksiViewProps) {
  // Extract unique previous entries for type-ahead suggestion boxes
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>(customers || INITIAL_CUSTOMERS);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>(models || INITIAL_MODELS);

  // Sync suggestions with dynamic master databases
  useEffect(() => {
    setCustomerSuggestions(customers || INITIAL_CUSTOMERS);
  }, [customers]);

  useEffect(() => {
    setModelSuggestions(models || INITIAL_MODELS);
  }, [models]);

  // Form states
  const [customer, setCustomer] = useState('');
  const [model, setModel] = useState('');
  const [item, setItem] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [qtyOk, setQtyOk] = useState<number | ''>('');
  const [qtyNg, setQtyNg] = useState<number | ''>('');
  const [shift, setShift] = useState<ShiftType>('pagi');
  const [notes, setNotes] = useState('');

  // Autocomplete UI controllers
  const [showCustList, setShowCustList] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  const [filteredCust, setFilteredCust] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);

  // Feedback notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // References to detect outside clicks
  const custRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // Detect current shift & set default on view load
  useEffect(() => {
    const currentHour = new Date().getHours();
    const calculatedShift = getShiftFromTime(currentHour);
    setShift(calculatedShift);
  }, []);

  // Filter Customer suggestions
  useEffect(() => {
    if (!customer.trim()) {
      setFilteredCust(customerSuggestions);
    } else {
      const match = customerSuggestions.filter(c => 
        c.toLowerCase().includes(customer.toLowerCase())
      );
      setFilteredCust(match);
    }
  }, [customer, customerSuggestions]);

  // Filter Model suggestions
  useEffect(() => {
    if (!model.trim()) {
      setFilteredModels(modelSuggestions);
    } else {
      const match = modelSuggestions.filter(m => 
        m.toLowerCase().includes(model.toLowerCase())
      );
      setFilteredModels(match);
    }
  }, [model, modelSuggestions]);

  // Handle outside clicks to close lists
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (custRef.current && !custRef.current.contains(e.target as Node)) {
        setShowCustList(false);
      }
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setShowModelList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine available processes dropdown based on currently inputted model
  const getAvailableProcesses = (): string[] => {
    // Current customizable lists
    const activeMasterList = processes || DEFAULT_PROCESSES;

    // If master list is empty, nothing should be allowed
    if (activeMasterList.length === 0) {
      return [];
    }

    const normalizedModel = model.trim();
    let modelPresetList: string[] = [];

    // If the model name is in our known map, fetch it.
    if (MODEL_PROCESS_MAP[normalizedModel]) {
      modelPresetList = MODEL_PROCESS_MAP[normalizedModel];
    } else {
      // Attempt string mapping checks if they typed part of it
      const keyMatch = Object.keys(MODEL_PROCESS_MAP).find(k => 
        k.toLowerCase() === normalizedModel.toLowerCase() ||
        normalizedModel.toLowerCase().includes(k.toLowerCase())
      );
      if (keyMatch) {
        modelPresetList = MODEL_PROCESS_MAP[keyMatch];
      }
    }

    // Filter preset processes so that we ONLY include processes that STILL EXIST in the user's active master list!
    if (modelPresetList.length > 0) {
      const filtered = modelPresetList.filter(p => 
        activeMasterList.some(ap => ap.trim().toLowerCase() === p.trim().toLowerCase())
      );
      if (filtered.length > 0) {
        return filtered;
      }
    }
    
    return activeMasterList;
  };

  // Safe process auto-select when the model is chosen
  useEffect(() => {
    const availableProcs = getAvailableProcesses();
    if (availableProcs.length > 0 && !availableProcs.includes(selectedProcess)) {
      setSelectedProcess(availableProcs[0]);
    }
  }, [model, processes]);

  // Trigger form submit and save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.trim()) {
      showToast('Nama Customer harus diisi!', 'error');
      return;
    }
    if (!model.trim()) {
      showToast('Model produksi harus diisi!', 'error');
      return;
    }
    if (!item.trim()) {
      showToast('Item SKU / Code harus diisi!', 'error');
      return;
    }
    if (!selectedProcess) {
      showToast('Urutan proses tahapan harus dipilih!', 'error');
      return;
    }

    const okNum = qtyOk === '' ? 0 : Number(qtyOk);
    const ngNum = qtyNg === '' ? 0 : Number(qtyNg);

    if (okNum < 0 || ngNum < 0) {
      showToast('Jumlah produksi tidak boleh negatif!', 'error');
      return;
    }
    if (okNum === 0 && ngNum === 0) {
      showToast('Masukkan sekurang-kurangnya 1 quantity OK atau NG!', 'error');
      return;
    }

    // Call submit function
    onAddRecord({
      date: new Date().toISOString().split('T')[0],
      customer: customer.trim(),
      model: model.trim(),
      item: item.trim().toUpperCase(),
      process: selectedProcess,
      qtyOk: okNum,
      qtyNg: ngNum,
      shift,
      notes: notes.trim() || undefined
    });

    if (onAddCustomer) {
      onAddCustomer(customer.trim());
    }
    if (onAddModel) {
      onAddModel(model.trim());
    }

    showToast('Data produksi WIP disimpan ke laporan!', 'success');

    // UI Optimization context:
    // We retain Customer, Model, and Item because operators in real plants
    // record multiple sequence steps for the same item. We reset Qty fields to ease sequential entry.
    setQtyOk('');
    setQtyNg('');
    setNotes('');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className={isInline ? "space-y-4 animate-fadeIn" : "space-y-6 pb-28 animate-fadeIn mx-auto max-w-md"}>
      
      {/* Title Header */}
      {!isInline && (
        <div className="flex items-center space-x-3 bg-white dark:bg-[#050508] border-b border-slate-100 dark:border-red-950/30 pb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-red-50 uppercase tracking-wide">Input WIP Produksi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Catat progres hasil kerja operator lapangan</p>
          </div>
        </div>
      )}

      {/* Floating feedback alert */}
      {toast && (
        <div className={`p-4 rounded-xl border-l-4 shadow-md text-xs font-semibold flex items-center space-x-2 animate-bounce fixed top-4 right-4 left-4 z-50 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-500 shadow-emerald-100 dark:shadow-none' 
            : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-500 shadow-rose-100 dark:shadow-none'
        }`}>
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* SHIFT SELECTION LIST */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">
            Pilih Shift Kerja
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pagi', label: '☀️ Pagi', sub: '06-14' },
              { id: 'siang', label: '⛅ Siang', sub: '14-22' },
              { id: 'malam', label: '🌙 Malam', sub: '22-06' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShift(opt.id as ShiftType)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                  shift === opt.id 
                    ? 'border-red-600 bg-red-500/10 dark:bg-red-950/40 text-red-650 dark:text-yellow-400 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'border-slate-200 dark:border-red-950/20 hover:border-slate-300 dark:hover:border-red-950/40 text-slate-600 dark:text-slate-400 font-medium'
                }`}
              >
                <span className="text-xs">{opt.label}</span>
                <span className="text-[9px] text-slate-400 dark:text-red-400/60 mt-0.5 font-mono">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CUSTOMER INPUT with Suggestion autocomplete */}
        <div className="relative" ref={custRef}>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Nama Customer / Pelanggan
          </label>
          <div className="relative">
            <input
              id="input-customer"
              type="text"
              value={customer}
              onFocus={() => setShowCustList(true)}
              onChange={(e) => {
                setCustomer(e.target.value);
                setShowCustList(true);
              }}
              placeholder="Ketik nama PT atau CV..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
            />
            {customer ? (
              <button 
                type="button"
                onClick={() => setCustomer('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            ) : null}
          </div>

          {showCustList && filteredCust.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCust.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setCustomer(suggestion);
                    setShowCustList(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MODEL INPUT with Suggestion autocomplete */}
        <div className="relative" ref={modelRef}>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Model Produksi / Seri
          </label>
          <div className="relative">
            <input
              id="input-model"
              type="text"
              value={model}
              onFocus={() => setShowModelList(true)}
              onChange={(e) => {
                setModel(e.target.value);
                setShowModelList(true);
              }}
              placeholder="Masukkan nomor model atau seri..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
            />
            {model ? (
              <button 
                type="button"
                onClick={() => setModel('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            ) : null}
          </div>

          {showModelList && filteredModels.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredModels.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setModel(suggestion);
                    setShowModelList(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ITEM CODE INPUT */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Item SKU / Code Item
          </label>
          <input
            id="input-item"
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Contoh: Part-09A, G-PINION"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none uppercase font-mono"
          />
        </div>

        {/* PROCESS DROPDOWN - Dynamic based on active model selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Pilih Proses (Tahapan Kerja)</span>
            {model && MODEL_PROCESS_MAP[model] && (
              <span className="text-[9px] text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/40 px-1.5 rounded">
                ✓ Sesuai Model
              </span>
            )}
          </label>
          <select
            id="input-proses"
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
          >
            {getAvailableProcesses().map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* QUANTITIES: OK & NG (Not Good) Side-by-Side */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
              Qty OK (Sesuai)
            </label>
            <input
              id="input-quantity-ok"
              type="number"
              min="0"
              value={qtyOk}
              onChange={(e) => setQtyOk(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Jumlah pcs"
              className="w-full px-4 py-2.5 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-bold placeholder-emerald-800/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1.5 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1 animate-ping"></span>
              Qty NG (Defect)
            </label>
            <input
              id="input-quantity-ng"
              type="number"
              min="0"
              value={qtyNg}
              onChange={(e) => setQtyNg(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Jumlah pcs"
              className="w-full px-4 py-2.5 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none font-bold placeholder-rose-800/40"
            />
          </div>
        </div>

        {/* CATATAN / BARCODE / NOTES FIELD */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis kendala mesin, penggantian pisau, atau cacat bahan..."
            rows={2}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
          />
        </div>

        {/* FAST SUBMIT BUTTON */}
        <button
          id="btn-simpan"
          type="submit"
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 dark:bg-red-650 dark:hover:bg-red-600 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_22px_rgba(239,68,68,0.5)] transform active:scale-95 flex items-center justify-center space-x-2 mt-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-yellow-450 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span className="neon-text-yellow">Simpan Data Produksi WIP</span>
        </button>

      </form>

      {/* Industrial micro-help label */}
      <p className="text-center text-[10px] text-slate-400 font-medium">
        Kiat: Data Customer & Model terpasang pasca tersimpan demi kemudahan input serial beruntun.
      </p>

    </div>
  );
}
