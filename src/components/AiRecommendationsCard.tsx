import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, RefreshCw, Send, ArrowUpRight, Maximize2 } from 'lucide-react';
import { SimulationState, TariffBreakdown } from '../types';

interface AiRecommendationsCardProps {
  currentLoadKw: number;
  simState: SimulationState;
  tariff: TariffBreakdown;
  anomalyDetected: boolean;
  anomalyReason: string;
  onCardClick?: () => void;
}

export const AiRecommendationsCard: React.FC<AiRecommendationsCardProps> = ({
  currentLoadKw,
  simState,
  tariff,
  anomalyDetected,
  anomalyReason,
  onCardClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isAnsweringCustom, setIsAnsweringCustom] = useState(false);

  // Default dynamic recommendations
  const [recommendations, setRecommendations] = useState<{
    primaryTitle: string;
    primaryTag: string;
    primarySubtitle: string;
    secondaryTitle: string;
    secondaryTag: string;
    secondarySubtitle: string;
    source: 'gemini-3.7-flash' | 'edge-rule-engine';
  }>({
    primaryTitle: 'Sunny day ahead: maximizing solar generation',
    primaryTag: 'Today recommended',
    primarySubtitle: 'Shift heavy wash and heating cycles to 11 AM – 3 PM to save ₹185 today.',
    secondaryTitle: 'Run appliances during solar peak to reduce grid load',
    secondaryTag: 'Analysis',
    secondarySubtitle: 'Grid tariff spikes to ₹11.20/kWh at 6:00 PM. Pre-cool rooms prior to 5:30 PM.',
    source: 'edge-rule-engine',
  });

  // Trigger speech synthesis
  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const speechText = `${recommendations.primaryTitle}. ${recommendations.primarySubtitle}. Also: ${recommendations.secondaryTitle}. ${recommendations.secondarySubtitle}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch live Gemini analysis
  const fetchGeminiAnalysis = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsLoading(true);
    try {
      const activeAppliances = [];
      if (simState.activeToggles.airConditioner) activeAppliances.push('Air Conditioner');
      if (simState.activeToggles.waterHeaterAnomaly) activeAppliances.push('Water Heater (High Draw)');
      if (simState.activeToggles.solarInverter) activeAppliances.push('Rooftop Solar Active');
      if (simState.activeToggles.evCharger) activeAppliances.push('EV Fast Charger');

      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLoad: currentLoadKw,
          activeAppliances,
          isPeakHour: tariff.isPeakHour,
          anomalyStatus: anomalyDetected ? anomalyReason : 'Nominal Operation',
          historySummary: `Current time ${simState.currentSimHour}:${String(simState.currentSimMinute).padStart(2, '0')}, Solar: ${simState.activeToggles.solarInverter ? 'Active' : 'Off'}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.analysis || '';
        const lines = text.split('\n').filter((l: string) => l.trim().length > 0);

        const bullet1 = lines[0]?.replace(/^[-*•0-9.]+\s*/, '') || 'Shift heavy appliances to midday solar generation window.';
        const bullet2 = lines[1]?.replace(/^[-*•0-9.]+\s*/, '') || 'Pre-cool apartment prior to peak 6 PM tariff window to save ₹450/month.';

        setRecommendations({
          primaryTitle: bullet1.slice(0, 58),
          primaryTag: 'Gemini 3.7 Flash',
          primarySubtitle: bullet1,
          secondaryTitle: bullet2.slice(0, 58),
          secondaryTag: 'Smart Saving',
          secondarySubtitle: bullet2,
          source: 'gemini-3.7-flash',
        });
      }
    } catch (e) {
      console.log('Using edge heuristic advice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle custom prompt question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customQuestion.trim() || isAnsweringCustom) return;

    setIsAnsweringCustom(true);
    try {
      const activeAppliances = [];
      if (simState.activeToggles.airConditioner) activeAppliances.push('AC');
      if (simState.activeToggles.waterHeaterAnomaly) activeAppliances.push('Water Heater');
      if (simState.activeToggles.solarInverter) activeAppliances.push('Solar');

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLoad: currentLoadKw,
          activeAppliances,
          isPeakHour: tariff.isPeakHour,
          anomalyStatus: anomalyDetected ? anomalyReason : 'Nominal',
          historySummary: `User prompt: ${customQuestion}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomAnswer(data.analysis);
      } else {
        setCustomAnswer('Optimize usage between 11 AM - 3 PM when solar covers 100% of appliance consumption.');
      }
    } catch (err) {
      setCustomAnswer('Shift high draw loads to midday to lower peak electricity charges.');
    } finally {
      setIsAnsweringCustom(false);
    }
  };

  // Update recommendation dynamically when anomaly or peak tariff triggers
  useEffect(() => {
    if (anomalyDetected) {
      setRecommendations({
        primaryTitle: 'Unattended night load: Water Heater Spike',
        primaryTag: 'Action Required',
        primarySubtitle: `System drawing ${currentLoadKw.toFixed(2)} kW during sleep hours. Turn off water heater to prevent ₹140 daily waste.`,
        secondaryTitle: 'Continuous heating element draw detected',
        secondaryTag: 'Anomaly Heuristic',
        secondarySubtitle: 'Thermostat stuck in closed loop. Automatic smart cutoff recommended.',
        source: 'edge-rule-engine',
      });
    } else if (tariff.isPeakHour) {
      setRecommendations({
        primaryTitle: 'Peak tariff window active (₹11.20/kWh)',
        primaryTag: 'Peak Tariff',
        primarySubtitle: 'Utility rate increased by 49%. Delay dishwashers and laundry until after 10:00 PM.',
        secondaryTitle: 'Eco-mode switch recommended for AC',
        secondaryTag: 'Save ₹65/evening',
        secondarySubtitle: 'Setting thermostat to 25°C reduces active compressor power by 35%.',
        source: 'edge-rule-engine',
      });
    }
  }, [anomalyDetected, tariff.isPeakHour, currentLoadKw]);

  return (
    <div
      id="ai-recommendations-card"
      onClick={onCardClick}
      className="bg-[#dce8d6] text-[#121815] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-[#e3eee0] shadow-md relative overflow-hidden group cursor-pointer"
    >
      {/* Zoom hint in top right */}
      <div className="absolute top-4 right-4 bg-[#c8d8c2] p-1.5 rounded-full text-[#142018] border border-[#b6cbaf] opacity-80 group-hover:opacity-100 transition-opacity">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3 pr-8">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-[#c8d8c2] text-[#142018]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-normal tracking-tight text-[#121815]">
              Recommendations
            </h2>
            <p className="text-[11px] text-[#415548] font-medium">
              Click to view detailed 24h day summary & AI audit
            </p>
          </div>
        </div>
      </div>

      {/* Primary recommendation tile */}
      <div className="space-y-3 my-auto">
        <div className="p-3.5 rounded-2xl bg-[#cfe0c9]/90 border border-[#bccfb5] transition-all hover:bg-[#c9dbc3]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2d4034] bg-[#b9cda4] px-2 py-0.5 rounded-full">
              {recommendations.primaryTag}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleSpeak}
                className="p-1 rounded-full text-[#28382d] hover:text-black transition-colors"
                title="Voice Readout"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-700" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={fetchGeminiAnalysis}
                disabled={isLoading}
                className="p-1 rounded-full text-[#28382d] hover:text-black transition-colors"
                title="Refresh with Gemini AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#121815] leading-snug">
            {recommendations.primaryTitle}
          </h3>
          <p className="text-xs text-[#34473b] mt-1 leading-relaxed line-clamp-2">
            {recommendations.primarySubtitle}
          </p>
        </div>

        {/* Secondary recommendation tile */}
        <div className="p-3 rounded-2xl bg-[#cfe0c9]/60 border border-[#bccfb5]/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3d5245]">
              {recommendations.secondaryTag}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2e4034]" />
          </div>
          <h4 className="text-xs font-semibold text-[#121815] line-clamp-1">
            {recommendations.secondaryTitle}
          </h4>
          <p className="text-[11px] text-[#3d5043] mt-0.5 line-clamp-2">
            {recommendations.secondarySubtitle}
          </p>
        </div>
      </div>

      {/* Interactive Ask AI Input Form */}
      <form
        onSubmit={handleAskQuestion}
        onClick={(e) => e.stopPropagation()}
        className="mt-3 relative flex items-center"
      >
        <input
          id="ai-prompt-input"
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask Gemini: 'How to save ₹200 today?'"
          className="w-full bg-[#cfdec8] border border-[#b6cbb0] rounded-full py-1.5 pl-3.5 pr-8 text-xs text-[#121815] placeholder-[#576b5d] focus:outline-none focus:border-[#121815] font-medium"
        />
        <button
          type="submit"
          disabled={isAnsweringCustom}
          className="absolute right-1.5 p-1 rounded-full bg-[#121815] text-white hover:bg-[#202923] transition-colors disabled:opacity-50"
        >
          {isAnsweringCustom ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
        </button>
      </form>

      {/* Inline response preview */}
      {customAnswer && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2 p-2 rounded-xl bg-[#c5d8bf] border border-[#b2c8ab] text-[11px] text-[#19271e] leading-snug animate-fadeIn"
        >
          <span className="font-semibold text-[#121815]">Gemini: </span>
          {customAnswer}
        </div>
      )}
    </div>
  );
};
