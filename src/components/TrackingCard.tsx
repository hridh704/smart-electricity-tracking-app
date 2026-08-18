import React from 'react';
import { MoreHorizontal, Sun, Maximize2 } from 'lucide-react';
import { SimulationState } from '../types';

interface TrackingCardProps {
  simState: SimulationState;
  currentLoadKw: number;
  onCardClick?: () => void;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({
  simState,
  currentLoadKw,
  onCardClick,
}) => {
  const isSolarActive = simState.activeToggles.solarInverter;

  return (
    <div
      id="tracking-card"
      onClick={onCardClick}
      className="bg-[#dce8d6] text-[#121815] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-[#e4ede0] shadow-sm relative overflow-hidden group cursor-pointer"
    >
      {/* Zoom icon in top right */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#c8d8c2] p-1.5 rounded-full text-[#142018] border border-[#b6cbaf]">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pr-6">
          <h2 className="text-lg sm:text-xl font-normal tracking-tight text-[#121815]">
            Tracking
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.();
            }}
            className="text-[#2a362f] hover:text-black transition-colors p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#3b4b41] mt-1 font-medium">
          Solar energy tomorrow
        </p>
      </div>

      {/* Big Display Number matching reference screenshot */}
      <div className="mt-8 sm:mt-10">
        <div className="text-4xl sm:text-5xl font-light tracking-tight text-[#121815] leading-none">
          {isSolarActive ? '6.4' : '5.7'}
        </div>
        <div className="text-xs sm:text-sm text-[#485b4f] mt-1.5 font-mono">
          kWh
        </div>
      </div>

      {/* Bottom context pill */}
      <div className="mt-4 pt-3 border-t border-[#c6d6bf]/80 flex items-center justify-between text-[11px] text-[#3b4d41]">
        <span className="flex items-center gap-1">
          <Sun className="w-3.5 h-3.5 text-[#2d4034]" />
          Forecast +18%
        </span>
        <span className="font-mono font-medium">
          Net: {currentLoadKw.toFixed(2)} kW
        </span>
      </div>
    </div>
  );
};
