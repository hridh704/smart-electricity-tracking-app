import React from 'react';
import { NavTab, SimulationState, TariffBreakdown } from '../types';
import { SlidersHorizontal, Table, Sparkles, Home, BarChart3, Settings, Download, FileCode } from 'lucide-react';
import { exportSingleFileHtml } from '../utils/exportHtml';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  simState: SimulationState;
  onOpenModuleModal: () => void;
  tariff: TariffBreakdown;
  currentLoadKw: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  simState,
  onOpenModuleModal,
  tariff,
  currentLoadKw,
}) => {
  // Format current sim time
  const formattedHours = simState.currentSimHour % 12 || 12;
  const ampm = simState.currentSimHour >= 12 ? 'PM' : 'AM';
  const formattedMinutes = String(simState.currentSimMinute).padStart(2, '0');
  const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-8 border-b border-[#232825]">
      {/* Top Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Minimalist Pebble Logo */}
          <div
            id="brand-logo"
            onClick={() => onSelectTab('dashboard')}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#dce8d6] text-[#121815] flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L4 7V17L12 22L20 17V7L12 2Z"
                  stroke="#121815"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="#121815" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-white hidden md:inline text-sm">
              SmartEnergy
            </span>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8a948e] hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>

            <button
              id="nav-tab-apartments"
              onClick={() => onSelectTab('apartments')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'apartments'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8a948e] hover:text-white hover:bg-white/5'
              }`}
            >
              My apartments
            </button>

            <button
              id="nav-tab-spreadsheet"
              onClick={() => onSelectTab('spreadsheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'spreadsheet'
                  ? 'bg-[#dce8d6] text-[#121815] font-semibold shadow-sm'
                  : 'text-[#8a948e] hover:text-white hover:bg-white/5'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Spreadsheet
            </button>

            <button
              id="nav-tab-reporting"
              onClick={() => onSelectTab('reporting')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'reporting'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8a948e] hover:text-white hover:bg-white/5'
              }`}
            >
              Reporting
            </button>

            <button
              id="nav-tab-settings"
              onClick={() => onSelectTab('settings')}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#8a948e] hover:text-white hover:bg-white/5'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Right side quick actions: Export Single File HTML & Simulation trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Standalone Single File HTML Export Button */}
          <button
            id="btn-export-single-html"
            onClick={() => exportSingleFileHtml(simState, tariff, currentLoadKw)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b221e] border border-[#2d3a31] text-[#dce8d6] text-xs font-semibold hover:bg-[#253229] hover:text-white hover:border-[#3d4d42] transition-all shadow-sm"
            title="Download full standalone single-file HTML"
          >
            <FileCode className="w-3.5 h-3.5 text-[#dce8d6]" />
            <span className="hidden sm:inline">Export HTML</span>
          </button>

          <button
            id="btn-quick-module"
            onClick={onOpenModuleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b201e] border border-[#2b332e] text-[#c2cbc5] text-xs font-medium hover:text-white hover:border-[#3d4741] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate</span>
          </button>

          {simState.anomalyFlagged && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/70 text-rose-300 border border-rose-800/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Alert
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Live Time Row */}
      <div className="flex items-end justify-between mt-6 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
            {currentTab === 'dashboard' && 'Overview'}
            {currentTab === 'apartments' && 'My Apartments & Spaces'}
            {currentTab === 'spreadsheet' && 'Daily Energy Spreadsheet'}
            {currentTab === 'reporting' && 'Energy Analytics & Export'}
            {currentTab === 'settings' && 'System Preferences'}
          </h1>
        </div>

        <div className="flex items-baseline gap-2 text-right">
          <span className="text-2xl sm:text-3xl font-light tracking-tight text-white font-mono">
            {timeString}
          </span>
          <span className="text-xs font-normal text-[#8a948e] uppercase tracking-wider">
            Time
          </span>
        </div>
      </div>
    </header>
  );
};
