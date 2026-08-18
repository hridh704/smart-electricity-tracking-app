import React from 'react';
import { Download, FileText, BarChart3, TrendingDown, ArrowDownRight, Sparkles, CheckCircle2, FileCode } from 'lucide-react';
import { SimulationState, TariffBreakdown } from '../types';
import { exportSingleFileHtml } from '../utils/exportHtml';

interface ReportingViewProps {
  simState: SimulationState;
  tariff: TariffBreakdown;
  currentLoadKw: number;
}

export const ReportingView: React.FC<ReportingViewProps> = ({
  simState,
  tariff,
  currentLoadKw,
}) => {
  return (
    <div id="reporting-view" className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-tight">
            Monthly Audit & Sustainability Report
          </h2>
          <p className="text-xs text-[#8a948e] mt-1">
            Automated billing audit, NILM appliance breakdown, and carbon emissions certificate.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Download Standalone Single File HTML */}
          <button
            onClick={() => exportSingleFileHtml(simState, tariff, currentLoadKw)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1e2621] border border-[#2d3a31] text-[#dce8d6] text-xs font-semibold hover:bg-[#27332b] hover:text-white transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export Single HTML</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141716] border border-[#232926] rounded-2xl p-5">
          <span className="text-xs text-[#8a948e]">Projected Monthly Spend</span>
          <div className="text-3xl font-light text-white mt-1 font-mono">
            ₹{tariff.projectedMonthlyInr.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Potential savings: ₹{tariff.potentialSavingsInr}/mo
          </div>
        </div>

        <div className="bg-[#141716] border border-[#232926] rounded-2xl p-5">
          <span className="text-xs text-[#8a948e]">Monthly Grid Energy</span>
          <div className="text-3xl font-light text-[#dce8d6] mt-1 font-mono">
            {tariff.projectedMonthlyKwh} <span className="text-sm font-normal text-[#8a948e]">kWh</span>
          </div>
          <div className="text-[11px] text-[#8a948e] mt-2">
            Peak Tariff Window (6–10 PM): 34% of total
          </div>
        </div>

        <div className="bg-[#141716] border border-[#232926] rounded-2xl p-5">
          <span className="text-xs text-[#8a948e]">Carbon Footprint Offset</span>
          <div className="text-3xl font-light text-teal-300 mt-1 font-mono">
            {tariff.co2EmissionsKgPerMonth} <span className="text-sm font-normal text-[#8a948e]">kg CO₂</span>
          </div>
          <div className="text-[11px] text-[#8a948e] mt-2">
            Equivalent to planting 14 trees/year
          </div>
        </div>
      </div>

      {/* Disaggregation Breakdown Table */}
      <div className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5">
        <h3 className="text-base font-normal text-white mb-3">
          Appliance Energy Disaggregation
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Air Conditioner & Heat Pump', share: '38%', kwh: '138 kWh', cost: '₹1,240', color: 'bg-sky-400' },
            { name: 'Water Heating & Geyser', share: '24%', kwh: '88 kWh', cost: '₹790', color: 'bg-rose-400' },
            { name: 'Refrigerator & Standby Inverter', share: '18%', kwh: '65 kWh', cost: '₹480', color: 'bg-amber-400' },
            { name: 'Lighting & Smart Home Mesh', share: '12%', kwh: '43 kWh', cost: '₹320', color: 'bg-emerald-400' },
            { name: 'Kitchen Cooktop & Electronics', share: '8%', kwh: '29 kWh', cost: '₹220', color: 'bg-purple-400' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#181d1b] border border-[#222925]">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-white font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs">
                <span className="text-[#8a948e]">{item.kwh}</span>
                <span className="text-[#a4b5aa]">{item.share}</span>
                <span className="text-white font-semibold">{item.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
