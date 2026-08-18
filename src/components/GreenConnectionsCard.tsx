import React, { useState } from 'react';
import { MoreHorizontal, Cpu, Zap, Activity, ShieldCheck, Wifi, Maximize2 } from 'lucide-react';
import { SimulationState } from '../types';

interface GreenConnectionsCardProps {
  simState: SimulationState;
  onCardClick?: () => void;
}

export const GreenConnectionsCard: React.FC<GreenConnectionsCardProps> = ({
  simState,
  onCardClick,
}) => {
  const [activeRouterMode, setActiveRouterMode] = useState<'solarPriority' | 'balanced' | 'gridSafe'>('solarPriority');
  const [loadBalancingPct, setLoadBalancingPct] = useState(92);

  const isSolar = simState.activeToggles.solarInverter;

  return (
    <div
      id="green-connections-card"
      onClick={onCardClick}
      className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#38483e] hover:shadow-lg cursor-pointer group relative overflow-hidden"
    >
      {/* Zoom hint icon in top right */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202723] p-1.5 rounded-full text-[#dce8d6] border border-[#303d35]">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 pr-6">
        <h2 className="text-lg sm:text-xl font-normal text-white tracking-tight flex items-center gap-1.5">
          <span>Smart grid router</span>
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick?.();
          }}
          className="text-[#65716a] hover:text-white transition-colors"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sublabel & Mode Indicator */}
      <div className="flex items-center justify-between text-xs text-[#8a948e] mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[#c8d4cc]">Phase A-B Router</span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isSolar ? 'Solar Priority' : 'Nominal Active'}
          </span>
        </div>

        <span className="text-[10px] font-mono text-[#dce8d6] px-2 py-0.5 rounded-full bg-[#1b231f] border border-[#2d3b32]">
          True RMS 230V
        </span>
      </div>

      {/* 3D Smart Microgrid Visualizer */}
      <div className="relative w-full h-36 sm:h-40 rounded-xl bg-[#0e1210] border border-[#1f2622] overflow-hidden my-auto flex items-center justify-center">
        {/* Isometric SVG wireframe illustration */}
        <svg
          className="w-full h-full object-contain p-2"
          viewBox="0 0 320 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="isoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(220, 232, 214, 0.05)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dce8d6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#141815" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="320" height="200" fill="url(#isoGrid)" />

          {/* Microgrid Hub Base Plate */}
          <polygon
            points="160,40 280,105 160,170 40,105"
            fill="url(#gridGlow)"
            stroke={isSolar ? '#4d6957' : '#28332c'}
            strokeWidth="1.2"
          />

          {/* Central Power Controller Cube */}
          <polygon
            points="160,80 195,98 160,116 125,98"
            fill="#1c2821"
            stroke="#a4c2ae"
            strokeWidth="1.2"
          />
          <polygon
            points="125,98 160,116 160,140 125,122"
            fill="#141f19"
            stroke="#4b5d51"
            strokeWidth="1.2"
          />
          <polygon
            points="195,98 160,116 160,140 195,122"
            fill="#17231c"
            stroke="#4b5d51"
            strokeWidth="1.2"
          />

          {/* Glowing central core orb */}
          <circle cx="160" cy="98" r="4" fill="#dce8d6" className="animate-pulse" />
          <circle cx="160" cy="98" r="8" fill="#dce8d6" fillOpacity="0.25" />

          {/* 4 Connected Sub-Nodes (Solar Array, Battery Inverter, Home Load, Grid Tie) */}
          {/* Node 1: Solar Top (North) */}
          <circle cx="160" cy="55" r="4" fill={isSolar ? '#dce8d6' : '#526358'} />
          <line x1="160" y1="55" x2="160" y2="80" stroke={isSolar ? '#8ba994' : '#2b362e'} strokeWidth="1" strokeDasharray="2 2" />

          {/* Node 2: Battery / Storage (East) */}
          <circle cx="235" cy="95" r="4" fill="#9de3b6" />
          <line x1="195" y1="98" x2="235" y2="95" stroke="#688772" strokeWidth="1" strokeDasharray="2 2" />

          {/* Node 3: Home Domestic Loads (South) */}
          <circle cx="160" cy="150" r="4" fill="#e2ede0" />
          <line x1="160" y1="140" x2="160" y2="150" stroke="#8ba994" strokeWidth="1" strokeDasharray="2 2" />

          {/* Node 4: Utility Grid Tie (West) */}
          <circle cx="85" cy="95" r="4" fill="#889c8f" />
          <line x1="125" y1="98" x2="85" y2="95" stroke="#526358" strokeWidth="1" strokeDasharray="2 2" />

          {/* Animated data pulses */}
          <circle cx="160" cy="68" r="1.5" fill="#ffffff" className="animate-ping" />
          <circle cx="215" cy="96" r="1.5" fill="#ffffff" />
        </svg>

        {/* Status Overlay Badge */}
        <div className="absolute bottom-2 left-2.5 px-2.5 py-0.5 rounded-full bg-[#141a16]/90 backdrop-blur-sm border border-[#2b3830] text-[10px] text-[#a5b5ab] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>4-Channel Bus: Active Sync</span>
        </div>
      </div>

      {/* Available power balance bar */}
      <div className="mt-3 pt-2">
        <div className="flex items-center justify-between text-xs text-[#8a948e] mb-1.5">
          <span>Grid-to-Solar Efficiency</span>
          <span className="text-sm font-normal text-white font-mono">{loadBalancingPct}%</span>
        </div>
        <div className="w-full h-1 bg-[#222925] rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 rounded-full"
            style={{ width: `${loadBalancingPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
