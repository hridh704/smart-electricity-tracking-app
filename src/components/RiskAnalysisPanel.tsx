import React from 'react';
import { SimulationState, TariffBreakdown } from '../types';

interface RiskAnalysisPanelProps {
  simState: SimulationState;
  currentLoadKw: number;
  tariff: TariffBreakdown;
  anomalyDetected: boolean;
  powerFactor: number;
}

export const RiskAnalysisPanel: React.FC<RiskAnalysisPanelProps> = ({
  simState,
  currentLoadKw,
  tariff,
  anomalyDetected,
  powerFactor,
}) => {
  const isPeak = simState.currentSimHour >= 18 && simState.currentSimHour < 22;

  return (
    <div className="space-y-4">
      {/* Risk Analysis Card */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            EDGE-AI RISK ANALYSIS
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            METRICS
          </span>
        </div>

        <div className="p-3 grid grid-cols-2 gap-y-3 gap-x-4 font-mono">
          {/* Item 1 */}
          <div className="border-b border-[#182030] pb-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              LOAD VOLATILITY
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {currentLoadKw > 4.5 ? '18.4%' : '7.2%'}
            </div>
            <div className="text-[9px] text-slate-400">RMS 24h Normalized</div>
          </div>

          {/* Item 2 */}
          <div className="border-b border-[#182030] pb-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              MAX PEAK DRAW (24H)
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {Math.max(4.8, currentLoadKw + 0.8).toFixed(1)} kW
            </div>
            <div className="text-[9px] text-slate-400">Peak breaker cap 7.5kW</div>
          </div>

          {/* Item 3 */}
          <div className="border-b border-[#182030] pb-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              TOP CONCENTRATION
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {simState.activeToggles.airConditioner
                ? '48%'
                : simState.activeToggles.waterHeaterAnomaly
                ? '54%'
                : '22%'}
            </div>
            <div className="text-[9px] text-slate-400">
              {simState.activeToggles.airConditioner
                ? 'HVAC / Inverter'
                : simState.activeToggles.waterHeaterAnomaly
                ? 'Resistive Geyser'
                : 'Nominal Baseline'}
            </div>
          </div>

          {/* Item 4 */}
          <div className="border-b border-[#182030] pb-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              POWER FACTOR BETA
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {powerFactor.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-400">vs 1.00 Ideal Grid</div>
          </div>

          {/* Item 5 */}
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              ANOMALY Z-SCORE
            </div>
            <div
              className={`text-base font-bold mt-0.5 ${
                anomalyDetected ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {anomalyDetected ? '3.82' : '0.04'}
            </div>
            <div className="text-[9px] text-slate-400">
              {anomalyDetected ? 'Anomaly Breached' : 'σ=1.2 Safe Boundary'}
            </div>
          </div>

          {/* Item 6 */}
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              EDGE INFERENCE
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5">8.4 ms</div>
            <div className="text-[9px] text-slate-400">ESP32 Xtensa Dual-Core</div>
          </div>
        </div>
      </div>

      {/* Top Load Movers / 52W Range Gauges (Identical to reference screenshot) */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            CIRCUIT LOAD SPREAD (24H)
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            DIURNAL
          </span>
        </div>

        <div className="p-3 grid grid-cols-2 gap-3 font-mono text-[10px]">
          {/* Gainer 1 */}
          <div className="bg-[#0c1018] p-2.5 rounded border border-[#182030]">
            <div className="text-slate-400 text-[9px] text-center mb-0.5">▲ SURGE</div>
            <div className="text-center font-bold text-slate-100">AC_INV</div>
            <div className="text-center text-emerald-400 font-bold mb-1.5">+1.16%</div>
            <div className="text-[8px] text-slate-400 text-center mb-1">LOAD RANGE</div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>0.2kW</span>
              <div className="flex-1 mx-2 h-1 bg-[#1e2638] rounded relative">
                <div className="absolute top-[-3px] left-[70%] w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black" />
              </div>
              <span>3.5kW</span>
            </div>
          </div>

          {/* Gainer 2 */}
          <div className="bg-[#0c1018] p-2.5 rounded border border-[#182030]">
            <div className="text-slate-400 text-[9px] text-center mb-0.5">▲ SURGE</div>
            <div className="text-center font-bold text-slate-100">GEYSER</div>
            <div className="text-center text-emerald-400 font-bold mb-1.5">
              {anomalyDetected ? '+3.20kW' : '+0.00kW'}
            </div>
            <div className="text-[8px] text-slate-400 text-center mb-1">LOAD RANGE</div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>0.0kW</span>
              <div className="flex-1 mx-2 h-1 bg-[#1e2638] rounded relative">
                <div
                  className={`absolute top-[-3px] ${
                    anomalyDetected ? 'left-[90%] bg-rose-400' : 'left-[10%] bg-cyan-400'
                  } w-2.5 h-2.5 rounded-full border border-black`}
                />
              </div>
              <span>4.0kW</span>
            </div>
          </div>

          {/* Loser 1 */}
          <div className="bg-[#0c1018] p-2.5 rounded border border-[#182030]">
            <div className="text-slate-400 text-[9px] text-center mb-0.5">▼ OFFSET</div>
            <div className="text-center font-bold text-slate-100">SOLAR_INV</div>
            <div className="text-center text-rose-400 font-bold mb-1.5">-1.80kW</div>
            <div className="text-[8px] text-slate-400 text-center mb-1">GEN RANGE</div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>0.0kW</span>
              <div className="flex-1 mx-2 h-1 bg-[#1e2638] rounded relative">
                <div className="absolute top-[-3px] left-[65%] w-2.5 h-2.5 bg-rose-400 rounded-full border border-black" />
              </div>
              <span>2.5kW</span>
            </div>
          </div>

          {/* Loser 2 */}
          <div className="bg-[#0c1018] p-2.5 rounded border border-[#182030]">
            <div className="text-slate-400 text-[9px] text-center mb-0.5">▼ SAVINGS</div>
            <div className="text-center font-bold text-slate-100">LIGHTS_OFF</div>
            <div className="text-center text-rose-400 font-bold mb-1.5">-0.40kW</div>
            <div className="text-[8px] text-slate-400 text-center mb-1">SAVING RANGE</div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span>0.0kW</span>
              <div className="flex-1 mx-2 h-1 bg-[#1e2638] rounded relative">
                <div className="absolute top-[-3px] left-[80%] w-2.5 h-2.5 bg-rose-400 rounded-full border border-black" />
              </div>
              <span>0.6kW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
