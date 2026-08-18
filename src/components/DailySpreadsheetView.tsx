import React, { useState, useMemo } from 'react';
import {
  Download,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Sun,
  Zap,
  DollarSign,
  Leaf,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { DaySpreadsheetRow, SimulationState } from '../types';
import { generateDailySpreadsheetData, exportSpreadsheetToCsv } from '../utils/spreadsheetData';

interface DailySpreadsheetViewProps {
  simState: SimulationState;
  onUpdateSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const DailySpreadsheetView: React.FC<DailySpreadsheetViewProps> = ({
  simState,
  onUpdateSimState,
}) => {
  const [dataRows, setDataRows] = useState<DaySpreadsheetRow[]>(() =>
    generateDailySpreadsheetData(simState)
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeScenario, setActiveScenario] = useState<'nominal' | 'summer' | 'solar' | 'anomaly'>('nominal');

  // Regenerate when sim state toggles change
  const handleRegenerate = () => {
    setDataRows(generateDailySpreadsheetData(simState));
  };

  // Filter rows based on search and status
  const filteredRows = useMemo(() => {
    return dataRows.filter((row) => {
      const matchesSearch =
        row.timeSlot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.primaryAppliance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.status.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'peak') return matchesSearch && row.status === 'Peak Tariff';
      if (filterStatus === 'solar') return matchesSearch && row.status === 'Solar High';
      if (filterStatus === 'anomaly') return matchesSearch && row.status === 'Anomaly Alert';
      return matchesSearch;
    });
  }, [dataRows, searchTerm, filterStatus]);

  // Aggregate daily statistics
  const dailyStats = useMemo(() => {
    const totalActiveKwh = dataRows.reduce((sum, r) => sum + r.activeLoadKw, 0);
    const totalSolarKwh = dataRows.reduce((sum, r) => sum + r.solarKw, 0);
    const totalNetKwh = dataRows.reduce((sum, r) => sum + r.netGridKw, 0);
    const totalCostInr = dataRows.reduce((sum, r) => sum + r.hourlyCostInr, 0);
    const totalCo2Kg = dataRows.reduce((sum, r) => sum + r.co2Grams, 0) / 1000;
    const solarOffsetPct = totalActiveKwh > 0 ? Math.round((totalSolarKwh / totalActiveKwh) * 100) : 0;
    const anomalyCount = dataRows.filter((r) => r.status === 'Anomaly Alert').length;

    return {
      totalActiveKwh: Number(totalActiveKwh.toFixed(1)),
      totalSolarKwh: Number(totalSolarKwh.toFixed(1)),
      totalNetKwh: Number(totalNetKwh.toFixed(1)),
      totalCostInr: Number(totalCostInr.toFixed(2)),
      totalCo2Kg: Number(totalCo2Kg.toFixed(1)),
      solarOffsetPct,
      anomalyCount,
    };
  }, [dataRows]);

  // Preset Scenario Handler
  const handleApplyScenario = (scenario: 'nominal' | 'summer' | 'solar' | 'anomaly') => {
    setActiveScenario(scenario);
    if (scenario === 'summer') {
      onUpdateSimState((prev) => ({
        ...prev,
        ambientTempC: 38,
        activeToggles: {
          ...prev.activeToggles,
          airConditioner: true,
          waterHeaterAnomaly: false,
          solarInverter: true,
        },
      }));
    } else if (scenario === 'solar') {
      onUpdateSimState((prev) => ({
        ...prev,
        activeToggles: {
          ...prev.activeToggles,
          airConditioner: false,
          waterHeaterAnomaly: false,
          solarInverter: true,
          allLightsOff: true,
        },
      }));
    } else if (scenario === 'anomaly') {
      onUpdateSimState((prev) => ({
        ...prev,
        activeToggles: {
          ...prev.activeToggles,
          waterHeaterAnomaly: true,
        },
      }));
    } else {
      onUpdateSimState((prev) => ({
        ...prev,
        ambientTempC: 28,
        activeToggles: {
          airConditioner: false,
          allLightsOff: false,
          waterHeaterAnomaly: false,
          evCharger: false,
          solarInverter: true,
          inductionCooktop: false,
        },
      }));
    }
  };

  // Inline value editor for millennial exploration
  const handleUpdateRowKw = (id: string, newKw: number) => {
    setDataRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const clamped = Math.max(0.1, newKw);
          const net = Math.max(0.05, clamped - r.solarKw);
          const cost = Number((net * r.tariffRateInr).toFixed(2));
          return {
            ...r,
            activeLoadKw: Number(clamped.toFixed(2)),
            netGridKw: Number(net.toFixed(2)),
            hourlyCostInr: cost,
          };
        }
        return r;
      })
    );
  };

  return (
    <div id="daily-spreadsheet-view" className="space-y-4 animate-fadeIn">
      {/* Top Banner & Scenario Selectors */}
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-normal text-white tracking-tight">
                24-Hour Telemetry Spreadsheet
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#dce8d6]/10 text-[#cfe0c9] border border-[#cfe0c9]/20">
                Sample Day Dataset
              </span>
            </div>
            <p className="text-xs text-[#8a948e] mt-1">
              Hourly power disaggregation, grid tariff calculation (INR), solar generation, and smart appliance logging.
            </p>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#717e76] mr-1 hidden sm:inline">Scenario:</span>
            <button
              onClick={() => handleApplyScenario('nominal')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeScenario === 'nominal'
                  ? 'bg-[#dce8d6] text-[#121815] font-semibold'
                  : 'bg-[#1a201d] text-[#95a39a] border border-[#2b3530] hover:text-white'
              }`}
            >
              Standard Day
            </button>

            <button
              onClick={() => handleApplyScenario('solar')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeScenario === 'solar'
                  ? 'bg-[#dce8d6] text-[#121815] font-semibold'
                  : 'bg-[#1a201d] text-[#95a39a] border border-[#2b3530] hover:text-white'
              }`}
            >
              Sunny Eco Day
            </button>

            <button
              onClick={() => handleApplyScenario('summer')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeScenario === 'summer'
                  ? 'bg-[#dce8d6] text-[#121815] font-semibold'
                  : 'bg-[#1a201d] text-[#95a39a] border border-[#2b3530] hover:text-white'
              }`}
            >
              Summer AC Surge
            </button>

            <button
              onClick={() => handleApplyScenario('anomaly')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeScenario === 'anomaly'
                  ? 'bg-rose-900 text-rose-100 font-semibold border border-rose-700'
                  : 'bg-[#1a201d] text-[#95a39a] border border-[#2b3530] hover:text-white'
              }`}
            >
              3 AM Anomaly Leak
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#202723]">
          <div className="bg-[#181d1b] border border-[#262f2a] rounded-xl p-3">
            <span className="text-[11px] text-[#8a948e] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Total Day Consumption
            </span>
            <div className="text-xl font-medium text-white mt-1 font-mono">
              {dailyStats.totalActiveKwh} <span className="text-xs font-normal text-[#8a948e]">kWh</span>
            </div>
            <div className="text-[10px] text-[#6b7770] mt-0.5">
              Net Grid: {dailyStats.totalNetKwh} kWh
            </div>
          </div>

          <div className="bg-[#181d1b] border border-[#262f2a] rounded-xl p-3">
            <span className="text-[11px] text-[#8a948e] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Estimated Daily Cost
            </span>
            <div className="text-xl font-medium text-white mt-1 font-mono">
              ₹{dailyStats.totalCostInr}
            </div>
            <div className="text-[10px] text-[#6b7770] mt-0.5">
              Avg ₹{(dailyStats.totalCostInr / 24).toFixed(1)}/hr
            </div>
          </div>

          <div className="bg-[#181d1b] border border-[#262f2a] rounded-xl p-3">
            <span className="text-[11px] text-[#8a948e] flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#dce8d6]" /> Solar Generation
            </span>
            <div className="text-xl font-medium text-[#dce8d6] mt-1 font-mono">
              {dailyStats.totalSolarKwh} <span className="text-xs font-normal text-[#8a948e]">kWh</span>
            </div>
            <div className="text-[10px] text-[#6b7770] mt-0.5">
              {dailyStats.solarOffsetPct}% Clean Offset
            </div>
          </div>

          <div className="bg-[#181d1b] border border-[#262f2a] rounded-xl p-3">
            <span className="text-[11px] text-[#8a948e] flex items-center gap-1">
              <Leaf className="w-3 h-3 text-teal-400" /> Carbon Footprint
            </span>
            <div className="text-xl font-medium text-white mt-1 font-mono">
              {dailyStats.totalCo2Kg} <span className="text-xs font-normal text-[#8a948e]">kg CO₂</span>
            </div>
            <div className="text-[10px] text-[#6b7770] mt-0.5">
              {dailyStats.anomalyCount > 0 ? `${dailyStats.anomalyCount} Anomaly alerts` : '100% nominal grid'}
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Toolbar (Search, Filters, Export) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141716] border border-[#232926] rounded-2xl p-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6c7871]" />
          <input
            id="spreadsheet-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search appliance, hour, status..."
            className="w-full bg-[#181d1b] border border-[#29322e] rounded-full py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#68736d] focus:outline-none focus:border-[#dce8d6]"
          />
        </div>

        {/* Filter Pills & Export CSV Button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-[#8a948e] hover:text-white'
              }`}
            >
              All (24)
            </button>
            <button
              onClick={() => setFilterStatus('peak')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === 'peak'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'text-[#8a948e] hover:text-white'
              }`}
            >
              Peak Hours
            </button>
            <button
              onClick={() => setFilterStatus('solar')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === 'solar'
                  ? 'bg-[#dce8d6]/20 text-[#dce8d6] border border-[#dce8d6]/30'
                  : 'text-[#8a948e] hover:text-white'
              }`}
            >
              Solar High
            </button>
            <button
              onClick={() => setFilterStatus('anomaly')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === 'anomaly'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                  : 'text-[#8a948e] hover:text-white'
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            id="btn-export-csv"
            onClick={() => exportSpreadsheetToCsv(dataRows)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors shadow-sm cursor-pointer ml-auto sm:ml-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {/* Table Header (Excel / Sheets aesthetic) */}
            <thead className="bg-[#181d1b] text-[#95a29a] font-medium sticky top-0 z-10 border-b border-[#262f2a]">
              <tr>
                <th className="py-3 px-3.5 font-semibold text-white">Time Slot</th>
                <th className="py-3 px-3">Active Load</th>
                <th className="py-3 px-3">Solar (kW)</th>
                <th className="py-3 px-3">Net Grid</th>
                <th className="py-3 px-3 hidden md:table-cell">Voltage / Amps</th>
                <th className="py-3 px-3 hidden lg:table-cell">Power Factor</th>
                <th className="py-3 px-3">Tariff (₹/kWh)</th>
                <th className="py-3 px-3 font-semibold text-white">Cost (₹)</th>
                <th className="py-3 px-3.5">Primary Load / Appliance</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#1f2622] text-[#d6dfd9]">
              {filteredRows.map((row, index) => {
                const isCurrentSimHour = simState.currentSimHour === row.hour;
                const isPeak = row.status === 'Peak Tariff';
                const isAnomaly = row.status === 'Anomaly Alert';
                const isSolar = row.status === 'Solar High';

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors duration-150 group ${
                      isCurrentSimHour
                        ? 'bg-[#dce8d6]/10 text-white font-medium'
                        : index % 2 === 0
                        ? 'bg-[#141716] hover:bg-[#191e1c]'
                        : 'bg-[#161a18] hover:bg-[#1a211e]'
                    }`}
                  >
                    {/* Time Slot */}
                    <td className="py-2.5 px-3.5 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isCurrentSimHour && (
                          <span className="w-2 h-2 rounded-full bg-[#dce8d6] animate-ping" />
                        )}
                        <span className={isCurrentSimHour ? 'text-[#dce8d6] font-bold' : 'text-white'}>
                          {row.timeSlot}
                        </span>
                      </div>
                    </td>

                    {/* Active Load (Interactive input on click) */}
                    <td className="py-2.5 px-3 font-mono font-medium text-white">
                      <div className="flex items-center gap-1">
                        <span>{row.activeLoadKw}</span>
                        <span className="text-[10px] text-[#78857e]">kW</span>
                      </div>
                    </td>

                    {/* Solar Gen */}
                    <td className="py-2.5 px-3 font-mono">
                      {row.solarKw > 0 ? (
                        <span className="text-[#dce8d6] font-medium flex items-center gap-0.5">
                          <Sun className="w-2.5 h-2.5" /> +{row.solarKw}
                        </span>
                      ) : (
                        <span className="text-[#59665f]">—</span>
                      )}
                    </td>

                    {/* Net Grid Power */}
                    <td className="py-2.5 px-3 font-mono">
                      <span className={row.netGridKw > 4.0 ? 'text-amber-300 font-bold' : 'text-[#c2cec6]'}>
                        {row.netGridKw} kW
                      </span>
                    </td>

                    {/* Voltage & Current */}
                    <td className="py-2.5 px-3 font-mono text-[#8a9890] hidden md:table-cell">
                      {row.voltageV}V · {row.currentA}A
                    </td>

                    {/* Power Factor */}
                    <td className="py-2.5 px-3 font-mono text-[#8a9890] hidden lg:table-cell">
                      {row.powerFactor}
                    </td>

                    {/* Tariff Rate */}
                    <td className="py-2.5 px-3 font-mono">
                      <span className={isPeak ? 'text-amber-400 font-medium' : 'text-[#a2b0a7]'}>
                        ₹{row.tariffRateInr.toFixed(2)}
                      </span>
                    </td>

                    {/* Hourly Cost in INR */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">
                      ₹{row.hourlyCostInr.toFixed(2)}
                    </td>

                    {/* Primary Appliance */}
                    <td className="py-2.5 px-3.5 text-[#a8b8ae]">
                      <span className="text-[11px] truncate max-w-[200px] block">
                        {row.primaryAppliance}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isAnomaly && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/60">
                          <AlertTriangle className="w-2.5 h-2.5" /> Anomaly
                        </span>
                      )}
                      {isPeak && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                          Peak Tariff
                        </span>
                      )}
                      {isSolar && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#dce8d6]/15 text-[#dce8d6] border border-[#dce8d6]/30">
                          Solar Max
                        </span>
                      )}
                      {row.status === 'Normal' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1d2420] text-[#7e8e84]">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
