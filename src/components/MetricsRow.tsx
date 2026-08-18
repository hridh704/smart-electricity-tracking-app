import React from 'react';
import { Zap, IndianRupee, ShieldCheck, AlertTriangle, AlertCircle, TrendingUp, Gauge, Activity } from 'lucide-react';
import { TariffBreakdown } from '../types';

interface MetricsRowProps {
  currentLoadKw: number;
  voltageV: number;
  currentAmps: number;
  powerFactor: number;
  tariff: TariffBreakdown;
  anomalyDetected: boolean;
  anomalyReason: string;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
  currentLoadKw,
  voltageV,
  currentAmps,
  powerFactor,
  tariff,
  anomalyDetected,
  anomalyReason,
}) => {
  // Load gauge percentage (0 to 8 kW range)
  const loadPercentage = Math.min(100, Math.max(5, (currentLoadKw / 7.5) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Current House Load Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-slate-950/40 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Current House Load
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active RMS
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400 tracking-tight">
            {currentLoadKw.toFixed(2)}
          </span>
          <span className="text-lg font-bold text-slate-400 font-mono">kW</span>
        </div>

        {/* Live Sub-metrics */}
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mt-1">
          <div>
            <div className="text-slate-500 text-[10px]">CURRENT</div>
            <div className="font-mono text-slate-200 font-bold">{currentAmps.toFixed(1)} A</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">VOLTAGE</div>
            <div className="font-mono text-slate-200 font-bold">{voltageV.toFixed(1)} V</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">PWR FACTOR</div>
            <div className="font-mono text-slate-200 font-bold">{powerFactor.toFixed(2)}</div>
          </div>
        </div>

        {/* Load Bar Gauge */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
            <span>0.0 kW (Base)</span>
            <span className={currentLoadKw > 5.0 ? "text-rose-400 font-bold" : "text-slate-400"}>
              {currentLoadKw.toFixed(1)} / 7.5 kW Cap
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentLoadKw > 5.5
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : currentLoadKw > 3.0
                  ? "bg-gradient-to-r from-emerald-500 to-amber-400"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{ width: `${loadPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Estimated Monthly Bill Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-slate-950/40 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-sky-400" />
            Estimated Monthly Bill
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
              tariff.isPeakHour
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-sky-500/10 text-sky-400 border-sky-500/20"
            }`}
          >
            {tariff.isPeakHour ? "Peak Rate ₹11.20" : "Base Rate ₹7.50"}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-sky-400 font-mono">₹</span>
          <span className="text-4xl sm:text-5xl font-extrabold font-mono text-sky-400 tracking-tight">
            {tariff.projectedMonthlyInr.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Live Sub-metrics */}
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mt-1">
          <div>
            <div className="text-slate-500 text-[10px]">PROJECTED</div>
            <div className="font-mono text-slate-200 font-bold">{tariff.projectedMonthlyKwh} kWh</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">DAILY RUN</div>
            <div className="font-mono text-slate-200 font-bold">₹{tariff.dailyCostInr}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">POTENTIAL SAVE</div>
            <div className="font-mono text-emerald-400 font-bold">₹{tariff.potentialSavingsInr}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-400" />
            Tier Slab + 9% Duty Included
          </span>
          <span className="text-slate-400 font-mono">CO₂: {tariff.co2EmissionsKgPerMonth} kg/mo</span>
        </div>
      </div>

      {/* 3. Algorithmic Status Badge Card */}
      <div
        className={`bg-slate-900/90 border rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-slate-950/40 transition group ${
          anomalyDetected
            ? "border-rose-700/80 bg-gradient-to-b from-rose-950/20 to-slate-900"
            : currentLoadKw > 5.5
            ? "border-amber-700/80"
            : "border-slate-800 hover:border-slate-700/80"
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Algorithmic Status Badge
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            TinyML Inference
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-2 mt-1">
          {anomalyDetected ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-2 tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
              🚨 ANOMALY FLAGGED
            </span>
          ) : currentLoadKw > 5.5 ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-2 tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              ⚠️ HIGH LOAD WARNING
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              NOMINAL OPERATION
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 mt-2 min-h-[38px] leading-relaxed line-clamp-2">
          {anomalyDetected ? (
            <span className="text-rose-300 font-medium">{anomalyReason}</span>
          ) : currentLoadKw > 5.5 ? (
            <span className="text-amber-300 font-medium">
              High concurrent load. Edge detector is monitoring circuit limits.
            </span>
          ) : (
            <span className="text-slate-400">
              Edge AutoEncoder Z-Score: 0.04 (Within σ=1.2 baseline boundary. Zero anomalous spikes detected.)
            </span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-2">
          <div>
            <span className="text-slate-500 text-[10px]">MODEL: </span>
            <span className="font-mono text-slate-200 font-medium">AutoEncoder-8KB</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px]">LATENCY: </span>
            <span className="font-mono text-emerald-400 font-bold">8.4 ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
