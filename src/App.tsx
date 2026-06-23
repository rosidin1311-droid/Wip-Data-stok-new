import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNavbar from './components/BottomNavbar';
import DashboardView from './components/DashboardView';
import InputProduksiView from './components/InputProduksiView';
import LaporanWipView from './components/LaporanWipView';
import RiwayatLogView from './components/RiwayatLogView';
import PengaturanView from './components/PengaturanView';
import DataStockView from './components/DataStockView';
import NeonLogo from './components/NeonLogo';
import { ProductionRecord, AppSettings } from './types';
import { INITIAL_RECORDS, INITIAL_CUSTOMERS, INITIAL_MODELS, DEFAULT_PROCESSES } from './initialData';

export default function App() {
  // Initialize production records from localStorage, fallback to preset default values
  const [records, setRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('wip_tracker_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse records from local storage:', err);
      }
    }
    return INITIAL_RECORDS;
  });

  // Initialize customizable customers list
  const [customers, setCustomers] = useState<string[]>(() => {
    const saved = localStorage.getItem('wip_tracker_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse customers master database:', err);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // Initialize customizable models list
  const [models, setModels] = useState<string[]>(() => {
    const saved = localStorage.getItem('wip_tracker_models');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse models master database:', err);
      }
    }
    return INITIAL_MODELS;
  });

  // Initialize customizable processes list
  const [processes, setProcesses] = useState<string[]>(() => {
    const saved = localStorage.getItem('wip_tracker_processes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse processes master database:', err);
      }
    }
    return DEFAULT_PROCESSES;
  });

  // Initialize app settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('wip_tracker_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          autoBackupLocal: true,
          autoBackupDownload: false,
          ...parsed
        };
      } catch (err) {
        console.error('Failed to parse settings from local storage:', err);
      }
    }
    return {
      theme: 'dark', // Default to Dark mode to show off the beautiful Neon theme by default
      cloudSync: false,
      autoBackupLocal: true,
      autoBackupDownload: false
    };
  });

  // Initialize backup snapshots from localStorage
  const [snapshots, setSnapshots] = useState<any[]>(() => {
    const saved = localStorage.getItem('wip_tracker_snapshots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse snapshots from local storage:', err);
      }
    }
    return [];
  });

  // Current sub-screen route state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync records data to localStorage
  useEffect(() => {
    localStorage.setItem('wip_tracker_records', JSON.stringify(records));
  }, [records]);

  // Sync customizable data lists to localStorage
  useEffect(() => {
    localStorage.setItem('wip_tracker_customers', JSON.stringify(customers));
  }, [customers]);

  // Sync snapshots history data to localStorage
  useEffect(() => {
    localStorage.setItem('wip_tracker_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('wip_tracker_models', JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    localStorage.setItem('wip_tracker_processes', JSON.stringify(processes));
  }, [processes]);

  // Sync settings config to localStorage
  useEffect(() => {
    localStorage.setItem('wip_tracker_settings', JSON.stringify(settings));
  }, [settings]);

  // Update HTML body theme classes on settings theme value change
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Master List Modifiers
  const handleAddCustomer = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !customers.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomers(prev => [...prev, trimmed]);
    }
  };

  const handleDeleteCustomer = (name: string) => {
    setCustomers(prev => prev.filter(c => c !== name));
  };

  const handleAddModel = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !models.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setModels(prev => [...prev, trimmed]);
    }
  };

  const handleDeleteModel = (name: string) => {
    setModels(prev => prev.filter(m => m !== name));
  };

  const handleAddProcess = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !processes.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setProcesses(prev => [...prev, trimmed]);
    }
  };

  const handleDeleteProcess = (name: string) => {
    setProcesses(prev => prev.filter(p => p !== name));
  };

  // Helper to trigger automatic local / file backups
  const triggerAutoBackup = (updatedRecords: ProductionRecord[]) => {
    // 1. Auto Local Snapshot
    if (settings.autoBackupLocal !== false) {
      const newSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        recordCount: updatedRecords.length,
        records: updatedRecords,
        type: 'auto'
      };
      
      setSnapshots(prev => {
        const autos = prev.filter(s => s.type === 'auto');
        const manuals = prev.filter(s => s.type === 'manual');
        // Keep the last 10 auto-snapshots to avoid hogging localstorage
        const updatedAutos = [newSnapshot, ...autos].slice(0, 10);
        return [...updatedAutos, ...manuals];
      });
    }

    // 2. Auto File Download
    if (settings.autoBackupDownload) {
      try {
        const backupObj = {
          app: 'WIP-Production-Tracker-Backup',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          recordCount: updatedRecords.length,
          records: updatedRecords
        };
        const fileContent = JSON.stringify(backupObj, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestampString = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `WIP_AutoBackup_${timestampString}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Auto download offline backup failed:', e);
      }
    }
  };

  const handleCreateManualSnapshot = (note?: string) => {
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recordCount: records.length,
      records: records,
      type: 'manual',
      note: note || 'Salinan Manual'
    };
    setSnapshots(prev => [newSnapshot, ...prev]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  // Command handlers
  const handleAddRecord = (newRec: Omit<ProductionRecord, 'id' | 'timestamp'>) => {
    const recordWithId: ProductionRecord = {
      ...newRec,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    setRecords(prev => {
      const updated = [recordWithId, ...prev];
      triggerAutoBackup(updated);
      return updated;
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      triggerAutoBackup(updated);
      return updated;
    });
  };

  const handleImportRecords = (importedList: ProductionRecord[]) => {
    setRecords(importedList);
    triggerAutoBackup(importedList);
  };

  const handleClearData = () => {
    setRecords([]);
    triggerAutoBackup([]);
  };

  const handleChangeSettings = (nextSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...nextSettings
    }));
  };

  // Screen router helper
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            records={records} 
            onAddRecord={handleAddRecord}
            onNavigateToInput={() => setActiveTab('input')} 
            customers={customers}
            models={models}
            processes={processes}
            onAddCustomer={handleAddCustomer}
            onAddModel={handleAddModel}
            onAddProcess={handleAddProcess}
          />
        );
      case 'wip':
        return <LaporanWipView records={records} processes={processes} />;
      case 'stok':
        return <DataStockView records={records} processes={processes} />;
      case 'input':
        return (
          <InputProduksiView 
            onAddRecord={handleAddRecord} 
            existingRecords={records} 
            customers={customers}
            models={models}
            processes={processes}
            onAddCustomer={handleAddCustomer}
            onAddModel={handleAddModel}
          />
        );
      case 'riwayat':
        return (
          <RiwayatLogView 
            records={records} 
            onDeleteRecord={handleDeleteRecord} 
          />
        );
      case 'pengaturan':
        return (
          <PengaturanView
            settings={settings}
            onChangeSettings={handleChangeSettings}
            records={records}
            onImportRecords={handleImportRecords}
            onClearData={handleClearData}
            customers={customers}
            models={models}
            processes={processes}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onAddModel={handleAddModel}
            onDeleteModel={handleDeleteModel}
            onAddProcess={handleAddProcess}
            onDeleteProcess={handleDeleteProcess}
            onResetCustomers={() => setCustomers(INITIAL_CUSTOMERS)}
            onResetModels={() => setModels(INITIAL_MODELS)}
            onResetProcesses={() => setProcesses(DEFAULT_PROCESSES)}
            snapshots={snapshots}
            onCreateManualSnapshot={handleCreateManualSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
          />
        );
      default:
        return (
          <DashboardView 
            records={records} 
            onAddRecord={handleAddRecord}
            onNavigateToInput={() => setActiveTab('input')} 
            customers={customers}
            models={models}
            processes={processes}
            onAddCustomer={handleAddCustomer}
            onAddModel={handleAddModel}
            onAddProcess={handleAddProcess}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex justify-center text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile-First Shell Frame Container */}
      <div className="w-full max-w-md bg-white dark:bg-[#050508] min-h-screen shadow-2xl relative flex flex-col border-x border-slate-200/60 dark:border-red-950/40">
        
        {/* Top Header Panel */}
        <header className="sticky top-0 bg-white/95 dark:bg-[#050508]/95 backdrop-blur-md border-b border-slate-100 dark:border-red-950/40 px-6 py-2.5 z-40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <NeonLogo size="sm" className="-my-2" />
            <div className="flex flex-col">
              <span className="text-[13px] font-black tracking-wider text-red-600 dark:text-red-500 font-sans leading-tight">
                Monitoring
              </span>
              <span className="text-[10px] font-bold tracking-widest text-amber-500 dark:text-yellow-400 font-mono leading-none">
                PRODUKSI
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick toggle list for fast theme swap */}
            <button
              onClick={() => handleChangeSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-red-950/20 transition"
              title="Ganti Tema Visual"
            >
              {settings.theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 filter drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Simulation Cloud Icon tags */}
            {settings.cloudSync ? (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200/40">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active</span>
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 dark:text-rose-400/80 font-bold bg-slate-50 dark:bg-red-950/10 px-2 py-0.5 rounded-full border border-slate-200/40 dark:border-red-950/40">
                Lokal
              </span>
            )}
          </div>
        </header>

        {/* Content Section with padding bottom to accommodate custom floating Bottom Navbar */}
        <main className="flex-grow px-5 pt-4 pb-20 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Custom fixed cutout Bottom Navbar */}
        <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
      </div>

    </div>
  );
}
