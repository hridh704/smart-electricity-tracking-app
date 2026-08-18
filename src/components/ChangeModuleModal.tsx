import React from 'react';
import { X, Zap, Sun, AlertTriangle, Wind, Lightbulb, BatteryCharging, Flame, Play, Pause, FastForward } from 'lucide-react';
import { SimulationState } from '../types';

interface ChangeModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  simState: SimulationState;
  onUpdateSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onApplyPreset: (preset: 'nominal' | 'peakSurge' | 'nightAnomaly' | 'solarEco') => void;
}

export const ChangeModuleModal: React.FC<ChangeModuleModalProps> = ({
  isOpen,
  onClose,
  simState,
  onUpdateSimState,
  onApplyPreset,
}) => {
  if (!isOpen) return null;

  const toggleAppliance = (key: keyof SimulationState['activeToggles']) => {
    onUpdateSimState((prev) => ({
      ...prev,
      activeToggles: {
        ...prev.activeToggles,
        [key]: !prev.activeToggles[key],
      },
    }));
  };

  const handleSpeedChange = (speed: number) => {
    onUpdateSimState((prev) => ({
      ...prev,
      simSpeedMultiplier: speed,
    }));
  };

  const handleTogglePause = () => {
    onUpdateSimState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        id="change-module-dialog"
        className="bg-[#141716] border border-[#262f2b] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-normal text-white tracking-tight">
              Appliance & Load Simulation
            </h3>
            <p className="text-xs text-[#8a948e] mt-0.5">
              Toggle smart devices to see real-time impact on energy and tariff.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1b211e] text-[#8a948e] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[11px] font-medium text-[#7d8c83] uppercase tracking-wider block mb-2">
            One-Click Scenarios
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onApplyPreset('nominal');
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-[#1a201d] border border-[#2b3530] text-xs font-medium text-[#c4d1c8] hover:text-white hover:border-[#3e4d46] transition-all text-left"
            >
              🌱 Standard Baseline
            </button>
            <button
              onClick={() => {
                onApplyPreset('solarEco');
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-[#1a201d] border border-[#2b3530] text-xs font-medium text-[#c4d1c8] hover:text-white hover:border-[#3e4d46] transition-all text-left"
            >
              ☀️ Midday Solar Peak
            </button>
            <button
              onClick={() => {
                onApplyPreset('peakSurge');
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-[#1a201d] border border-[#2b3530] text-xs font-medium text-[#c4d1c8] hover:text-white hover:border-[#3e4d46] transition-all text-left"
            >
              ⚡ Evening Peak Surge
            </button>
            <button
              onClick={() => {
                onApplyPreset('nightAnomaly');
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs font-medium text-rose-300 hover:bg-rose-900/50 transition-all text-left"
            >
              🚨 3 AM Water Heater Leak
            </button>
          </div>
        </div>

        {/* Appliance Switches */}
        <div>
          <label className="text-[11px] font-medium text-[#7d8c83] uppercase tracking-wider block mb-2">
            Interactive Appliance Modifiers
          </label>
          <div className="space-y-2">
            {/* Air Conditioner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181d1b] border border-[#242c27]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#202723] text-sky-400">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Air Conditioner (HVAC)</div>
                  <div className="text-[10px] text-[#808d85]">+2.5 kW load</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleAppliance('airConditioner')}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                  simState.activeToggles.airConditioner ? 'bg-[#dce8d6]' : 'bg-[#242b27]'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    simState.activeToggles.airConditioner
                      ? 'translate-x-4.5 bg-[#121815]'
                      : 'translate-x-0 bg-[#5c6861]'
                  }`}
                />
              </button>
            </div>

            {/* Rooftop Solar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181d1b] border border-[#242c27]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#202723] text-[#dce8d6]">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Rooftop Solar Inverter</div>
                  <div className="text-[10px] text-[#808d85]">Up to -2.4 kW green offset</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleAppliance('solarInverter')}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                  simState.activeToggles.solarInverter ? 'bg-[#dce8d6]' : 'bg-[#242b27]'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    simState.activeToggles.solarInverter
                      ? 'translate-x-4.5 bg-[#121815]'
                      : 'translate-x-0 bg-[#5c6861]'
                  }`}
                />
              </button>
            </div>

            {/* Water Heater Anomaly */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181d1b] border border-[#242c27]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#202723] text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Water Heater Overnight Anomaly</div>
                  <div className="text-[10px] text-[#808d85]">+3.2 kW unintended continuous draw</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleAppliance('waterHeaterAnomaly')}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                  simState.activeToggles.waterHeaterAnomaly ? 'bg-rose-500' : 'bg-[#242b27]'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    simState.activeToggles.waterHeaterAnomaly
                      ? 'translate-x-4.5 bg-white'
                      : 'translate-x-0 bg-[#5c6861]'
                  }`}
                />
              </button>
            </div>

            {/* EV Charger */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#181d1b] border border-[#242c27]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#202723] text-emerald-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">EV Fast Charger</div>
                  <div className="text-[10px] text-[#808d85]">+4.0 kW Level-2 charging</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleAppliance('evCharger')}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                  simState.activeToggles.evCharger ? 'bg-[#dce8d6]' : 'bg-[#242b27]'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                    simState.activeToggles.evCharger
                      ? 'translate-x-4.5 bg-[#121815]'
                      : 'translate-x-0 bg-[#5c6861]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Speed & Clock */}
        <div className="flex items-center justify-between pt-2 border-t border-[#202723]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePause}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 ${
                simState.isPaused
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                  : 'bg-[#1b211e] text-[#b2beb7] border-[#29322e] hover:text-white'
              }`}
            >
              {simState.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{simState.isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {[1, 5, 10, 30].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  simState.simSpeedMultiplier === spd
                    ? 'bg-[#dce8d6] text-[#121815] font-bold'
                    : 'bg-[#181d1b] text-[#7d8c83] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
