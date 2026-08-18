import React from 'react';
import { SimulationState, Esp32Packet } from '../types';

interface NewsTickerFooterProps {
  simState: SimulationState;
  latestPacket: Esp32Packet;
}

export const NewsTickerFooter: React.FC<NewsTickerFooterProps> = ({
  simState,
  latestPacket,
}) => {
  const isPeak = simState.currentSimHour >= 18 && simState.currentSimHour < 22;

  const newsItems = [
    `ESP32-S3 [0x${latestPacket.crc || '4A1F'}]: Voltage ${latestPacket.voltageV}V RMS • Current ${latestPacket.currentA}A • PF ${latestPacket.powerFactor} • Freq ${latestPacket.frequencyHz}Hz`,
    isPeak
      ? `PEAK TARIFF ALERT: Indian Grid ToU Window (18:00 - 22:00) active at ₹11.20/kWh (+49% surcharge). Defer non-essential loads.`
      : `STANDARD TARIFF: Base grid tariff nominal at ₹7.50/kWh (Tier-2). Daytime baseline optimal.`,
    simState.activeToggles.waterHeaterAnomaly
      ? `ANOMALY ALERT: TinyML AutoEncoder flagged unattended 3.2 kW resistive draw during off-peak sleep window.`
      : `TINYML EDGE STATUS: AutoEncoder MSE reconstruction error nominal (Z=0.04). No anomaly detected.`,
    `STEAM EXPO 2026: Non-Intrusive Load Monitoring (NILM) via SCT-013 CT & ZMPT101B Active Sensors with Google Gemini 3.7 Flash AI synergy.`,
  ];

  return (
    <div className="bg-[#0c1018] border-t border-[#1e2638] px-4 py-2 text-xs font-mono flex items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="bg-[#1a2334] text-cyan-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-cyan-500/30 shrink-0">
          NEWS / TELEMETRY
        </span>
        <div className="text-[11px] text-slate-300 truncate">
          {newsItems.join('   •••   ')}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="hidden sm:inline font-bold text-slate-200">ESP32_UART</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-bold">115200 BAUD</span>
      </div>
    </div>
  );
};
