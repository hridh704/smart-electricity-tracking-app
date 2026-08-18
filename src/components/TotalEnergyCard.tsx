import React from 'react';
import { MoreHorizontal, Maximize2 } from 'lucide-react';
import { SimulationState } from '../types';

interface TotalEnergyCardProps {
  simState: SimulationState;
  onOpenModuleModal: () => void;
  currentLoadKw: number;
  onCardClick?: () => void;
}

export const TotalEnergyCard: React.FC<TotalEnergyCardProps> = ({
  simState,
  onOpenModuleModal,
  currentLoadKw,
  onCardClick,
}) => {
  // Bar profiles for the vertical bar chart graphics
  const lightingBars = [12, 18, 26, 32, 28, 22, 45, 60, 78, 92, 70, 48];
  const fridgeBars = [28, 30, 29, 31, 35, 48, 55, 62, 58, 44, 36, 32];
  const acBars = [15, 20, 25, 30, 45, 65, 88, 98, 85, 68, 52, 38];

  return (
    <div
      id="total-energy-consumption-card"
      onClick={onCardClick}
      className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#38483e] hover:shadow-lg cursor-pointer group relative overflow-hidden"
    >
      {/* Zoom icon in top right */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202723] p-1.5 rounded-full text-[#dce8d6] border border-[#303d35] z-10">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pr-6">
        <div>
          <h2 className="text-lg sm:text-xl font-normal text-white tracking-tight">
            Total energy consumption
          </h2>
          <p className="text-[11px] text-[#7d8c83]">
            Click for full NILM sub-circuit breakdown
          </p>
        </div>

        <button
          id="btn-change-module"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModuleModal();
          }}
          className="px-3.5 py-1 rounded-full bg-[#181d1b] border border-[#2d3630] text-xs text-[#d1dbd4] hover:text-white hover:border-[#404c44] hover:bg-[#202723] transition-all cursor-pointer"
        >
          Change module
        </button>
      </div>

      {/* 3 Appliance Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 my-auto pt-2">
        {/* Column 1: Lighting */}
        <div id="appliance-col-lighting" className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#a3afa8] mb-3">
            <span className="flex items-center gap-1 font-medium text-[#dce8d6]">
              Lighting <span className="text-emerald-400">↑</span>
            </span>
            <button className="text-[#65716a] hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-28 flex items-end justify-between gap-1 px-1 py-1 border-b border-[#232926]">
            {lightingBars.map((heightPercent, idx) => (
              <div
                key={idx}
                className="w-1.5 sm:w-1 bg-white rounded-t-sm transition-all duration-300 hover:bg-[#dce8d6]"
                style={{ height: `${heightPercent}%`, opacity: idx >= 6 ? 1 : 0.35 }}
                title={`Hour ${idx * 2}:00 — ${(heightPercent * 0.8).toFixed(1)}W`}
              />
            ))}
          </div>

          {/* Numbers */}
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              52–71
            </div>
            <div className="text-[11px] text-[#8a948e] mt-0.5">
              kWh per month
            </div>
          </div>
        </div>

        {/* Column 2: Refrigerator */}
        <div id="appliance-col-refrigerator" className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#a3afa8] mb-3">
            <span className="flex items-center gap-1 font-medium text-[#dce8d6]">
              Refrigerator <span className="text-amber-400">↓</span>
            </span>
            <button className="text-[#65716a] hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-28 flex items-end justify-between gap-1 px-1 py-1 border-b border-[#232926]">
            {fridgeBars.map((heightPercent, idx) => (
              <div
                key={idx}
                className="w-1.5 sm:w-1 bg-white rounded-t-sm transition-all duration-300 hover:bg-[#dce8d6]"
                style={{ height: `${heightPercent}%`, opacity: idx >= 4 ? 1 : 0.35 }}
                title={`Fridge Inverter: ${heightPercent}%`}
              />
            ))}
          </div>

          {/* Numbers */}
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              29–37
            </div>
            <div className="text-[11px] text-[#8a948e] mt-0.5">
              kWh per month
            </div>
          </div>
        </div>

        {/* Column 3: Air Conditioner */}
        <div id="appliance-col-ac" className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#a3afa8] mb-3">
            <span className="flex items-center gap-1 font-medium text-[#dce8d6]">
              Air Conditioner <span className="text-sky-400">↓</span>
            </span>
            <button className="text-[#65716a] hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-28 flex items-end justify-between gap-1 px-1 py-1 border-b border-[#232926]">
            {acBars.map((heightPercent, idx) => (
              <div
                key={idx}
                className={`w-1.5 sm:w-1 rounded-t-sm transition-all duration-300 hover:bg-[#dce8d6] ${
                  simState.activeToggles.airConditioner && idx >= 6 ? 'bg-[#dce8d6]' : 'bg-white'
                }`}
                style={{ height: `${heightPercent}%`, opacity: idx >= 5 ? 1 : 0.35 }}
                title={`HVAC Compressor: ${heightPercent}%`}
              />
            ))}
          </div>

          {/* Numbers */}
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              {simState.activeToggles.airConditioner ? '74–112' : '49–85'}
            </div>
            <div className="text-[11px] text-[#8a948e] mt-0.5">
              kWh per month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
