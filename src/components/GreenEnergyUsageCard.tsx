import React from 'react';
import { Leaf, Maximize2 } from 'lucide-react';
import { SimulationState } from '../types';

interface GreenEnergyUsageCardProps {
  simState: SimulationState;
  onCardClick?: () => void;
}

export const GreenEnergyUsageCard: React.FC<GreenEnergyUsageCardProps> = ({
  simState,
  onCardClick,
}) => {
  const isSolar = simState.activeToggles.solarInverter;
  const percentage = isSolar ? 68 : 47;

  const timelineNodes = [
    { label: '11AM', isHollow: true },
    { label: '11AM', isHollow: false },
    { label: '12PM', isHollow: false },
    { label: '1PM', isHollow: false },
    { label: '2PM', isHollow: false },
  ];

  return (
    <div
      id="green-energy-usage-card"
      onClick={onCardClick}
      className="bg-[#dce8d6] text-[#121815] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-[#e4ede0] shadow-sm relative overflow-hidden group cursor-pointer"
    >
      {/* Zoom icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#c8d8c2] p-1.5 rounded-full text-[#142018] border border-[#b6cbaf]">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pr-6">
          <h2 className="text-lg sm:text-xl font-normal tracking-tight text-[#121815]">
            Green energy usage
          </h2>
          <span className="p-1 rounded-full bg-[#c5d6be] text-[#18241c]">
            <Leaf className="w-3.5 h-3.5" />
          </span>
        </div>

        <p className="text-xs text-[#3b4b41] mt-1 font-medium">
          Solar self-consumption curve
        </p>
      </div>

      {/* Main Metric & Timeline Section */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        {/* Big percentage & time window */}
        <div>
          <div className="text-4xl sm:text-5xl font-light tracking-tight text-[#121815] leading-none">
            {percentage}%
          </div>
          <div className="text-xs text-[#3d5044] mt-2 font-mono font-medium">
            11AM — 3PM
          </div>
        </div>

        {/* Connected Node Line Graph */}
        <div className="flex-1 max-w-[280px] pb-1">
          {/* Top bracket / connected timeline */}
          <div className="relative flex items-center justify-between">
            {/* Horizontal connecting line */}
            <div className="absolute top-2 left-2 right-2 h-0.5 bg-[#455c4d]" />

            {/* Nodes */}
            {timelineNodes.map((node, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                {/* Node circle */}
                <div
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                    node.isHollow
                      ? 'bg-[#dce8d6] border-2 border-[#121815]'
                      : 'bg-[#121815]'
                  }`}
                >
                  {node.isHollow && <div className="w-1.5 h-1.5 rounded-full bg-[#121815]" />}
                </div>

                {/* Sub label under node */}
                <span className="text-[10px] text-[#34463a] font-mono mt-2 font-medium">
                  {node.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
