import React from 'react';

export const VolatilityBars: React.FC = () => {
  const items = [
    { label: 'GEYSER_SPIKE', pct: 48.6, barWidth: '48.6%' },
    { label: 'EV_FAST_CHG', pct: 35.2, barWidth: '35.2%' },
    { label: 'AC_COMPRESSOR', pct: 28.4, barWidth: '28.4%' },
    { label: 'INDUCTION_COOK', pct: 25.1, barWidth: '25.1%' },
    { label: 'REFRIGERATOR', pct: 18.7, barWidth: '18.7%' },
    { label: 'SOLAR_OFFSET', pct: 16.5, barWidth: '16.5%' },
    { label: 'HOUSE_LIGHTS', pct: 15.5, barWidth: '15.5%' },
    { label: 'STANDBY_PHANTOM', pct: 4.2, barWidth: '4.2%' },
  ];

  return (
    <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
        <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
          HARMONIC LOAD VOLATILITY
        </span>
        <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
          SURGE PEAK %
        </span>
      </div>

      <div className="p-3 space-y-1.5 font-mono text-[10px]">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-28 text-slate-400 truncate">{item.label}</span>
            <div className="flex-1 bg-[#131a27] h-4 rounded overflow-hidden relative border border-[#1e2638]">
              <div
                className="h-full bg-[#0ea5e9] transition-all duration-300"
                style={{ width: item.barWidth }}
              />
              <span className="absolute right-1.5 top-0 text-[9px] font-bold text-slate-100 leading-4">
                {item.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
