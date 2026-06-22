import React, { useState, useRef } from 'react';
import { ProductionRecord, AppSettings } from '../types';

interface PengaturanViewProps {
  settings: AppSettings;
  onChangeSettings: (next: Partial<AppSettings>) => void;
  records: ProductionRecord[];
  onImportRecords: (records: ProductionRecord[]) => void;
  onClearData: () => void;
  customers: string[];
  models: string[];
  onAddCustomer: (name: string) => void;
  onDeleteCustomer: (name: string) => void;
  onAddModel: (name: string) => void;
  onDeleteModel: (name: string) => void;
  onResetCustomers: () => void;
  onResetModels: () => void;
}

export default function PengaturanView({
  settings,
  onChangeSettings,
  records,
  onImportRecords,
  onClearData,
  customers,
  models,
  onAddCustomer,
  onDeleteCustomer,
  onAddModel,
  onDeleteModel,
  onResetCustomers,
  onResetModels
}: PengaturanViewProps) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCustInput, setNewCustInput] = useState('');
  const [newModelInput, setNewModelInput] = useState('');

  // Download JSON backup file
  const handleBackup = () => {
    const backupObj = {
      app: 'WIP-Production-Tracker-Backup',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      recordCount: records.length,
      records
    };

    const fileContent = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    
    const timestampString = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `WIP_Production_Backup_${timestampString}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showTempMsg('Data berhasil dicadangkan (Backup) ke file JSON!');
  };

  // Upload/Restore backup JSON file
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        
        // Validation check
        if (parsed.app === 'WIP-Production-Tracker-Backup' && Array.isArray(parsed.records)) {
          onImportRecords(parsed.records);
          showTempMsg(`Berhasil memulihkan ${parsed.records.length} records data WIP produksi!`);
        } else if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          showTempMsg(`Mencoba memulihkan ${parsed.length} records JSON general!`);
        } else {
          alert('Format berkas cadangan tidak valid!');
        }
      } catch (err) {
        alert('Gagal mendecode file JSON! Berkas mungkin rusak.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  // Handle simulated Cloud Sync
  const handleCloudSyncToggle = (checked: boolean) => {
    onChangeSettings({ cloudSync: checked });
    
    if (checked) {
      setSyncLoading(true);
      setTimeout(() => {
        setSyncLoading(false);
        onChangeSettings({ 
          lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
        });
        showTempMsg('Koneksi berhasil! Sinkronisasi otomatis ke cloud aktif.');
      }, 2000);
    }
  };

  const showTempMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn max-w-md mx-auto">
      
      {/* Set Header */}
      <div className="flex items-center space-x-3 bg-white dark:bg-[#050508] border-b border-slate-100 dark:border-red-950/30 pb-4">
        <div className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-red-50 uppercase tracking-wide">Konfigurasi Pengaturan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Kustomisasi tema, backup, dan sinkronisasi cloud</p>
        </div>
      </div>

      {/* Internal Success message */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: TEMA (LIGHT / DARK TOGLE) */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tampilan Aplikasi</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Tema Gelap (Dark Mode)</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Ubah skema palette agar nyaman di pabrik minim cahaya</p>
          </div>
          
          <button
            id="toggle-darkmode"
            onClick={() => onChangeSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              settings.theme === 'dark' ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 2: CLOUD SINKRONISASI */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Konektivitas &amp; Awan</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Sinkronisasi Cloud Otomatis</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Hubungkan backend harian ke server database awan secara langsung</p>
          </div>
          
          <button
            id="toggle-cloud-sync"
            onClick={() => handleCloudSyncToggle(!settings.cloudSync)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              settings.cloudSync ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                settings.cloudSync ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Live indicator sync feedback */}
        {syncLoading && (
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-dashed border-amber-300">
            <svg className="animate-spin h-4.5 w-4.5 text-amber-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Sedang menyinkronkan data WIP harian...</span>
          </div>
        )}

        {settings.cloudSync && !syncLoading && (
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-300/30">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Terhubung ke Cloud Database</span>
            </div>
            <span>Aktif (Terakhir: Pukul {settings.lastSyncTime || 'Hari Ini'})</span>
          </div>
        )}
      </div>

      {/* SECTION 3: MANAJEMEN DATA (JSON CADANGAN & RESTORE) */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manajemen Backup Data</h2>
        
        {/* Row 1: Backup JSON */}
        <div className="space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Cadangkan Data (Backup)</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Ekspor berkas cadangan log harian Anda ke file JSON</p>
          </div>
          <button
            id="btn-backup"
            type="button"
            onClick={handleBackup}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 dark:bg-black/30 dark:hover:bg-red-950/20 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-200/50 dark:border-red-950/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Unduh Cadangan (.JSON)</span>
          </button>
        </div>

        {/* Row 2: Restore JSON */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-red-950/20">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Puluhkan Data (Restore)</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Unggah berkas CADANGAN JSON yang pernah diunduh untuk dipulihkan kembali</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            id="btn-restore"
            type="button"
            onClick={handleRestoreClick}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 dark:bg-black/30 dark:hover:bg-red-950/20 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-200/50 dark:border-red-950/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L4 8m4-4v12" />
            </svg>
            <span>Unggah &amp; Pulihkan Cadangan</span>
          </button>
        </div>

        {/* Row 3: Danger Zone - Reset database */}
        <div className="space-y-2 pt-3 border-t border-red-100 dark:border-red-900/40">
          <div>
            <span className="text-xs font-bold text-red-650 dark:text-red-400">Danger Zone</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Penghapusan seluruh riwayat produksi secara permanen dari browser</p>
          </div>
          <button
            id="btn-reset-data"
            type="button"
            onClick={() => {
              if (window.confirm('Yakin ingin mereset seluruh database produksi? Tindakan ini permanen.')) {
                onClearData();
                showTempMsg('Seluruh database produksi dibersihkan!');
              }
            }}
            className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-red-200 dark:border-red-900/30 hover:shadow-[0_0_8px_rgba(239,68,68,0.15)]"
          >
            <span>Bersihkan Seluruh Database</span>
          </button>
        </div>

      </div>

      {/* SECTION 4: MANAJEMEN DATA MASTER */}
      <div className="bg-white dark:bg-[#09090f] border border-slate-100 dark:border-red-950/40 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Manajemen Data Master</h2>
          <span className="text-[9px] bg-red-500/15 text-red-600 border border-red-500/10 px-2 py-0.5 rounded-full font-bold">Lokal</span>
        </div>

        {/* CUSTOMER SECTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Daftar Customer ({customers.length})</span>
            <button 
              onClick={() => {
                if(window.confirm('Reset daftar customer ke setelan standar harian?')) {
                  onResetCustomers();
                  showTempMsg('Daftar customer diatur ulang ke standar bawaan!');
                }
              }}
              className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold"
            >
              Reset ke Bawaan
            </button>
          </div>

          {/* List of Customers */}
          <div className="max-h-36 overflow-y-auto border border-slate-100 dark:border-red-950/30 rounded-xl divide-y divide-slate-100 dark:divide-red-950/20 bg-slate-50/50 dark:bg-black/30 scrollbar-thin">
            {customers.length === 0 ? (
              <p className="p-3 text-[11px] text-slate-400 text-center">Tidak ada customer terdaftar. Tambahkan di bawah.</p>
            ) : (
              customers.map((cust) => (
                <div key={cust} className="flex justify-between items-center p-2.5 hover:bg-slate-100 dark:hover:bg-red-950/10 transition">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{cust}</span>
                  <button 
                    onClick={() => {
                      onDeleteCustomer(cust);
                      showTempMsg(`Customer "${cust}" berhasil dihapus dari master.`);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition hover:bg-slate-100 dark:hover:bg-red-950/30 flex-shrink-0"
                    title="Hapus Customer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Customer Input */}
          <div className="flex space-x-2">
            <input 
              type="text"
              placeholder="Tambah nama customer baru..."
              value={newCustInput}
              onChange={(e) => setNewCustInput(e.target.value)}
              className="flex-grow px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
            />
            <button 
              onClick={() => {
                const val = newCustInput.trim();
                if (val) {
                  onAddCustomer(val);
                  setNewCustInput('');
                  showTempMsg(`Customer "${val}" berhasil didaftarkan!`);
                }
              }}
              className="px-3 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center border border-red-500/10 active:scale-95"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* MODEL SECTION */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-red-950/20">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Daftar Model / Seri ({models.length})</span>
            <button 
              onClick={() => {
                if(window.confirm('Reset daftar model ke setelan standar harian?')) {
                  onResetModels();
                  showTempMsg('Daftar model produksi diatur ulang ke standar bawaan!');
                }
              }}
              className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold"
            >
              Reset ke Bawaan
            </button>
          </div>

          {/* List of Models */}
          <div className="max-h-36 overflow-y-auto border border-slate-100 dark:border-red-950/30 rounded-xl divide-y divide-slate-100 dark:divide-red-950/20 bg-slate-50/50 dark:bg-black/30 scrollbar-thin">
            {models.length === 0 ? (
              <p className="p-3 text-[11px] text-slate-400 text-center">Tidak ada model terdaftar. Tambahkan di bawah.</p>
            ) : (
              models.map((mdl) => (
                <div key={mdl} className="flex justify-between items-center p-2.5 hover:bg-slate-100 dark:hover:bg-red-950/10 transition">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{mdl}</span>
                  <button 
                    onClick={() => {
                      onDeleteModel(mdl);
                      showTempMsg(`Model "${mdl}" berhasil dihapus.`);
                    }}
                    className="p-1 text-slate-400 hover:text-red-650 rounded transition hover:bg-slate-100 dark:hover:bg-red-950/30 flex-shrink-0"
                    title="Hapus Model"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Model Input */}
          <div className="flex space-x-2">
            <input 
              type="text"
              placeholder="Tambah nama model baru..."
              value={newModelInput}
              onChange={(e) => setNewModelInput(e.target.value)}
              className="flex-grow px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
            />
            <button 
              onClick={() => {
                const val = newModelInput.trim();
                if (val) {
                  onAddModel(val);
                  setNewModelInput('');
                  showTempMsg(`Model "${val}" berhasil didaftarkan!`);
                }
              }}
              className="px-3 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center border border-red-500/10 active:scale-95"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
