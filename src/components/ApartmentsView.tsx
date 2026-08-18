import React, { useState } from 'react';
import { Home, Building2, CheckCircle2, Plus, Zap, Leaf, ArrowUpRight } from 'lucide-react';
import { SimulationState } from '../types';

interface ApartmentsViewProps {
  simState: SimulationState;
  currentLoadKw: number;
  onSwitchApartment?: (name: string) => void;
}

export const ApartmentsView: React.FC<ApartmentsViewProps> = ({
  simState,
  currentLoadKw,
}) => {
  const [selectedApt, setSelectedApt] = useState('Urban Loft #402');

  const apartments = [
    {
      id: 'apt-1',
      name: 'Urban Loft #402',
      type: 'Primary Residence · 2BHK',
      activeLoad: `${currentLoadKw.toFixed(2)} kW`,
      solarGen: simState.activeToggles.solarInverter ? '1.8 kW' : '0.0 kW',
      monthlyEst: '₹2,450',
      greenScore: '92%',
      status: 'Live Connected',
      isCurrent: true,
    },
    {
      id: 'apt-2',
      name: 'Eco Studio #108',
      type: 'Rental Unit · 1BHK',
      activeLoad: '0.82 kW',
      solarGen: '0.9 kW',
      monthlyEst: '₹840',
      greenScore: '98%',
      status: 'Nominal Standby',
      isCurrent: false,
    },
    {
      id: 'apt-3',
      name: 'Green Villa #12',
      type: 'Suburban Home · 4BHK',
      activeLoad: '3.40 kW',
      solarGen: '3.2 kW',
      monthlyEst: '₹3,180',
      greenScore: '89%',
      status: 'Solar High Export',
      isCurrent: false,
    },
  ];

  return (
    <div id="apartments-view" className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight">
            Multi-Property Energy Portfolio
          </h2>
          <p className="text-xs text-[#8a948e] mt-1">
            Monitor and automate multiple smart meters across your apartments and vacation properties.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors shadow-sm self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Space</span>
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apartments.map((apt) => {
          const isSelected = selectedApt === apt.name;
          return (
            <div
              key={apt.id}
              onClick={() => setSelectedApt(apt.name)}
              className={`rounded-2xl sm:rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#181d1b] border-[#dce8d6]/50 shadow-md transform -translate-y-1'
                  : 'bg-[#141716] border-[#232926] hover:border-[#2f3833]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-[#202723] text-[#dce8d6]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {apt.isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#dce8d6]/15 text-[#dce8d6] border border-[#dce8d6]/30">
                      Active Telemetry
                    </span>
                  )}
                </div>

                <h3 className="text-base font-medium text-white mt-4 tracking-tight">
                  {apt.name}
                </h3>
                <p className="text-xs text-[#8a948e] mt-0.5">{apt.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-[#202723]">
                <div>
                  <span className="text-[10px] text-[#75847b]">Live Net Draw</span>
                  <div className="text-sm font-semibold text-white font-mono">{apt.activeLoad}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#75847b]">Solar Offset</span>
                  <div className="text-sm font-semibold text-[#dce8d6] font-mono">{apt.solarGen}</div>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[#75847b]">Projected Bill</span>
                  <div className="text-sm font-semibold text-white font-mono">{apt.monthlyEst}</div>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] text-[#75847b]">Clean Index</span>
                  <div className="text-sm font-semibold text-emerald-400 font-mono">{apt.greenScore}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
