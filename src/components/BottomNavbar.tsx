import React from 'react';
import { ShiftType } from '../types';

interface BottomNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavbar({ activeTab, setActiveTab }: BottomNavbarProps) {
  // Navigation tabs list
  // Tab 'input' is the central floating button
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pointer-events-none">
      <div className="relative w-full max-w-md h-20 flex justify-around items-center pointer-events-auto bg-red-975 dark:bg-red-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-red-800/55 shadow-[0_-4px_20px_rgba(239,68,68,0.25)]">
        
        {/* Left Side Items */}
        <div className="flex w-1/2 justify-around pr-4">
          {/* Dashboard Tab */}
          <button
            id="nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
              activeTab === 'dashboard' 
                ? 'text-yellow-300 bg-red-900/60 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                : 'text-red-300\/70 hover:text-white hover:scale-105'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-6 h-6 mb-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Dashboard</span>
          </button>

          {/* Laporan WIP Tab */}
          <button
            id="nav-wip"
            onClick={() => setActiveTab('wip')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
              activeTab === 'wip' 
                ? 'text-yellow-300 bg-red-900/60 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                : 'text-red-300\/70 hover:text-white hover:scale-105'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-6 h-6 mb-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Lapor WIP</span>
          </button>
        </div>

        {/* Center Cutout with Floating Button */}
        <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
          <div className="relative">
            {/* Curved cutout backdrop */}
            <div className="absolute -top-1.5 -left-1.5 w-19 h-19 rounded-full bg-slate-50 dark:bg-[#050508] transition-colors duration-300 -z-10 shadow-md"></div>
            
            {/* Floating central button */}
            <button
              id="nav-stok"
              onClick={() => setActiveTab('stok')}
              className={`flex items-center justify-center w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl transition-all duration-300 transform active:scale-95 hover:scale-110 border-4 border-solid border-red-950 focus:outline-none ${
                activeTab === 'stok' 
                  ? 'animate-pulse-ring bg-red-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                  : ''
              }`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </button>
          </div>
          <span className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-1 drop-shadow uppercase tracking-wider">Data Stock</span>
        </div>

        {/* Right Side Items */}
        <div className="flex w-1/2 justify-around pl-4">
          {/* Riwayat Tab */}
          <button
            id="nav-riwayat"
            onClick={() => setActiveTab('riwayat')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
              activeTab === 'riwayat' 
                ? 'text-yellow-300 bg-red-900/60 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                : 'text-red-300\/70 hover:text-white hover:scale-105'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-6 h-6 mb-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Riwayat</span>
          </button>

          {/* Pengaturan Tab */}
          <button
            id="nav-pengaturan"
            onClick={() => setActiveTab('pengaturan')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
              activeTab === 'pengaturan' 
                ? 'text-yellow-300 bg-red-900/60 scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]' 
                : 'text-red-300\/70 hover:text-white hover:scale-105'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-6 h-6 mb-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Setting</span>
          </button>
        </div>

      </div>
    </div>
  );
}
