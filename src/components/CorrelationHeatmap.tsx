import React from 'react';

export const CorrelationHeatmap: React.FC = () => {
  const variables = ['AC', 'GEYS', 'SOLR', 'TEMP', 'PF', 'TARIFF'];

  // Correlation values between 1.00 and -1.00
  const matrix = [
    [1.0, 0.33, -0.42, 0.88, 0.75, 0.65],
    [0.33, 1.0, -0.15, 0.12, 0.82, 0.44],
    [-0.42, -0.15, 1.0, 0.72, -0.31, -0.68],
    [0.88, 0.12, 0.72, 1.0, 0.61, 0.52],
    [0.75, 0.82, -0.31, 0.61, 1.0, 0.38],
    [0.65, 0.44, -0.68, 0.52, 0.38, 1.0],
  ];

  // Helper to color cells based on value
  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-[#10b981] text-black font-bold';
    if (val >= 0.7) return 'bg-[#059669]/70 text-slate-100';
    if (val >= 0.4) return 'bg-[#0d9488]/50 text-slate-200';
    if (val >= 0.1) return 'bg-[#0f766e]/30 text-slate-300';
    if (val > -0.2) return 'bg-[#1e293b]/40 text-slate-400';
    if (val <= -0.5) return 'bg-[#e11d48]/40 text-rose-200';
    return 'bg-[#f43f5e]/25 text-rose-300';
  };

  return (
    <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
        <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
          CORRELATION MATRIX
        </span>
        <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
          HEAT MAP
        </span>
      </div>

      <div className="p-3">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full font-mono text-[10px]">
            <thead>
              <tr>
                <th className="p-1 text-slate-500 text-left"></th>
                {variables.map((v) => (
                  <th key={v} className="p-1 text-slate-400 text-center font-semibold">
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={variables[i]}>
                  <td className="p-1 text-slate-400 font-bold text-left">{variables[i]}</td>
                  {row.map((val, j) => (
                    <td key={j} className="p-0.5 text-center">
                      <div
                        className={`rounded px-1.5 py-1 text-[9px] transition ${getCellColor(
                          val
                        )}`}
                      >
                        {val < 0 ? val.toFixed(2) : val === 1.0 ? '1.00' : val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
