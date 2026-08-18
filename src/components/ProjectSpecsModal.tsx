import React from 'react';
import { X, Cpu, Radio, ShieldAlert, Award, Zap } from 'lucide-react';

interface ProjectSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSpecsModal: React.FC<ProjectSpecsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl relative custom-scrollbar font-mono text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded bg-[#182030] hover:bg-[#222d42] text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5 border-b border-[#1e2638] pb-4">
          <div className="w-10 h-10 rounded border border-cyan-500/40 bg-[#101726] flex items-center justify-center text-cyan-400 font-black shadow-sm">
            [⚡]
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                SmartEnergy Edge-AI Architecture
              </h2>
              <span className="text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                9th-Grade STEAM Expo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Non-Intrusive Load Monitoring (NILM) & Dynamic ToU Tariff Optimization
            </p>
          </div>
        </div>

        <div className="space-y-4 text-slate-300">
          {/* Abstract */}
          <div className="bg-[#0c1018] border border-[#182030] rounded p-3.5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Project Abstract & Problem Statement
            </h3>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Traditional household electricity meters provide only delayed monthly aggregate summaries, leaving consumers unaware of high Time-of-Use (ToU) peak surcharges (₹11.20/kWh between 6:00 PM – 10:00 PM) and undetected nighttime anomaly leaks (such as stuck water heater thermostats). This project implements an intelligent ESP32-based edge hardware node that samples RMS current and voltage at 1.2 kHz, detects continuous load anomalies locally using an onboard TinyML Autoencoder, and interfaces with Google Gemini AI to provide actionable behavior-shift recommendations.
            </p>
          </div>

          {/* Hardware Circuit Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0c1018] border border-[#182030] rounded p-3.5">
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Hardware Components (BOM)
              </h4>
              <ul className="space-y-2 text-[10px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <div>
                    <strong className="text-slate-200">ESP32-S3 Microcontroller:</strong> Dual-core 240MHz Xtensa processor with vector instructions for edge inference.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <div>
                    <strong className="text-slate-200">SCT-013-000 Non-Invasive CT:</strong> 0-100A split-core current transformer with burden resistor bias circuit.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <div>
                    <strong className="text-slate-200">ZMPT101B Voltage Transformer:</strong> Precision AC mains active voltage sensor with op-amp signal conditioner.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <div>
                    <strong className="text-slate-200">SSD1306 0.96" I2C OLED:</strong> Local hardware status HUD display on main distribution board.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#0c1018] border border-[#182030] rounded p-3.5">
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                Edge TinyML Anomaly Pipeline
              </h4>
              <ul className="space-y-2 text-[10px] text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-200">High-Frequency Sampling:</strong> 128 RMS cycles digitized per second with hardware CRC-16 checksums.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-200">Quantized AutoEncoder (8 KB):</strong> Reconstructs expected diurnal baseline; MSE error yields anomaly Z-score.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-200">Heuristic Time Windows:</strong> Detects nighttime runaway heating loads (&gt;2.5 kW between 1:00 AM – 5:00 AM) in &lt;10ms.
                  </div>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-200">Gemini AI Synergy:</strong> Edge node streams telemetry to Gemini 3.7 Flash for structured human-readable behavior coaching.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Indian Tariff Model */}
          <div className="bg-[#0c1018] border border-[#182030] rounded p-3.5">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Dynamic Time-of-Use (ToU) Tariff Model
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px] mt-2">
              <div className="p-2 rounded bg-[#090d15] border border-[#182030]">
                <div className="text-slate-500 text-[9px]">TIER 1 (0-100 kWh)</div>
                <div className="font-mono text-emerald-400 font-bold text-sm">₹4.50 / kWh</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Lifeline baseline consumption</div>
              </div>
              <div className="p-2 rounded bg-[#090d15] border border-[#182030]">
                <div className="text-slate-500 text-[9px]">TIER 2 (101-300 kWh)</div>
                <div className="font-mono text-cyan-400 font-bold text-sm">₹7.25 / kWh</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Standard domestic slab</div>
              </div>
              <div className="p-2 rounded bg-[#090d15] border border-[#182030]">
                <div className="text-slate-500 text-[9px]">PEAK SURCHARGE (6-10 PM)</div>
                <div className="font-mono text-amber-400 font-bold text-sm">₹11.20 / kWh</div>
                <div className="text-[9px] text-slate-400 mt-0.5">+49% ToU peak penalty</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-[#1e2638] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#182030] hover:bg-[#222d42] text-slate-100 font-bold text-[11px] transition border border-[#1e2638]"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
