import React from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  activeTab: 'attendance' | 'recap';
  setActiveTab: (tab: 'attendance' | 'recap') => void;
  onResetData: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  soundEnabled,
  setSoundEnabled,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playTap();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="font-extrabold text-xl tracking-tight">H</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                HadirKu
              </span>
              <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider block">
                Presensi Sekolah Digital
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Tabs) */}
          <nav className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => {
                setActiveTab('attendance');
                if (soundEnabled) sounds.playTap();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Formulir & Daftar Hadir
            </button>
            <button
              onClick={() => {
                setActiveTab('recap');
                if (soundEnabled) sounds.playTap();
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                activeTab === 'recap'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Rekapitulasi Kehadiran
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan Suara Interaksi' : 'Aktifkan Suara Interaksi'}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              onClick={onResetData}
              title="Reset ke Data Simulasi Awal"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
