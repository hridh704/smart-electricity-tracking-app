import React, { useEffect, useRef } from 'react';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { TimePointData, SimulationState } from '../types';

Chart.register(...registerables);

interface EnergyChartProps {
  timePoints: TimePointData[];
  currentSimHour: number;
  currentSimMinute: number;
  currentLoadKw: number;
  isWaterHeaterAnomalyActive: boolean;
  simState: SimulationState;
}

export const EnergyChart: React.FC<EnergyChartProps> = ({
  timePoints,
  currentSimHour,
  currentSimMinute,
  currentLoadKw,
  isWaterHeaterAnomalyActive,
  simState,
}) => {
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartInstanceRef = useRef<Chart | null>(null);
  const donutChartInstanceRef = useRef<Chart | null>(null);

  // 1. Line Chart Setup (Matches PORTFOLIO VS S&P 500 in screenshot)
  useEffect(() => {
    if (!lineCanvasRef.current) return;

    const labels = timePoints.map((p) => p.timeLabel);
    const dataValues = timePoints.map((p) => p.netLoadKw);
    const baseValues = timePoints.map((p) => p.baseLoadKw);

    const currentStepIndex = Math.floor((currentSimHour * 60 + currentSimMinute) / 5);
    const ctx = lineCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Household Net Load (kW)',
            data: dataValues,
            borderColor: isWaterHeaterAnomalyActive && (currentSimHour <= 5 || currentSimHour >= 23) ? '#f43f5e' : '#38bdf8',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: (context) => {
              const idx = context.dataIndex;
              if (idx === currentStepIndex) return 5;
              const pt = timePoints[idx];
              if (pt && pt.isAnomaly) return 4;
              return 0;
            },
            pointBackgroundColor: (context) => {
              const idx = context.dataIndex;
              if (idx === currentStepIndex) return '#f59e0b';
              const pt = timePoints[idx];
              if (pt && pt.isAnomaly) return '#f43f5e';
              return '#38bdf8';
            },
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
          },
          {
            label: 'Baseline Diurnal (kW)',
            data: baseValues,
            borderColor: '#94a3b8',
            borderWidth: 1.2,
            borderDash: [3, 3],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c1018',
            titleColor: '#f1f5f9',
            bodyColor: '#38bdf8',
            borderColor: '#1e2638',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 4,
            titleFont: { family: 'monospace', size: 11 },
            bodyFont: { family: 'monospace', size: 11 },
            callbacks: {
              title: (items) => {
                const label = items[0]?.label || '';
                const h = parseInt(label.split(':')[0], 10);
                const isPeak = h >= 18 && h < 22;
                return `Time: ${label} ${isPeak ? '[PEAK ₹11.20]' : '[BASE ₹7.50]'}`;
              },
              label: (item) => `${item.dataset.label}: ${Number(item.raw).toFixed(2)} kW`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(30, 38, 56, 0.4)' },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 10,
              font: { family: 'monospace', size: 10 },
            },
          },
          y: {
            min: 0,
            max: 8.0,
            grid: { color: 'rgba(30, 38, 56, 0.4)' },
            ticks: {
              color: '#64748b',
              font: { family: 'monospace', size: 10 },
              callback: (value) => `${value} kW`,
            },
          },
        },
      },
    };

    if (lineChartInstanceRef.current) {
      lineChartInstanceRef.current.destroy();
    }
    lineChartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }
    };
  }, [timePoints, currentSimHour, currentSimMinute, isWaterHeaterAnomalyActive]);

  // 2. Donut Chart Setup (Matches ASSET ALLOCATION in screenshot)
  const acPct = simState.activeToggles.airConditioner ? 45.0 : 5.0;
  const geyserPct = simState.activeToggles.waterHeaterAnomaly ? 38.0 : 8.0;
  const refrigPct = 18.0;
  const lightsPct = simState.activeToggles.allLightsOff ? 2.0 : 12.0;
  const evPct = simState.activeToggles.evCharger ? 40.0 : 0.0;
  const standbyPct = 7.0;

  useEffect(() => {
    if (!donutCanvasRef.current) return;
    const ctx = donutCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const donutConfig: any = {
      type: 'doughnut',
      data: {
        labels: ['Air Conditioner', 'Water Heater', 'Refrigerator', 'Lighting', 'EV Charger', 'Standby'],
        datasets: [
          {
            data: [acPct, geyserPct, refrigPct, lightsPct, evPct, standbyPct],
            backgroundColor: [
              '#0284c7', // Cyan
              '#a855f7', // Purple
              '#10b981', // Emerald
              '#f59e0b', // Amber
              '#ec4899', // Pink
              '#64748b', // Slate
            ],
            borderWidth: 2,
            borderColor: '#0f141f',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c1018',
            borderColor: '#1e2638',
            borderWidth: 1,
            bodyFont: { family: 'monospace', size: 10 },
          },
        },
        cutout: '68%',
      },
    };

    if (donutChartInstanceRef.current) {
      donutChartInstanceRef.current.destroy();
    }
    donutChartInstanceRef.current = new Chart(ctx, donutConfig);

    return () => {
      if (donutChartInstanceRef.current) {
        donutChartInstanceRef.current.destroy();
      }
    };
  }, [acPct, geyserPct, refrigPct, lightsPct, evPct, standbyPct]);

  return (
    <div className="space-y-4">
      {/* 1. Rolling 24-Hour Load Line Chart */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
              LOAD VS BASELINE
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#38bdf8]" />
                <span className="text-slate-200 font-bold">Household Load</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" />
                <span>Diurnal Baseline</span>
              </span>
            </div>
          </div>

          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            24H ROLLING
          </span>
        </div>

        {/* Canvas Area */}
        <div className="p-3">
          <div className="h-56 relative w-full">
            <canvas ref={lineCanvasRef} />
          </div>
        </div>
      </div>

      {/* 2. Asset Allocation / Appliance Donut Chart (Matches screenshot layout) */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            ENERGY ALLOCATION
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            BREAKDOWN
          </span>
        </div>

        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Donut Canvas */}
          <div className="w-36 h-36 relative shrink-0">
            <canvas ref={donutCanvasRef} />
          </div>

          {/* Legend Items Breakdown Table */}
          <div className="flex-1 font-mono text-[10px] space-y-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-[#0284c7]" />
                <span>Air Conditioner</span>
              </span>
              <span className="font-bold text-slate-200">{acPct.toFixed(1)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-[#a855f7]" />
                <span>Water Heater</span>
              </span>
              <span className="font-bold text-slate-200">{geyserPct.toFixed(1)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-[#10b981]" />
                <span>Refrigerator</span>
              </span>
              <span className="font-bold text-slate-200">{refrigPct.toFixed(1)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-[#f59e0b]" />
                <span>House Lighting</span>
              </span>
              <span className="font-bold text-slate-200">{lightsPct.toFixed(1)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-[#64748b]" />
                <span>Standby Parasitic</span>
              </span>
              <span className="font-bold text-slate-200">{standbyPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
