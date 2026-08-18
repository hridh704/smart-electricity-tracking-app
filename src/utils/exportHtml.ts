/**
 * Utility to generate and download a self-contained, standalone single-file HTML document
 * containing the complete SmartEnergy Edge-AI Monitor dashboard, styled with Tailwind CDN,
 * interactive JS charts, live simulation, and spreadsheet table.
 */

import { SimulationState, TariffBreakdown } from '../types';
import { generateDailySpreadsheetData } from './spreadsheetData';

export function generateStandaloneHtmlCode(
  simState?: SimulationState,
  tariff?: TariffBreakdown,
  currentLoadKw?: number
): string {
  const spreadsheetRows = generateDailySpreadsheetData(simState);
  const netKw = currentLoadKw ?? 2.14;
  const monthlyInr = tariff?.projectedMonthlyInr ?? 2840;
  const savingsInr = tariff?.potentialSavingsInr ?? 450;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>⚡ SmartEnergy Edge-AI Monitor - Standalone Single File</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#c8d4c5] p-3 sm:p-6 lg:p-10 flex items-center justify-center min-h-screen text-[#f4f7f5] antialiased">

  <div class="w-full max-w-[1400px] bg-[#111413] rounded-[28px] sm:rounded-[36px] shadow-2xl border border-[#202723] overflow-hidden flex flex-col p-6 sm:p-8 space-y-6">
    
    <!-- Top Header -->
    <header class="flex flex-wrap items-center justify-between border-b border-[#232825] pb-5 gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-[#dce8d6] text-[#121815] flex items-center justify-center font-bold text-sm shadow-sm">
          ⚡
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">SmartEnergy Edge-AI Monitor</h1>
          <p class="text-xs text-[#8a948e]">9th Grade STEAM Expo Project · Standalone Single-File Dashboard</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          STANDALONE ACTIVE
        </span>
        <div class="text-right">
          <span class="text-xl font-light text-white font-mono" id="live-time">11:37 AM</span>
          <span class="text-[10px] text-[#8a948e] uppercase block">Local Telemetry</span>
        </div>
      </div>
    </header>

    <!-- Top Key Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[#141716] border border-[#232926] rounded-2xl p-5">
        <span class="text-xs text-[#8a948e]">Active Net Draw</span>
        <div class="text-3xl font-light text-white mt-1 font-mono">${netKw.toFixed(2)} <span class="text-sm text-[#8a948e]">kW</span></div>
        <div class="text-[11px] text-emerald-400 mt-2">True RMS · Power Factor 0.98</div>
      </div>

      <div class="bg-[#141716] border border-[#232926] rounded-2xl p-5">
        <span class="text-xs text-[#8a948e]">Projected Monthly Spend</span>
        <div class="text-3xl font-light text-white mt-1 font-mono">₹${monthlyInr.toLocaleString()}</div>
        <div class="text-[11px] text-emerald-400 mt-2">Saved ₹${savingsInr}/mo with solar</div>
      </div>

      <div class="bg-[#141716] border border-[#232926] rounded-2xl p-5">
        <span class="text-xs text-[#8a948e]">Tomorrow's Solar Forecast</span>
        <div class="text-3xl font-light text-[#dce8d6] mt-1 font-mono">6.4 <span class="text-sm text-[#8a948e]">kWh</span></div>
        <div class="text-[11px] text-[#8a948e] mt-2">+18% above seasonal baseline</div>
      </div>

      <div class="bg-[#dce8d6] text-[#121815] rounded-2xl p-5">
        <span class="text-xs font-semibold uppercase text-[#2d4034]">AI Efficiency Score</span>
        <div class="text-3xl font-light text-[#121815] mt-1 font-mono">94 / 100</div>
        <div class="text-[11px] text-[#2d4034] font-medium mt-2">Optimal midday self-consumption</div>
      </div>
    </div>

    <!-- Live Telemetry Graph -->
    <div class="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-normal text-white">24-Hour Load & Solar Telemetry Curve</h2>
          <p class="text-xs text-[#8a948e]">Continuous tracking of load demand (kW) vs rooftop solar offset</p>
        </div>
      </div>
      <div class="h-64 w-full">
        <canvas id="telemetryChart"></canvas>
      </div>
    </div>

    <!-- 24-Hour Energy Spreadsheet Table -->
    <div class="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-normal text-white">Daily Hourly Telemetry Spreadsheet (Sample Data)</h2>
          <p class="text-xs text-[#8a948e]">24-Hour True RMS load, solar offset, voltage, power factor, and cost metrics</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-[#232926]">
        <table class="w-full text-left text-xs text-[#c8d4cc]">
          <thead class="bg-[#181d1b] text-[#8a948e] border-b border-[#232926] font-mono text-[11px]">
            <tr>
              <th class="p-3">Time</th>
              <th class="p-3">Primary Appliance</th>
              <th class="p-3">Active (kW)</th>
              <th class="p-3">Solar (kW)</th>
              <th class="p-3">Net Grid (kW)</th>
              <th class="p-3">Tariff</th>
              <th class="p-3">Cost (₹)</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#202723] font-mono text-xs">
            ${spreadsheetRows
              .map(
                (row) => `
              <tr class="hover:bg-[#181d1b]/70">
                <td class="p-3 text-white font-medium">${row.timeSlot}</td>
                <td class="p-3 text-[#dce8d6] font-sans">${row.primaryAppliance}</td>
                <td class="p-3 text-white">${row.activeLoadKw.toFixed(2)}</td>
                <td class="p-3 text-[#dce8d6]">${row.solarKw.toFixed(2)}</td>
                <td class="p-3 font-semibold ${row.netGridKw < 0 ? 'text-emerald-400' : 'text-white'}">${row.netGridKw.toFixed(2)}</td>
                <td class="p-3 ${row.tariffRateInr > 8 ? 'text-amber-300 font-semibold' : 'text-[#8a948e]'}">₹${row.tariffRateInr.toFixed(2)}</td>
                <td class="p-3 text-white font-semibold">₹${row.hourlyCostInr.toFixed(2)}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] ${
                    row.status.includes('Solar')
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : row.status.includes('Peak')
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : row.status.includes('Anomaly')
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-[#202723] text-[#8a948e]'
                  }">${row.status}</span>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <footer class="pt-4 border-t border-[#202723] flex items-center justify-between text-xs text-[#718076]">
      <span>SmartEnergy Edge-AI System · 9th Grade STEAM Expo</span>
      <span>Self-Contained Single File HTML</span>
    </footer>

  </div>

  <script>
    // Initialize Chart.js
    const ctx = document.getElementById('telemetryChart').getContext('2d');
    const labels = ${JSON.stringify(spreadsheetRows.map((d) => d.timeSlot.split(' - ')[0]))};
    const activeLoad = ${JSON.stringify(spreadsheetRows.map((d) => d.activeLoadKw))};
    const solarGen = ${JSON.stringify(spreadsheetRows.map((d) => d.solarKw))};
    const netGrid = ${JSON.stringify(spreadsheetRows.map((d) => d.netGridKw))};

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Active Load (kW)',
            data: activeLoad,
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Solar Offset (kW)',
            data: solarGen,
            borderColor: '#dce8d6',
            backgroundColor: 'rgba(220, 232, 214, 0.15)',
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Net Grid Draw (kW)',
            data: netGrid,
            borderColor: '#38bdf8',
            borderDash: [4, 4],
            borderWidth: 1.5,
            tension: 0.35,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8a948e', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8a948e', font: { size: 10 } }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#f4f7f5', font: { size: 11 } }
          }
        }
      }
    });

    // Clock
    setInterval(() => {
      const now = new Date();
      document.getElementById('live-time').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
  </script>
</body>
</html>`;
}

export function exportSingleFileHtml(
  simState?: SimulationState,
  tariff?: TariffBreakdown,
  currentLoadKw?: number
) {
  const htmlContent = generateStandaloneHtmlCode(simState, tariff, currentLoadKw);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `smartenergy_standalone_${new Date().toISOString().slice(0, 10)}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
