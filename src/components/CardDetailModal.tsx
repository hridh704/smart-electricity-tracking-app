import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Sparkles,
  Zap,
  Sun,
  TrendingDown,
  TrendingUp,
  Leaf,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  Calendar,
  DollarSign,
  Layers,
  Thermometer,
  Cpu,
  RefreshCw,
  Sliders,
  Flame,
  Battery,
  Activity,
  Send,
  Volume2,
  VolumeX,
  Download,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { SimulationState, TariffBreakdown } from '../types';
import { exportSingleFileHtml } from '../utils/exportHtml';

export type BentoModalCardType =
  | 'totalEnergy'
  | 'greenConnections'
  | 'aiRecommendations'
  | 'tracking'
  | 'detailedReport'
  | 'greenEnergyUsage'
  | null;

interface CardDetailModalProps {
  cardType: BentoModalCardType;
  onClose: () => void;
  simState: SimulationState;
  onUpdateSimState: React.Dispatch<React.SetStateAction<SimulationState>>;
  currentLoadKw: number;
  tariff: TariffBreakdown;
  anomalyDetected: boolean;
  anomalyReason: string;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  cardType,
  onClose,
  simState,
  onUpdateSimState,
  currentLoadKw,
  tariff,
  anomalyDetected,
  anomalyReason,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!cardType) return null;

  // Preset Quick Questions for Gemini
  const quickQuestions = [
    'How much money can I save with solar today?',
    'What is the best time to run heavy appliances?',
    'Explain my peak tariff surcharge vs off-peak rate',
    'Is there any unusual night vampire load detected?',
    'How to pre-cool apartment before 6 PM peak?',
    'Calculate carbon emissions avoided today',
  ];

  // Handle custom or quick question Gemini prompt
  const executeGeminiQuery = async (queryText: string) => {
    if (!queryText.trim() || isAsking) return;
    setIsAsking(true);
    setCustomQuestion(queryText);
    try {
      const activeAppliances = [];
      if (simState.activeToggles.airConditioner) activeAppliances.push('HVAC (Air Conditioner)');
      if (simState.activeToggles.waterHeaterAnomaly) activeAppliances.push('Water Heater (High Draw)');
      if (simState.activeToggles.solarInverter) activeAppliances.push('Rooftop Solar Inverter');
      if (simState.activeToggles.evCharger) activeAppliances.push('EV Fast Charger');

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLoad: currentLoadKw,
          activeAppliances,
          isPeakHour: tariff.isPeakHour,
          anomalyStatus: anomalyDetected ? anomalyReason : 'Nominal Operation',
          historySummary: `Full detailed day interrogation. User question: ${queryText}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomAnswer(data.analysis);
      } else {
        setCustomAnswer(
          'Optimization recommendation: Shift high-power appliance cycles to solar peak hours (11:00 AM - 3:00 PM) to avoid higher grid tariffs and maximize net metering credits.'
        );
      }
    } catch {
      setCustomAnswer(
        'Load analysis complete: Peak grid consumption is currently driven by active cooling and baseline loads. Running appliances during off-peak windows reduces monthly spend by up to 24%.'
      );
    } finally {
      setIsAsking(false);
    }
  };

  const handleAskGemini = (e: React.FormEvent) => {
    e.preventDefault();
    executeGeminiQuery(customQuestion);
  };

  const handleToggleVoice = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Zoomed Modal Container */}
      <div
        id="bento-zoomed-card-dialog"
        className="relative z-10 bg-[#121614] border border-[#27322b] rounded-3xl sm:rounded-[32px] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white transition-all"
      >
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4.5 border-b border-[#202924] flex items-center justify-between bg-[#151a17]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#202a24] text-[#dce8d6] border border-[#2f3d35]">
              <Maximize2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-normal text-white tracking-tight">
                  {cardType === 'aiRecommendations' && 'Comprehensive 24-Hour AI Energy Audit & Daily Summary'}
                  {cardType === 'totalEnergy' && 'Sub-Circuit Energy Disaggregation (NILM)'}
                  {cardType === 'greenConnections' && 'Smart Grid Sub-Systems & Power Router Diagnostics'}
                  {cardType === 'tracking' && 'Photovoltaic Solar Projection & Yield Analytics'}
                  {cardType === 'detailedReport' && 'Weekly Telemetry Waveforms & Load Duration Curve'}
                  {cardType === 'greenEnergyUsage' && 'Self-Consumption & Solar Clean Energy Matching'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#dce8d6]/10 text-[#dce8d6] border border-[#dce8d6]/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#8a968e] mt-0.5">
                Deep-dive diagnostic data, historical correlation, and automated tariff optimization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export Single File HTML Button */}
            <button
              onClick={() => exportSingleFileHtml(simState, tariff, currentLoadKw)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c2420] border border-[#2d3a32] text-xs text-[#dce8d6] hover:bg-[#25302a] hover:text-white transition-colors"
              title="Download standalone single-file HTML"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export HTML</span>
            </button>

            <button
              id="btn-close-zoomed-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-[#1b221e] text-[#8a968e] hover:text-white hover:bg-[#252f29] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {/* ========================================================================= */}
          {/* 1. AI RECOMMENDATIONS & 24-HR DETAILED SUMMARY ZOOM VIEW */}
          {/* ========================================================================= */}
          {cardType === 'aiRecommendations' && (
            <div className="space-y-6">
              {/* Daily Summary Executive Banner */}
              <div className="bg-[#dce8d6] text-[#121815] rounded-2xl sm:rounded-3xl p-6 relative overflow-hidden shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#24352b]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2d4034]">
                      AI Energy Copilot · 24-Hour Executive Summary
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleToggleVoice(
                        `Today's energy efficiency score is 94 percent. Solar generation offset 6.4 kilowatt hours, keeping total grid expenditure at 142 rupees. Peak demand is projected at 6:00 PM.`
                      )
                    }
                    className="p-2 rounded-full bg-[#c8d8c0] text-[#142018] hover:bg-[#b8ccaf] transition-colors"
                    title="Read summary out loud"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-700" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#cfdfc7]/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#b9cca8]">
                    <span className="text-[11px] text-[#34463a] font-medium block">Daily Energy Score</span>
                    <div className="text-3xl font-light text-[#121815] mt-1 font-mono">94 / 100</div>
                    <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 inline-block">
                      Optimal Efficiency Zone
                    </span>
                  </div>
                  <div className="bg-[#cfdfc7]/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#b9cca8]">
                    <span className="text-[11px] text-[#34463a] font-medium block">Solar Clean Offset</span>
                    <div className="text-3xl font-light text-[#121815] mt-1 font-mono">68.4%</div>
                    <span className="text-[10px] text-[#2d4034] mt-0.5 inline-block font-mono">
                      +1.8 kW peak generation
                    </span>
                  </div>
                  <div className="bg-[#cfdfc7]/80 backdrop-blur-sm p-3.5 rounded-xl border border-[#b9cca8]">
                    <span className="text-[11px] text-[#34463a] font-medium block">Projected 24h Cost</span>
                    <div className="text-3xl font-light text-[#121815] mt-1 font-mono">₹142.60</div>
                    <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 inline-block">
                      Saved ₹48 vs unmanaged
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#b8cbaa] text-xs text-[#202d25] leading-relaxed">
                  <strong>Daily Operational Analysis:</strong> Your home has maintained balanced thermal efficiency throughout the morning. The rooftop solar inverter kicked in at 7:15 AM and reached optimal yield at 11:30 AM. No uncontrolled ghost vampire draws were recorded in the baseline circuits.
                </div>
              </div>

              {/* Quick Questions Section (NEW) */}
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#dce8d6]" /> Quick Questions for Gemini
                  </h4>
                  <span className="text-[11px] text-[#86968c]">Click any chip to prompt immediately</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeGeminiQuery(q)}
                      disabled={isAsking}
                      className="px-3 py-1.5 rounded-full bg-[#1f2723] border border-[#2d3a33] text-xs text-[#d2ded6] hover:text-white hover:border-[#dce8d6]/50 hover:bg-[#25302a] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-left"
                    >
                      <Sparkles className="w-3 h-3 text-[#dce8d6] flex-shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Breakdown Timeline (Morning, Afternoon, Evening, Night) */}
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#dce8d6]" /> 24-Hour Phase Breakdown & Action Items
                  </h4>
                  <span className="text-[11px] text-[#86968c]">Auto-Audited by Edge AI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Phase 1: Morning */}
                  <div className="p-3.5 rounded-xl bg-[#1c2320] border border-[#2a3730]">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>🌅 Morning (6 AM – 11 AM)</span>
                      <span className="text-[#a4b5ab] font-mono">2.1 kWh · ₹15.75</span>
                    </div>
                    <p className="text-[11px] text-[#8a9890] mt-1.5 leading-relaxed">
                      Induction cooktop and water heater morning cycle. Solar curve began offsetting morning tea preparations at 8:00 AM.
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 100% nominal grid parameters
                    </div>
                  </div>

                  {/* Phase 2: Solar Peak (Current) */}
                  <div className="p-3.5 rounded-xl bg-[#202924] border border-[#3e5044]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#dce8d6]">
                      <span>☀️ Midday Peak (11 AM – 4 PM)</span>
                      <span className="text-white font-mono">4.8 kWh Solar Yield</span>
                    </div>
                    <p className="text-[11px] text-[#a4b6aa] mt-1.5 leading-relaxed">
                      Peak solar production window. High clean energy surplus is currently buffering your refrigerator, HVAC, and mesh Wi-Fi network.
                    </p>
                    <div className="mt-2 text-[10px] text-[#dce8d6] flex items-center gap-1 font-medium">
                      <Sun className="w-3 h-3 text-[#dce8d6]" /> Best window for washing machine & EV charging
                    </div>
                  </div>

                  {/* Phase 3: Evening Peak */}
                  <div className="p-3.5 rounded-xl bg-[#1c2320] border border-[#2a3730]">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                      <span>⚡ Evening Peak Tariff (6 PM – 10 PM)</span>
                      <span className="text-[#a4b5ab] font-mono">₹11.20 / kWh</span>
                    </div>
                    <p className="text-[11px] text-[#8a9890] mt-1.5 leading-relaxed">
                      Grid tariff jumps by 49%. Pre-cooling the living room to 23°C at 5:00 PM allows shutting down compressor during peak surge.
                    </p>
                    <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3" /> Shift heavy loads away from 7:00 PM – 9:00 PM
                    </div>
                  </div>

                  {/* Phase 4: Overnight */}
                  <div className="p-3.5 rounded-xl bg-[#1c2320] border border-[#2a3730]">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>🌙 Night Standby (10 PM – 6 AM)</span>
                      <span className="text-[#a4b5ab] font-mono">0.32 kW Base Load</span>
                    </div>
                    <p className="text-[11px] text-[#8a9890] mt-1.5 leading-relaxed">
                      Clean vampire-load baseline. Automated geyser cutoff is scheduled for 10:30 PM to eliminate overnight thermostat leakage.
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Continuous AI edge leak monitoring active
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Ask Gemini Assistant */}
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#dce8d6]" /> Ask Custom Question to Gemini
                </h4>
                <p className="text-xs text-[#8a948e] mb-3">
                  Ask any question regarding your daily power metrics, billing tariffs, or appliance advice.
                </p>

                <form onSubmit={handleAskGemini} className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. How much will I save if I run AC for 2 hours tonight?"
                    className="flex-1 bg-[#121614] border border-[#2b3830] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#68776f] focus:outline-none focus:border-[#dce8d6]"
                  />
                  <button
                    type="submit"
                    disabled={isAsking}
                    className="px-4 py-2.5 rounded-xl bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAsking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Ask AI</span>
                  </button>
                </form>

                {customAnswer && (
                  <div className="mt-3.5 p-4 rounded-xl bg-[#1d2621] border border-[#2f3f35] text-xs text-[#d7e4dc] leading-relaxed animate-fadeIn">
                    <span className="text-[10px] font-semibold text-[#dce8d6] uppercase tracking-wider block mb-1">
                      Gemini 3.7 Flash Analysis:
                    </span>
                    {customAnswer}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. TOTAL ENERGY CONSUMPTION (NILM APPLIANCE DISAGGREGATION) */}
          {/* ========================================================================= */}
          {cardType === 'totalEnergy' && (
            <div className="space-y-6">
              {/* Top Sub-Circuit Disaggregation Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">Active Whole-Home Draw</span>
                  <div className="text-2xl sm:text-3xl font-light text-white mt-1 font-mono">
                    {currentLoadKw.toFixed(2)} <span className="text-xs text-[#8a948e]">kW</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    PF: 0.98 · True RMS Synchronized
                  </div>
                </div>

                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">24h Cumulative Usage</span>
                  <div className="text-2xl sm:text-3xl font-light text-[#dce8d6] mt-1 font-mono">
                    23.4 <span className="text-xs text-[#8a948e]">kWh</span>
                  </div>
                  <div className="text-[11px] text-[#8a948e] mt-1">
                    Baseline nominal range 21–27 kWh
                  </div>
                </div>

                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">Appliance Identification (NILM)</span>
                  <div className="text-2xl sm:text-3xl font-light text-teal-300 mt-1 font-mono">
                    5 Discovered
                  </div>
                  <div className="text-[11px] text-[#8a948e] mt-1">
                    High-frequency current harmonic FFT
                  </div>
                </div>
              </div>

              {/* Detailed Sub-Appliance Breakdown Matrix */}
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-medium text-white">Appliance High-Resolution Profiles</h4>

                <div className="space-y-3">
                  {[
                    {
                      name: 'Inverter Air Conditioner (2.5 kW compressor)',
                      status: simState.activeToggles.airConditioner ? 'Active Cooling' : 'Standby Inverter',
                      draw: simState.activeToggles.airConditioner ? '2.48 kW' : '0.04 kW',
                      dutyCycle: simState.activeToggles.airConditioner ? '78%' : '4%',
                      monthlyEst: simState.activeToggles.airConditioner ? '₹1,420' : '₹540',
                      color: 'text-sky-400',
                      barWidth: simState.activeToggles.airConditioner ? '85%' : '15%',
                    },
                    {
                      name: 'Smart Inverter Refrigerator (Frost-Free)',
                      status: 'Nominal Cycling',
                      draw: '0.18 kW',
                      dutyCycle: '42%',
                      monthlyEst: '₹340',
                      color: 'text-amber-400',
                      barWidth: '28%',
                    },
                    {
                      name: 'LED Lighting & Smart Mesh Nodes',
                      status: simState.activeToggles.allLightsOff ? 'Minimal Night Path' : 'All Rooms Illuminated',
                      draw: simState.activeToggles.allLightsOff ? '0.03 kW' : '0.24 kW',
                      dutyCycle: '100%',
                      monthlyEst: '₹180',
                      color: 'text-emerald-400',
                      barWidth: '18%',
                    },
                    {
                      name: 'Water Heating & Geyser System',
                      status: simState.activeToggles.waterHeaterAnomaly ? 'Anomaly Continuous Draw' : 'Auto Thermostat Off',
                      draw: simState.activeToggles.waterHeaterAnomaly ? '3.20 kW' : '0.00 kW',
                      dutyCycle: simState.activeToggles.waterHeaterAnomaly ? '100%' : '12%',
                      monthlyEst: simState.activeToggles.waterHeaterAnomaly ? '₹2,680' : '₹620',
                      color: simState.activeToggles.waterHeaterAnomaly ? 'text-rose-400' : 'text-zinc-400',
                      barWidth: simState.activeToggles.waterHeaterAnomaly ? '98%' : '20%',
                    },
                    {
                      name: 'Level-2 EV Fast Charger (Wallbox)',
                      status: simState.activeToggles.evCharger ? 'High Power Fast Charging' : 'Disconnected',
                      draw: simState.activeToggles.evCharger ? '4.00 kW' : '0.00 kW',
                      dutyCycle: simState.activeToggles.evCharger ? '95%' : '0%',
                      monthlyEst: simState.activeToggles.evCharger ? '₹1,850' : '₹0',
                      color: 'text-teal-400',
                      barWidth: simState.activeToggles.evCharger ? '90%' : '0%',
                    },
                  ].map((app, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#1c2320] border border-[#27352d] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{app.name}</span>
                        <span className={`font-semibold ${app.color}`}>{app.draw}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#141816] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${app.status.includes('Anomaly') ? 'bg-rose-500' : 'bg-[#dce8d6]'}`}
                          style={{ width: app.barWidth }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#86968c]">
                        <span>Status: {app.status}</span>
                        <span>Duty cycle: {app.dutyCycle} · Monthly cost: {app.monthlyEst}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. GREEN CONNECTIONS / POWER ROUTER DIAGNOSTICS */}
          {/* ========================================================================= */}
          {cardType === 'greenConnections' && (
            <div className="space-y-6">
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5">
                <h4 className="text-sm font-medium text-white mb-1">
                  Smart Edge Sub-System Telemetry & Microgrid Router
                </h4>
                <p className="text-xs text-[#8a948e] mb-4">
                  Multi-channel energy disaggregation across primary domestic living spaces.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {[
                    { room: 'Living Area & Media Suite', load: '0.48 kW', status: 'Optimal', pfc: '0.99', icon: Activity },
                    { room: 'Executive Workstation (Office)', load: '0.34 kW', status: 'Connected', pfc: '0.97', icon: Cpu },
                    { room: 'Master Suite & HVAC Zone', load: simState.activeToggles.airConditioner ? '2.45 kW' : '0.12 kW', status: 'Active Cooling', pfc: '0.98', icon: Thermometer },
                    { room: 'Kitchen & Induction Hub', load: '0.22 kW', status: 'Nominal', pfc: '0.95', icon: Flame },
                    { room: 'Rooftop Solar Array (4.2 kWp)', load: simState.activeToggles.solarInverter ? '-1.85 kW' : '0.00 kW', status: 'Generating Clean Power', pfc: '1.00', icon: Sun },
                    { room: 'Garage & Utility Storage', load: simState.activeToggles.evCharger ? '4.00 kW' : '0.08 kW', status: 'Standby Mesh', pfc: '0.96', icon: Battery },
                  ].map((zone, i) => {
                    const Icon = zone.icon;
                    return (
                      <div key={i} className="p-3.5 rounded-xl bg-[#1c2320] border border-[#2a3730] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white">{zone.room}</span>
                          <Icon className="w-3.5 h-3.5 text-[#dce8d6]" />
                        </div>
                        <div className="mt-3">
                          <div className="text-xl font-light text-white font-mono">{zone.load}</div>
                          <div className="text-[10px] text-emerald-400 mt-0.5">{zone.status}</div>
                          <div className="text-[9px] text-[#718076] mt-1 font-mono">PFC: {zone.pfc} · 230.4 V</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* IoT Hardware Diagnostics */}
              <div className="p-4 rounded-2xl bg-[#171d1a] border border-[#26322b] flex items-center justify-between text-xs text-[#8a948e]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ESP32-S3 True-RMS Core: 8,000 Samples/sec (ADE7753 Sensor Interface)</span>
                </div>
                <span className="font-mono text-[#dce8d6]">Latency: 12ms</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. TRACKING / SOLAR YIELD PROJECTIONS */}
          {/* ========================================================================= */}
          {cardType === 'tracking' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">Tomorrow's Solar Forecast</span>
                  <div className="text-3xl font-light text-white mt-1 font-mono">6.4 <span className="text-xs">kWh</span></div>
                  <div className="text-[11px] text-emerald-400 mt-1">+18% above seasonal norm</div>
                </div>
                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">Peak Irradiance Hour</span>
                  <div className="text-3xl font-light text-[#dce8d6] mt-1 font-mono">1:00 PM</div>
                  <div className="text-[11px] text-[#8a948e] mt-1">940 W/m² Clear Sky</div>
                </div>
                <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-4">
                  <span className="text-xs text-[#8a948e]">Projected Grid Export Revenue</span>
                  <div className="text-3xl font-light text-teal-300 mt-1 font-mono">₹38.50</div>
                  <div className="text-[11px] text-[#8a948e] mt-1">Feed-in tariff ₹4.20/kWh</div>
                </div>
              </div>

              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-medium text-white">Tomorrow's Estimated Generation Curve</h4>
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  {[
                    { time: '8 AM', gen: '0.4 kWh', eff: '20%' },
                    { time: '10 AM', gen: '1.2 kWh', eff: '65%' },
                    { time: '12 PM', gen: '1.8 kWh', eff: '98%' },
                    { time: '2 PM', gen: '1.6 kWh', eff: '88%' },
                    { time: '4 PM', gen: '1.0 kWh', eff: '52%' },
                    { time: '6 PM', gen: '0.4 kWh', eff: '18%' },
                  ].map((slot, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#1c2320] border border-[#27352d]">
                      <span className="text-[11px] text-[#8a948e] block">{slot.time}</span>
                      <span className="text-sm font-semibold text-[#dce8d6] mt-1 block font-mono">{slot.gen}</span>
                      <span className="text-[10px] text-emerald-400 mt-0.5 block">{slot.eff} Yield</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. DETAILED REPORT (WEEKLY CONSUMPTION & DURATION CURVES) */}
          {/* ========================================================================= */}
          {cardType === 'detailedReport' && (
            <div className="space-y-6">
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">7-Day Energy Consumption Analytics</h4>
                  <span className="text-xs text-[#8a948e]">Total 7-Day: 1,671 kWh</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { day: 'Monday', kwh: 276, cost: '₹2,070', pct: 92, trend: '+4%' },
                    { day: 'Tuesday', kwh: 282, cost: '₹2,115', pct: 94, trend: '+6%' },
                    { day: 'Wednesday (Peak)', kwh: 297, cost: '₹2,227', pct: 99, trend: '+12%' },
                    { day: 'Thursday', kwh: 269, cost: '₹2,017', pct: 89, trend: '-3%' },
                    { day: 'Friday', kwh: 274, cost: '₹2,055', pct: 91, trend: '+2%' },
                    { day: 'Saturday (Eco)', kwh: 175, cost: '₹1,312', pct: 58, trend: '-38%' },
                    { day: 'Sunday (Eco)', kwh: 138, cost: '₹1,035', pct: 46, trend: '-51%' },
                  ].map((row, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#1c2320] border border-[#27352d] flex items-center justify-between text-xs">
                      <div className="w-28 font-medium text-white">{row.day}</div>
                      <div className="flex-1 mx-4">
                        <div className="w-full h-2 bg-[#121614] rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                      <div className="w-20 text-right font-mono font-semibold text-white">{row.kwh} kWh</div>
                      <div className="w-20 text-right font-mono text-[#8a948e]">{row.cost}</div>
                      <div className="w-16 text-right font-mono text-emerald-400">{row.trend}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. GREEN ENERGY USAGE & TIMELINE */}
          {/* ========================================================================= */}
          {cardType === 'greenEnergyUsage' && (
            <div className="space-y-6">
              <div className="bg-[#171d1a] border border-[#26322b] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Direct Self-Consumption & Solar Share</h4>
                  <span className="text-xs text-[#dce8d6] font-mono">Current Clean Ratio: 68%</span>
                </div>

                <p className="text-xs text-[#8a948e] leading-relaxed">
                  During peak solar generation from 11:00 AM to 3:00 PM, direct solar generation satisfies 68% of your home's total electricity requirements, offsetting ₹220 of grid charges per afternoon.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#1c2320] border border-[#27352d]">
                    <span className="text-xs text-[#8a948e]">Carbon Emissions Avoided</span>
                    <div className="text-2xl font-light text-teal-300 mt-1 font-mono">14.2 kg CO₂ / day</div>
                    <span className="text-[10px] text-[#78887e] mt-1 block">Based on national grid average factor</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1c2320] border border-[#27352d]">
                    <span className="text-xs text-[#8a948e]">Self-Consumption Index</span>
                    <div className="text-2xl font-light text-[#dce8d6] mt-1 font-mono">82% Stored & Used</div>
                    <span className="text-[10px] text-[#78887e] mt-1 block">Minimal low-tariff export loss</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-3.5 border-t border-[#202924] bg-[#151a17] flex items-center justify-between">
          <span className="text-xs text-[#718076]">
            Smart Energy STEAM Edge System · Live Sync Active
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportSingleFileHtml(simState, tariff, currentLoadKw)}
              className="px-4 py-1.5 rounded-full bg-[#1b221e] border border-[#2b352f] text-[#dce8d6] text-xs font-semibold hover:bg-[#26312a] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HTML</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-full bg-[#dce8d6] text-[#121815] text-xs font-semibold hover:bg-[#e4ede0] transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
