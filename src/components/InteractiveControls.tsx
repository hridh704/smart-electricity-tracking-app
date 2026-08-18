import React from 'react';
import { Sliders, Sparkles, Thermometer, Home } from 'lucide-react';
import { SimulationState } from '../types';

interface InteractiveControlsProps {
  simState: SimulationState;
  onUpdateSimState: (updater: (prev: SimulationState) => SimulationState) => void;
  onApplyPreset: (preset: 'nominal' | 'peakSurge' | 'nightAnomaly' | 'solarEco') => void;
}

export const InteractiveControls: React.FC<InteractiveControlsProps> = ({
  simState,
  onUpdateSimState,
  onApplyPreset,
}) => {
  const { activeToggles } = simState;

  const toggle = (key: keyof SimulationState['activeToggles']) => {
    onUpdateSimState((prev) => ({
      ...prev,
      activeToggles: {
        ...prev.activeToggles,
        [key]: !prev.activeToggles[key],
      },
    }));
  };

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSimState((prev) => ({ ...prev, ambientTempC: val }));
  };

  const handleBaseLoadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSimState((prev) => ({ ...prev, baseLoadKw: val }));
  };

  return (
    <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            JUDGE SIMULATION & HARDWARE CONTROLS
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            TESTBED
          </span>
        </div>

        {/* Appliance Control Buttons (Crisp terminal buttons) */}
        <div className="p-3 space-y-2 font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. AC */}
            <button
              onClick={() => toggle('airConditioner')}
              className={`p-2 rounded border flex items-center justify-between transition text-left ${
                activeToggles.airConditioner
                  ? 'bg-[#142034] border-cyan-500/50 text-slate-100'
                  : 'bg-[#0c1018] border-[#1e2638] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeToggles.airConditioner ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="font-bold text-[11px]">Air Conditioner</div>
                  <div className="text-[9px] text-slate-400">+2.5 kW Inverter</div>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  activeToggles.airConditioner
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#182030] text-slate-400'
                }`}
              >
                {activeToggles.airConditioner ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* 2. Lights */}
            <button
              onClick={() => toggle('allLightsOff')}
              className={`p-2 rounded border flex items-center justify-between transition text-left ${
                activeToggles.allLightsOff
                  ? 'bg-[#142034] border-cyan-500/50 text-slate-100'
                  : 'bg-[#0c1018] border-[#1e2638] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeToggles.allLightsOff ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="font-bold text-[11px]">Turn Off All Lights</div>
                  <div className="text-[9px] text-slate-400">-0.4 kW Savings</div>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  activeToggles.allLightsOff
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#182030] text-slate-400'
                }`}
              >
                {activeToggles.allLightsOff ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* 3. Water Heater Anomaly (3 AM Spike) */}
          <button
            onClick={() => toggle('waterHeaterAnomaly')}
            className={`w-full p-2 rounded border flex items-center justify-between transition text-left ${
              activeToggles.waterHeaterAnomaly
                ? 'bg-[#29121a] border-rose-600 text-rose-200'
                : 'bg-[#0c1018] border-[#1e2638] text-slate-300 hover:border-rose-900/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeToggles.waterHeaterAnomaly ? 'bg-rose-400 animate-ping' : 'bg-slate-600'
                }`}
              />
              <div>
                <div className="font-bold text-[11px] flex items-center gap-1.5">
                  <span>Water Heater Overnight</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    3 AM Anomaly (+3.2 kW)
                  </span>
                </div>
                <div className="text-[9px] text-slate-400">
                  Simulates continuous geyser draw during 03:00 AM off-peak sleep cycle. Triggers Edge ML.
                </div>
              </div>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                activeToggles.waterHeaterAnomaly
                  ? 'bg-rose-500 text-black font-extrabold'
                  : 'bg-[#182030] text-slate-400'
              }`}
            >
              {activeToggles.waterHeaterAnomaly ? 'SPIKE' : 'SIMULATE'}
            </span>
          </button>

          {/* 4. Solar & EV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => toggle('solarInverter')}
              className={`p-2 rounded border flex items-center justify-between transition text-left ${
                activeToggles.solarInverter
                  ? 'bg-[#142034] border-cyan-500/50 text-slate-100'
                  : 'bg-[#0c1018] border-[#1e2638] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeToggles.solarInverter ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="font-bold text-[11px]">Rooftop Solar</div>
                  <div className="text-[9px] text-slate-400">-1.8 kW Green Offset</div>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  activeToggles.solarInverter
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-[#182030] text-slate-400'
                }`}
              >
                {activeToggles.solarInverter ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => toggle('evCharger')}
              className={`p-2 rounded border flex items-center justify-between transition text-left ${
                activeToggles.evCharger
                  ? 'bg-[#142034] border-cyan-500/50 text-slate-100'
                  : 'bg-[#0c1018] border-[#1e2638] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeToggles.evCharger ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <div className="font-bold text-[11px]">EV Fast Charger</div>
                  <div className="text-[9px] text-slate-400">+4.0 kW Grid Demand</div>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  activeToggles.evCharger
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#182030] text-slate-400'
                }`}
              >
                {activeToggles.evCharger ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Environmental sliders */}
          <div className="grid grid-cols-2 gap-3 bg-[#0c1018] p-2.5 rounded border border-[#1e2638] text-[10px]">
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Ambient Temp</span>
                <span className="text-slate-100 font-bold">{simState.ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="18"
                max="42"
                value={simState.ambientTempC}
                onChange={handleTempChange}
                className="w-full accent-slate-400 h-1 bg-[#1e2638] rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Base Standby</span>
                <span className="text-slate-100 font-bold">{simState.baseLoadKw.toFixed(1)} kW</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={simState.baseLoadKw}
                onChange={handleBaseLoadChange}
                className="w-full accent-slate-400 h-1 bg-[#1e2638] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expo Presets Footer */}
      <div className="p-2.5 border-t border-[#1e2638] bg-[#0c1018] flex flex-wrap items-center justify-between gap-1.5 font-mono text-[10px]">
        <span className="text-slate-400 uppercase font-semibold">PRESETS:</span>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onApplyPreset('nominal')}
            className="px-2 py-0.5 rounded bg-[#151c2c] hover:bg-[#1f283d] text-slate-200 border border-[#222d42]"
          >
            NOMINAL
          </button>
          <button
            onClick={() => onApplyPreset('peakSurge')}
            className="px-2 py-0.5 rounded bg-[#151c2c] hover:bg-[#1f283d] text-amber-300 border border-[#222d42]"
          >
            8PM SURGE
          </button>
          <button
            onClick={() => onApplyPreset('nightAnomaly')}
            className="px-2 py-0.5 rounded bg-[#151c2c] hover:bg-[#1f283d] text-rose-300 border border-[#222d42]"
          >
            3AM SPIKE
          </button>
          <button
            onClick={() => onApplyPreset('solarEco')}
            className="px-2 py-0.5 rounded bg-[#151c2c] hover:bg-[#1f283d] text-emerald-300 border border-[#222d42]"
          >
            SOLAR ECO
          </button>
        </div>
      </div>
    </div>
  );
};
