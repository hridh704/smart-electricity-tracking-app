import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Key,
  Eye,
  EyeOff,
  TrendingDown,
} from 'lucide-react';
import { SimulationState, TariffBreakdown, GeminiAnalysisResult } from '../types';
import { getPresetAiAuditTip } from '../utils/energySimulation';

interface GeminiConsultantProps {
  currentLoadKw: number;
  simState: SimulationState;
  tariff: TariffBreakdown;
  anomalyDetected: boolean;
  anomalyReason: string;
}

export const GeminiConsultant: React.FC<GeminiConsultantProps> = ({
  currentLoadKw,
  simState,
  tariff,
  anomalyDetected,
  anomalyReason,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('smartenergy_gemini_key') || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);

  // Save API key
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('smartenergy_gemini_key', val);
  };

  // Initial load
  useEffect(() => {
    const preset = getPresetAiAuditTip(currentLoadKw, simState, tariff);
    setAnalysisResult({
      bulletPoints: preset.bulletPoints,
      fullText: preset.bulletPoints.join('\n\n'),
      estimatedMonthlySavingsInr: preset.estimatedSavings,
      timestamp: new Date().toLocaleTimeString(),
      source: 'edge-rule-engine',
      confidenceScore: 0.94,
    });
  }, [simState.activeToggles, simState.currentSimHour]);

  // Trigger Gemini Analysis
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);

    const isPeak = simState.currentSimHour >= 18 && simState.currentSimHour < 22;
    const activeAppliancesList = Object.entries(simState.activeToggles)
      .filter(([_, active]) => active)
      .map(([key]) => key);

    const historySummary = `Rolling 24-hr simulated base load ~ 0.8 kW. Peak ToU Window (6 PM - 10 PM) active: ${isPeak}. Ambient temperature: ${simState.ambientTempC}°C.`;

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLoad: currentLoadKw.toFixed(2),
          historySummary,
          activeAppliances: activeAppliancesList,
          isPeakHour: isPeak,
          anomalyStatus: anomalyDetected ? anomalyReason : 'Nominal',
          customApiKey: apiKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.analysis || '';
        const lines = rawText
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        setAnalysisResult({
          bulletPoints: lines.length > 0 ? lines : [rawText],
          fullText: rawText,
          estimatedMonthlySavingsInr: tariff.potentialSavingsInr,
          timestamp: new Date().toLocaleTimeString(),
          source: 'gemini-3.7-flash',
          confidenceScore: 0.98,
        });
      } else {
        const fallback = getPresetAiAuditTip(currentLoadKw, simState, tariff);
        setAnalysisResult({
          bulletPoints: fallback.bulletPoints,
          fullText: fallback.bulletPoints.join('\n\n'),
          estimatedMonthlySavingsInr: fallback.estimatedSavings,
          timestamp: new Date().toLocaleTimeString(),
          source: 'edge-rule-engine',
          confidenceScore: 0.94,
        });
      }
    } catch {
      const fallback = getPresetAiAuditTip(currentLoadKw, simState, tariff);
      setAnalysisResult({
        bulletPoints: fallback.bulletPoints,
        fullText: fallback.bulletPoints.join('\n\n'),
        estimatedMonthlySavingsInr: fallback.estimatedSavings,
        timestamp: new Date().toLocaleTimeString(),
        source: 'edge-rule-engine',
        confidenceScore: 0.94,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Text-To-Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!analysisResult) return;

    const cleanSpeech = analysisResult.bulletPoints
      .join('. ')
      .replace(/[*_#`🔴💡⚡🚗☀️✅⚠️↳]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs flex flex-col justify-between">
      <div>
        {/* Top Header (Styled like RISK SUGGESTIONS in reference screenshot) */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
              RISK SUGGESTIONS & GEMINI AI
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
              INTEL
            </span>
            <button
              onClick={toggleSpeech}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#182030] text-slate-300 border-[#1e2638] hover:bg-[#222d42]'
              }`}
              title="Toggle Audio Readout"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400 inline mr-1" /> : <Volume2 className="w-3 h-3 text-slate-400 inline mr-1" />}
              <span>{isSpeaking ? 'Mute' : 'TTS'}</span>
            </button>
          </div>
        </div>

        {/* Structured Suggestions List (Formatted with [RISK] tags and cyan sub-bullet arrows) */}
        <div className="p-3 space-y-3 font-mono text-[11px]">
          {/* Suggestion 1 */}
          <div className="border-b border-[#182030] pb-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#e11d48]/20 text-rose-400 border border-rose-500/30 uppercase">
                {anomalyDetected ? 'CRITICAL' : 'RISK'}
              </span>
              <span className="font-bold text-slate-100 text-[11px]">
                {anomalyDetected
                  ? '3 AM Continuous Geyser Anomaly'
                  : simState.activeToggles.airConditioner
                  ? 'Peak Tariff HVAC Concentration'
                  : 'Time-of-Use Peak Window (6-10 PM)'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {anomalyDetected
                ? 'Unattended 3.2 kW resistive heating draw detected during 03:00 AM off-peak sleep cycle. Risk of runaway boiling.'
                : simState.activeToggles.airConditioner
                ? 'HVAC unit draws 2.50 kW during high ToU surcharge (₹11.20/kWh), raising monthly bill by +49%.'
                : 'Current household grid demand is optimal. Prepare to defer heavy inductive loads past 22:00 IST.'}
            </p>

            <div className="mt-1 text-[10px] text-cyan-400 flex items-start gap-1">
              <span>↳</span>
              <span className="font-medium text-slate-300">
                {anomalyDetected
                  ? 'Install automated thermal relay cutoff to prevent sleep-hour leakage; save ₹1,850/mo.'
                  : simState.activeToggles.airConditioner
                  ? 'Increase thermostat setpoint to 24°C or pre-cool at 17:00 IST; save ₹1,200/mo.'
                  : 'Ensure standby phantom draw remains below 80W to maintain ₹450/mo baseline savings.'}
              </span>
            </div>
          </div>

          {/* Suggestion 2 */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0284c7]/20 text-cyan-400 border border-cyan-500/30 uppercase">
                STRATEGY
              </span>
              <span className="font-bold text-slate-100 text-[11px]">
                {simState.activeToggles.solarInverter
                  ? 'Rooftop Solar Self-Consumption'
                  : 'EV Fast-Charge Shifting'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              {simState.activeToggles.solarInverter
                ? 'Direct solar offset (1.80 kW) active. Maximize midday heavy appliance cycles (11:30 - 14:30).'
                : 'Night off-peak window (23:00 - 06:00) offers lowest tariff slab at ₹5.50/kWh for EV charging.'}
            </p>

            <div className="mt-1 text-[10px] text-cyan-400 flex items-start gap-1">
              <span>↳</span>
              <span className="font-medium text-slate-300">
                {simState.activeToggles.solarInverter
                  ? 'Run washing machine & pump during peak solar generation window; save ₹850/mo.'
                  : 'Schedule EV charger to 23:30 IST using automated smart breaker; save ₹2,400/mo.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Strip & API Key */}
      <div className="p-3 border-t border-[#1e2638] bg-[#0c1018] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="flex-1 py-1.5 px-3 rounded bg-[#131a28] hover:bg-[#1a2338] text-slate-100 font-mono text-[10px] font-bold border border-[#1e2638] flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className={`w-3 h-3 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Auditing Telemetry...' : 'Analyze with Gemini AI'}</span>
          </button>

          <div className="text-[10px] font-mono text-slate-400">
            Save: <strong className="text-emerald-400">₹{tariff.potentialSavingsInr}/mo</strong>
          </div>
        </div>

        {/* Optional Gemini API Key */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <Key className="w-3 h-3 text-slate-400 shrink-0" />
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="Gemini API Key (optional)..."
            className="flex-1 bg-[#090d15] border border-[#1e2638] rounded px-2 py-1 text-slate-200 text-[10px] placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="p-1 rounded bg-[#131926] text-slate-400 hover:text-slate-200"
          >
            {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
