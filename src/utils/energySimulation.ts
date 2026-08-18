import { Esp32Packet, TimePointData, SimulationState, TariffBreakdown } from '../types';

/**
 * Base diurnal consumption profile for a typical smart household (kW)
 */
function getBaselineLoadForTime(hour: number, minute: number): number {
  const timeDec = hour + minute / 60;
  
  // 00:00 - 05:30: Sleep hours (refrigerator cycles, standby)
  if (timeDec < 5.5) {
    return 0.45 + Math.sin(timeDec * 1.2) * 0.1;
  }
  // 05:30 - 09:00: Morning peak (cooking, water heating, lights)
  if (timeDec < 9.0) {
    const t = (timeDec - 5.5) / 3.5;
    return 0.8 + Math.sin(t * Math.PI) * 1.8;
  }
  // 09:00 - 16:30: Daytime low (occupants away/work/school)
  if (timeDec < 16.5) {
    return 0.9 + Math.sin((timeDec - 9) * 0.4) * 0.3;
  }
  // 16:30 - 18:00: Pre-evening ramp up
  if (timeDec < 18.0) {
    return 1.4 + (timeDec - 16.5) * 0.8;
  }
  // 18:00 - 22:00: Peak domestic hours (6 PM - 10 PM)
  if (timeDec <= 22.0) {
    const t = (timeDec - 18.0) / 4.0;
    return 2.5 + Math.sin(t * Math.PI) * 1.9;
  }
  // 22:00 - 24:00: Winding down
  return 1.6 - ((timeDec - 22.0) / 2.0) * 1.0;
}

/**
 * Solar production curve (kW) - peaks between 11 AM and 2 PM
 */
export function getSolarGenerationForTime(hour: number, minute: number, isSolarActive: boolean): number {
  if (!isSolarActive) return 0;
  const timeDec = hour + minute / 60;
  if (timeDec < 6.5 || timeDec > 18.0) return 0;
  const t = (timeDec - 6.5) / 11.5;
  return Math.max(0, Math.sin(t * Math.PI) * 2.2);
}

/**
 * Is the given hour in the peak tariff window (6 PM to 10 PM)
 */
export function isPeakTariffHour(hour: number): boolean {
  return hour >= 18 && hour < 22;
}

/**
 * Generates initial 24-hour dataset with 5-minute intervals (288 data points)
 */
export function generateInitial24HourData(simState: SimulationState): TimePointData[] {
  const points: TimePointData[] = [];
  
  for (let step = 0; step < 288; step++) {
    const totalMinutes = step * 5;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const base = getBaselineLoadForTime(hour, minute);
    
    // Add baseline noise
    const noise = (Math.sin(step * 0.7) * 0.08) + (Math.cos(step * 1.3) * 0.05);
    let totalLoad = Math.max(0.2, base + noise);
    
    // Check if water heater anomaly is turned on and this is the 3 AM window (02:00 - 05:00)
    let isAnomaly = false;
    let anomalyNote = undefined;
    
    if (simState.activeToggles.waterHeaterAnomaly && hour >= 2 && hour <= 4) {
      totalLoad += 3.2;
      isAnomaly = true;
      anomalyNote = "3 AM Water Heater Unattended Spike";
    }

    const solar = getSolarGenerationForTime(hour, minute, simState.activeToggles.solarInverter);
    const netLoad = Math.max(0.05, totalLoad - solar);
    const isPeak = isPeakTariffHour(hour);

    const costRate = isPeak ? netLoad * 11.20 : netLoad * 7.50;

    points.push({
      timeLabel,
      timestamp: `2026-08-17T${timeLabel}:00Z`,
      hour,
      minute,
      totalLoadKw: Number(totalLoad.toFixed(2)),
      baseLoadKw: Number(base.toFixed(2)),
      solarKw: Number(solar.toFixed(2)),
      netLoadKw: Number(netLoad.toFixed(2)),
      isPeakHour: isPeak,
      isAnomaly,
      anomalyNote,
      estimatedCostRateInrPerHour: Number(costRate.toFixed(2)),
    });
  }

  return points;
}

/**
 * Calculates current real-time load based on baseline + active appliance modifiers
 */
export function calculateCurrentLoad(simState: SimulationState): {
  activeKw: number;
  modifiersKw: number;
  solarKw: number;
  netKw: number;
  anomalyDetected: boolean;
  anomalyReason: string;
  activeApplianceTags: string[];
} {
  const { currentSimHour, currentSimMinute, activeToggles } = simState;
  
  const base = getBaselineLoadForTime(currentSimHour, currentSimMinute) + simState.baseLoadKw;
  let modifiers = 0;
  const activeTags: string[] = [];

  // Required simulation modifiers
  if (activeToggles.airConditioner) {
    // Air Conditioner +2.5 kW (adjusted by ambient temp)
    const tempFactor = Math.max(1.0, (simState.ambientTempC - 24) * 0.05 + 1.0);
    const acLoad = 2.5 * tempFactor;
    modifiers += acLoad;
    activeTags.push(`Air Conditioner (+${acLoad.toFixed(1)} kW)`);
  }

  if (activeToggles.allLightsOff) {
    // Turn off all lights -0.4 kW
    modifiers -= 0.4;
    activeTags.push("All Lights Extinguished (-0.4 kW)");
  }

  let anomalyDetected = false;
  let anomalyReason = "Nominal Operation";

  // Simulate 3 AM anomaly spike (+3.2 kW)
  if (activeToggles.waterHeaterAnomaly) {
    modifiers += 3.2;
    activeTags.push("Water Heater Overnight (+3.2 kW)");
    
    // If it's night time (11 PM - 6 AM), this is a critical anomaly
    if (currentSimHour >= 23 || currentSimHour <= 6) {
      anomalyDetected = true;
      anomalyReason = `Edge-AI Alert: Unusual high load (${(base + modifiers).toFixed(2)} kW) during off-peak sleep hours (${String(currentSimHour).padStart(2, '0')}:${String(currentSimMinute).padStart(2, '0')}). Possible unattended heating element!`;
    }
  }

  if (activeToggles.evCharger) {
    modifiers += 4.0;
    activeTags.push("EV Fast Charger (+4.0 kW)");
  }

  if (activeToggles.inductionCooktop) {
    modifiers += 1.5;
    activeTags.push("Induction Cooktop (+1.5 kW)");
  }

  // Micro-jitter to mimic live real-world sensor sampling
  const jitter = (Math.random() - 0.5) * 0.06;
  const activeKw = Math.max(0.1, Number((base + modifiers + jitter).toFixed(2)));

  const solarKw = Number(getSolarGenerationForTime(currentSimHour, currentSimMinute, activeToggles.solarInverter).toFixed(2));
  if (activeToggles.solarInverter && solarKw > 0) {
    activeTags.push(`Rooftop Solar (-${solarKw.toFixed(1)} kW)`);
  }

  const netKw = Math.max(0.05, Number((activeKw - solarKw).toFixed(2)));

  // Global threshold anomaly check (if household load exceeds 6.0 kW without EV or solar)
  if (netKw > 6.0 && !anomalyDetected) {
    anomalyDetected = true;
    anomalyReason = `Edge-AI Alert: Heavy concurrent load (${netKw.toFixed(2)} kW) exceeding safe circuit breaker threshold (6.0 kW).`;
  }

  return {
    activeKw,
    modifiersKw: Number(modifiers.toFixed(2)),
    solarKw,
    netKw,
    anomalyDetected,
    anomalyReason,
    activeApplianceTags: activeTags,
  };
}

/**
 * Computes live tariff calculations in Indian Rupees (₹)
 */
export function calculateTariff(currentNetKw: number, currentHour: number): TariffBreakdown {
  const isPeak = isPeakTariffHour(currentHour);
  const currentRatePerKwh = isPeak ? 11.20 : 7.50; // ₹11.20 during peak 6-10 PM, ₹7.50 normal

  // Monthly energy projection: Avg daily hours * 30 days
  // Typical daily kWh assuming current average behavior ~ netKw * 18 effective equivalent hours/day
  const dailyKwh = currentNetKw * 24 * 0.65; // realistic diversity factor
  const projectedMonthlyKwh = Math.round(dailyKwh * 30);

  // Progressive tiered tariff slab in INR:
  // 0 - 100 kWh @ ₹4.50
  // 101 - 300 kWh @ ₹7.25
  // > 300 kWh @ ₹9.80
  // + Peak hour premium for ~4 hours/day (4/24 = 16.6% of energy subject to +₹3.70 surcharge)
  let baseCost = 0;
  if (projectedMonthlyKwh <= 100) {
    baseCost = projectedMonthlyKwh * 4.50;
  } else if (projectedMonthlyKwh <= 300) {
    baseCost = 100 * 4.50 + (projectedMonthlyKwh - 100) * 7.25;
  } else {
    baseCost = 100 * 4.50 + 200 * 7.25 + (projectedMonthlyKwh - 300) * 9.80;
  }

  // Peak ToU penalty
  const peakUnits = projectedMonthlyKwh * (4 / 24) * 1.4; // 4 hours peak per day with higher intensity
  const peakSurcharge = peakUnits * 3.70;
  const fixedMeterCharges = 120; // ₹120 monthly fixed meter charge
  const electricityDuty = (baseCost + peakSurcharge) * 0.09; // 9% state electricity tax

  const projectedMonthlyInr = Math.round(baseCost + peakSurcharge + fixedMeterCharges + electricityDuty);
  const dailyCostInr = Number((projectedMonthlyInr / 30).toFixed(2));

  // Potential savings if high-power appliances are shifted to off-peak
  const potentialSavingsInr = Math.round(projectedMonthlyInr * 0.28);

  // Carbon footprint: Indian grid emission factor ~ 0.82 kg CO2 per kWh
  const co2EmissionsKgPerMonth = Math.round(projectedMonthlyKwh * 0.82);

  return {
    currentRatePerKwh,
    isPeakHour: isPeak,
    projectedMonthlyKwh,
    projectedMonthlyInr,
    dailyCostInr,
    potentialSavingsInr,
    co2EmissionsKgPerMonth,
  };
}

/**
 * Creates an ESP32 hardware telemetry packet mimicking SCT-013 + ZMPT101B ADC readings
 */
let packetCounter = 1042;

export function generateEsp32Packet(
  simState: SimulationState,
  loadData: ReturnType<typeof calculateCurrentLoad>
): Esp32Packet {
  packetCounter += 1;
  const { currentSimHour, currentSimMinute } = simState;
  
  // Real-world Indian grid voltage: 230V nominal with slight ±2.5V fluctuation
  const voltageV = Number((230.0 + (Math.random() - 0.5) * 4.2).toFixed(1));
  
  // Power factor: 0.96 for resistive, 0.88-0.92 when inductive loads (AC/compressors) active
  const hasInductive = simState.activeToggles.airConditioner || simState.activeToggles.waterHeaterAnomaly;
  const powerFactor = Number((hasInductive ? 0.89 + Math.random() * 0.04 : 0.97 + Math.random() * 0.02).toFixed(2));
  
  const powerKw = loadData.netKw;
  const powerWatts = powerKw * 1000;
  const currentA = Number((powerWatts / (voltageV * powerFactor)).toFixed(2));
  
  // Grid Frequency: 50.00 Hz nominal (±0.04 Hz)
  const frequencyHz = Number((50.00 + (Math.random() - 0.5) * 0.08).toFixed(2));
  
  // Anomaly score: 0.0 to 1.0 (Z-score normalized)
  const anomalyScore = loadData.anomalyDetected ? Number((0.85 + Math.random() * 0.12).toFixed(2)) : Number((0.03 + Math.random() * 0.08).toFixed(2));
  
  // Simulated hardware CRC-16 checksum
  const crcNum = (packetCounter * 31 + Math.round(powerKw * 100)) % 65535;
  const crc = `0x${crcNum.toString(16).toUpperCase().padStart(4, '0')}`;

  const timeString = `${String(currentSimHour).padStart(2, '0')}:${String(currentSimMinute).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

  return {
    id: packetCounter,
    timestamp: timeString,
    timeHour: currentSimHour,
    timeMinute: currentSimMinute,
    deviceId: "ESP32_SMART_PANEL_NODE_01",
    voltageV,
    currentA,
    powerKw,
    powerFactor,
    frequencyHz,
    crc,
    anomalyScore,
    isAnomaly: loadData.anomalyDetected,
    activeApplianceTags: loadData.activeApplianceTags,
  };
}

/**
 * Intelligent Preset Rule-Engine fallback for AI tips when no API key is supplied
 */
export function getPresetAiAuditTip(
  currentKw: number,
  simState: SimulationState,
  tariff: TariffBreakdown
): { bulletPoints: string[]; estimatedSavings: number } {
  const { currentSimHour, activeToggles } = simState;
  const isPeak = isPeakTariffHour(currentSimHour);

  if (activeToggles.waterHeaterAnomaly) {
    return {
      bulletPoints: [
        `🔴 **Critical Night Heating Anomaly**: The 3.2 kW water heater is running continuously during 3:00 AM off-peak sleep hours. Install an automated thermal timer relay to prevent boiling cycles, saving **₹1,850/month**.`,
        `💡 **Edge Isolation Recommendation**: Schedule geyser heating 20 minutes before waking at 6:30 AM rather than overnight continuous maintenance.`
      ],
      estimatedSavings: 1850,
    };
  }

  if (activeToggles.airConditioner && isPeak) {
    return {
      bulletPoints: [
        `⚡ **Peak-Hour Tariff Surcharge Alert**: AC load (+2.5 kW) is currently active during peak window (6 PM - 10 PM) at **₹11.20/kWh**. Increase thermostat setpoint from 21°C to 24°C to immediately reduce compressor duty cycle by 24%, saving **₹1,200/month**.`,
        `🔄 **Pre-Cooling Protocol**: Pre-cool living zones at 5:00 PM (base tariff ₹7.50) and utilize ceiling fan circulation during the 6–10 PM peak surcharge window.`
      ],
      estimatedSavings: 1200,
    };
  }

  if (activeToggles.evCharger && isPeak) {
    return {
      bulletPoints: [
        `🚗 **Shift EV Fast Charging**: The 4.0 kW EV charger is pulling high peak tariff units. Defer vehicle charging to post-11:00 PM off-peak window to eliminate high ToU surcharges, saving **₹2,400/month**.`,
        `🔋 **Smart Inverter Buffer**: If solar storage is installed, divert battery discharge to EV during 6–8 PM to clip household grid demand peaks.`
      ],
      estimatedSavings: 2400,
    };
  }

  if (activeToggles.solarInverter) {
    return {
      bulletPoints: [
        `☀️ **Solar Self-Consumption Optimization**: Currently offsetting 1.8 kW with rooftop solar. Run heavy inductive appliances (washing machine, dishwasher) between 11:30 AM and 2:30 PM to maximize direct solar usage rather than grid export at lower feed-in rates.`,
        `📉 **Standby Parasitic Load**: Ensure inverter standby efficiency is calibrated above 96% to prevent night-time back-drain.`
      ],
      estimatedSavings: 850,
    };
  }

  if (isPeak) {
    return {
      bulletPoints: [
        `⚠️ **Peak Tariff Window Active (6 PM - 10 PM)**: Electricity cost is currently elevated at **₹11.20/kWh** (+49% over base rate). Restrict high-wattage resistive appliances until after 10:00 PM to save approximately **₹950/month**.`,
        `💡 **Lighting & Ambient Optimization**: Ensure non-essential LED circuits are dimmed and delay non-urgent cooking or laundry cycles by 90 minutes.`
      ],
      estimatedSavings: 950,
    };
  }

  return {
    bulletPoints: [
      `✅ **Nominal Daytime Operation (${currentKw.toFixed(2)} kW)**: Current consumption is well within the baseline efficiency threshold. Keep refrigerator coils clean and maintain standby phantom draw below 80 Watts to save **₹450/month**.`,
      `📊 **ToU Readiness**: Prepare to shift upcoming heavy loads away from the impending 6:00 PM - 10:00 PM peak tariff window to avoid tier penalties.`
    ],
    estimatedSavings: 450,
  };
}
