/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AiRecommendationsCard } from './components/AiRecommendationsCard';
import { TotalEnergyCard } from './components/TotalEnergyCard';
import { GreenConnectionsCard } from './components/GreenConnectionsCard';
import { TrackingCard } from './components/TrackingCard';
import { DetailedReportCard } from './components/DetailedReportCard';
import { GreenEnergyUsageCard } from './components/GreenEnergyUsageCard';
import { DailySpreadsheetView } from './components/DailySpreadsheetView';
import { ApartmentsView } from './components/ApartmentsView';
import { ReportingView } from './components/ReportingView';
import { SettingsView } from './components/SettingsView';
import { ChangeModuleModal } from './components/ChangeModuleModal';
import { CardDetailModal, BentoModalCardType } from './components/CardDetailModal';
import {
  SimulationState,
  NavTab,
} from './types';
import {
  calculateCurrentLoad,
  calculateTariff,
} from './utils/energySimulation';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Simulation State
  const [simState, setSimState] = useState<SimulationState>({
    currentSimHour: 11,
    currentSimMinute: 37,
    simSpeedMultiplier: 1,
    isPaused: false,
    baseLoadKw: 0.0,
    ambientTempC: 30,
    activeToggles: {
      airConditioner: false,
      allLightsOff: false,
      waterHeaterAnomaly: false,
      evCharger: false,
      solarInverter: true,
      inductionCooktop: false,
    },
    anomalyFlagged: false,
    anomalyReason: 'Nominal Operation',
  });

  // Modal State for Changing Modules & Zooming Cards
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [zoomedCard, setZoomedCard] = useState<BentoModalCardType>(null);

  // Derived live metrics
  const currentLoadData = calculateCurrentLoad(simState);
  const currentTariff = calculateTariff(currentLoadData.netKw, simState.currentSimHour);

  // Simulation clock loop
  useEffect(() => {
    if (simState.isPaused) return;

    const intervalMs = Math.max(800, Math.floor(4000 / simState.simSpeedMultiplier));

    const timer = setInterval(() => {
      setSimState((prev) => {
        if (prev.isPaused) return prev;

        let nextMinute = prev.currentSimMinute + 1;
        let nextHour = prev.currentSimHour;

        if (nextMinute >= 60) {
          nextMinute = 0;
          nextHour = (nextHour + 1) % 24;
        }

        const nextState = {
          ...prev,
          currentSimHour: nextHour,
          currentSimMinute: nextMinute,
        };

        const load = calculateCurrentLoad(nextState);
        nextState.anomalyFlagged = load.anomalyDetected;
        nextState.anomalyReason = load.anomalyReason;

        return nextState;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simState.isPaused, simState.simSpeedMultiplier]);

  // Preset Scenario Handler
  const handleApplyPreset = (preset: 'nominal' | 'peakSurge' | 'nightAnomaly' | 'solarEco') => {
    if (preset === 'peakSurge') {
      setSimState((prev) => ({
        ...prev,
        currentSimHour: 19,
        currentSimMinute: 30,
        activeToggles: {
          airConditioner: true,
          allLightsOff: false,
          waterHeaterAnomaly: false,
          evCharger: false,
          solarInverter: false,
          inductionCooktop: true,
        },
      }));
    } else if (preset === 'nightAnomaly') {
      setSimState((prev) => ({
        ...prev,
        currentSimHour: 3,
        currentSimMinute: 15,
        activeToggles: {
          airConditioner: false,
          allLightsOff: true,
          waterHeaterAnomaly: true,
          evCharger: false,
          solarInverter: false,
          inductionCooktop: false,
        },
      }));
    } else if (preset === 'solarEco') {
      setSimState((prev) => ({
        ...prev,
        currentSimHour: 12,
        currentSimMinute: 45,
        activeToggles: {
          airConditioner: false,
          allLightsOff: true,
          waterHeaterAnomaly: false,
          evCharger: false,
          solarInverter: true,
          inductionCooktop: false,
        },
      }));
    } else {
      // Nominal
      setSimState((prev) => ({
        ...prev,
        currentSimHour: 11,
        currentSimMinute: 37,
        activeToggles: {
          airConditioner: false,
          allLightsOff: false,
          waterHeaterAnomaly: false,
          evCharger: false,
          solarInverter: true,
          inductionCooktop: false,
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#c8d4c5] p-2 sm:p-6 lg:p-10 flex items-center justify-center font-sans antialiased selection:bg-[#dce8d6] selection:text-[#121815]">
      {/* Aesthetic Bento Frame Container matching the attached reference image */}
      <div className="w-full max-w-[1440px] bg-[#111413] text-[#f4f7f5] rounded-[24px] sm:rounded-[36px] shadow-2xl border border-[#202723] overflow-hidden flex flex-col min-h-[920px]">
        {/* Navigation & Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          simState={simState}
          onOpenModuleModal={() => setIsModuleModalOpen(true)}
          tariff={currentTariff}
          currentLoadKw={currentLoadData.netKw}
        />

        {/* Dynamic Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
          {currentTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Top Bento Row (Aligned 12-Column Balanced Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
                {/* 1. Total energy consumption (Col-span 5) */}
                <div className="lg:col-span-5 flex flex-col">
                  <TotalEnergyCard
                    simState={simState}
                    onOpenModuleModal={() => setIsModuleModalOpen(true)}
                    currentLoadKw={currentLoadData.netKw}
                    onCardClick={() => setZoomedCard('totalEnergy')}
                  />
                </div>

                {/* 2. Smart Grid Router / Sub-System Bus (Col-span 3) */}
                <div className="lg:col-span-3 flex flex-col">
                  <GreenConnectionsCard
                    simState={simState}
                    onCardClick={() => setZoomedCard('greenConnections')}
                  />
                </div>

                {/* 3. Recommendations / AI Insight (Col-span 4) */}
                <div className="lg:col-span-4 flex flex-col">
                  <AiRecommendationsCard
                    currentLoadKw={currentLoadData.netKw}
                    simState={simState}
                    tariff={currentTariff}
                    anomalyDetected={currentLoadData.anomalyDetected}
                    anomalyReason={currentLoadData.anomalyReason}
                    onCardClick={() => setZoomedCard('aiRecommendations')}
                  />
                </div>
              </div>

              {/* Bottom Bento Row (Aligned 12-Column Balanced Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
                {/* 4. Tracking (Col-span 3) */}
                <div className="lg:col-span-3 flex flex-col">
                  <TrackingCard
                    simState={simState}
                    currentLoadKw={currentLoadData.netKw}
                    onCardClick={() => setZoomedCard('tracking')}
                  />
                </div>

                {/* 5. Detailed report (Col-span 5) */}
                <div className="lg:col-span-5 flex flex-col">
                  <DetailedReportCard
                    onOpenSpreadsheetTab={() => setCurrentTab('spreadsheet')}
                    onCardClick={() => setZoomedCard('detailedReport')}
                  />
                </div>

                {/* 6. Green energy usage (Col-span 4) */}
                <div className="lg:col-span-4 flex flex-col">
                  <GreenEnergyUsageCard
                    simState={simState}
                    onCardClick={() => setZoomedCard('greenEnergyUsage')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'spreadsheet' && (
            <DailySpreadsheetView
              simState={simState}
              onUpdateSimState={setSimState}
            />
          )}

          {currentTab === 'apartments' && (
            <ApartmentsView
              simState={simState}
              currentLoadKw={currentLoadData.netKw}
            />
          )}

          {currentTab === 'reporting' && (
            <ReportingView
              simState={simState}
              tariff={currentTariff}
              currentLoadKw={currentLoadData.netKw}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              simState={simState}
              onUpdateSimState={setSimState}
            />
          )}
        </main>
      </div>

      {/* Change Module / Simulation Modal */}
      <ChangeModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        simState={simState}
        onUpdateSimState={setSimState}
        onApplyPreset={handleApplyPreset}
      />

      {/* Zoomed Bento Card Detail Modal */}
      <CardDetailModal
        cardType={zoomedCard}
        onClose={() => setZoomedCard(null)}
        simState={simState}
        onUpdateSimState={setSimState}
        currentLoadKw={currentLoadData.netKw}
        tariff={currentTariff}
        anomalyDetected={currentLoadData.anomalyDetected}
        anomalyReason={currentLoadData.anomalyReason}
      />
    </div>
  );
}
