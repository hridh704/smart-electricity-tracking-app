export interface Esp32Packet {
  id: number;
  timestamp: string;
  timeHour: number; // 0-23
  timeMinute: number; // 0-59
  deviceId: string;
  voltageV: number;
  currentA: number;
  powerKw: number;
  powerFactor: number;
  frequencyHz: number;
  crc: string;
  anomalyScore: number;
  isAnomaly: boolean;
  activeApplianceTags: string[];
}

export interface TimePointData {
  timeLabel: string;
  timestamp: string;
  hour: number;
  minute: number;
  totalLoadKw: number;
  baseLoadKw: number;
  solarKw: number;
  netLoadKw: number;
  isPeakHour: boolean;
  isAnomaly: boolean;
  anomalyNote?: string;
  estimatedCostRateInrPerHour: number;
}

export interface SimulationState {
  currentSimHour: number;
  currentSimMinute: number;
  simSpeedMultiplier: number; // 1x, 5x, 10x, 30x
  isPaused: boolean;
  baseLoadKw: number;
  ambientTempC: number;
  activeToggles: {
    airConditioner: boolean;
    allLightsOff: boolean;
    waterHeaterAnomaly: boolean;
    evCharger: boolean;
    solarInverter: boolean;
    inductionCooktop: boolean;
  };
  anomalyFlagged: boolean;
  anomalyReason: string;
}

export interface TariffBreakdown {
  currentRatePerKwh: number; // in INR
  isPeakHour: boolean;
  projectedMonthlyKwh: number;
  projectedMonthlyInr: number;
  dailyCostInr: number;
  potentialSavingsInr: number;
  co2EmissionsKgPerMonth: number;
}

export interface GeminiAnalysisResult {
  bulletPoints: string[];
  fullText: string;
  estimatedMonthlySavingsInr: number;
  timestamp: string;
  source: 'gemini-3.7-flash' | 'edge-rule-engine';
  confidenceScore: number;
}

export interface DaySpreadsheetRow {
  id: string;
  hour: number;
  timeSlot: string;
  activeLoadKw: number;
  solarKw: number;
  netGridKw: number;
  voltageV: number;
  currentA: number;
  powerFactor: number;
  tariffRateInr: number;
  hourlyCostInr: number;
  primaryAppliance: string;
  status: 'Normal' | 'Peak Tariff' | 'Solar High' | 'Anomaly Alert';
  co2Grams: number;
}

export type NavTab = 'dashboard' | 'apartments' | 'spreadsheet' | 'reporting' | 'settings';

