import React, { useState } from 'react';
import { Settings, Sliders, Bell, Cpu, Zap, ShieldCheck, Check } from 'lucide-react';
import { SimulationState } from '../types';

interface SettingsViewProps {
  simState: SimulationState;
  onUpdateSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  simState,
  onUpdateSimState,
}) => {
  const [currency, setCurrency] = useState('INR (₹)');
  const [peakRate, setPeakRate] = useState(11.20);
  const [baseRate, setBaseRate] = useState(7.50);
  const [notifications, setNotifications] = useState(true);
  const [autoSolarSync, setAutoSolarSync] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div id="settings-view" className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight">
            System & Tariff Configuration
          </h2>
          <p className="text-xs text-[#8a948e] mt-1">
            Customize utility tariff schedules, smart meter sync parameters, and notification alerts.
          </p>
        </div>

        {/* Tariff Rates */}
        <div className="space-y-3 pt-2 border-t border-[#202723]">
          <h3 className="text-sm font-medium text-white">Utility Tariff Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#181d1b] border border-[#262f2a]">
              <label className="text-[11px] text-[#8a948e] block mb-1">
                Normal / Off-Peak Rate
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-[#8a948e]">₹</span>
                <input
                  type="number"
                  value={baseRate}
                  onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="bg-transparent text-white font-mono text-sm focus:outline-none w-20 font-semibold"
                />
                <span className="text-[11px] text-[#717e76]">/ kWh</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#181d1b] border border-[#262f2a]">
              <label className="text-[11px] text-[#8a948e] block mb-1">
                Peak Window (6:00 PM – 10:00 PM)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-[#8a948e]">₹</span>
                <input
                  type="number"
                  value={peakRate}
                  onChange={(e) => setPeakRate(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="bg-transparent text-amber-300 font-mono text-sm focus:outline-none w-20 font-semibold"
                />
                <span className="text-[11px] text-[#717e76]">/ kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Edge Automation */}
        <div className="space-y-3 pt-2 border-t border-[#202723]">
          <h3 className="text-sm font-medium text-white">Edge Automation & AI</h3>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181d1b] border border-[#262f2a]">
            <div>
              <div className="text-xs font-medium text-white">Auto Solar Peak Shift</div>
              <div className="text-[10px] text-[#8a948e]">Notify or automate washing machines during peak solar</div>
            </div>
            <button
              onClick={() => setAutoSolarSync(!autoSolarSync)}
              className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                autoSolarSync ? 'bg-[#dce8d6]' : 'bg-[#242b27]'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                  autoSolarSync ? 'translate-x-4.5 bg-[#121815]' : 'translate-x-0 bg-[#5c6861]'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181d1b] border border-[#262f2a]">
            <div>
              <div className="text-xs font-medium text-white">Overnight Anomaly Push Alerts</div>
              <div className="text-[10px] text-[#8a948e]">Instant alert if abnormal draw is detected after 11 PM</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors ${
                notifications ? 'bg-[#dce8d6]' : 'bg-[#242b27]'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                  notifications ? 'translate-x-4.5 bg-[#121815]' : 'translate-x-0 bg-[#5c6861]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-3 border-t border-[#202723] flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> Preferences saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors shadow-sm"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
