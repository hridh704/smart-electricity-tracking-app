import { DaySpreadsheetRow, SimulationState } from '../types';

export function generateDailySpreadsheetData(simState?: SimulationState): DaySpreadsheetRow[] {
  const isSolarOn = simState?.activeToggles.solarInverter ?? true;
  const isAnomalyOn = simState?.activeToggles.waterHeaterAnomaly ?? false;
  const isAcOn = simState?.activeToggles.airConditioner ?? false;
  const isEvOn = simState?.activeToggles.evCharger ?? false;

  const rows: DaySpreadsheetRow[] = [];

  const applianceSchedule = [
    { hour: 0, appliance: 'Standby / Refrigerator' },
    { hour: 1, appliance: 'Standby / Refrigerator' },
    { hour: 2, appliance: 'Standby / Refrigerator' },
    { hour: 3, appliance: isAnomalyOn ? 'Water Heater (Anomaly Leak)' : 'Standby / Night Fan' },
    { hour: 4, appliance: isAnomalyOn ? 'Water Heater (Anomaly Leak)' : 'Standby / Night Fan' },
    { hour: 5, appliance: 'Standby / Night Light' },
    { hour: 6, appliance: 'Geyser / Water Heater' },
    { hour: 7, appliance: 'Induction Cooktop & Geyser' },
    { hour: 8, appliance: 'Espresso Maker / Toaster' },
    { hour: 9, appliance: 'Home Office Workstation' },
    { hour: 10, appliance: 'Home Office & Smart Lights' },
    { hour: 11, appliance: 'Washing Machine (Solar Synced)' },
    { hour: 12, appliance: 'Dishwasher & Solar Inverter' },
    { hour: 13, appliance: 'Solar Export & Office Load' },
    { hour: 14, appliance: isAcOn ? 'Air Conditioner & Office' : 'Solar Inverter / Office' },
    { hour: 15, appliance: isAcOn ? 'Air Conditioner & Office' : 'Office PC & Refrigerator' },
    { hour: 16, appliance: 'Robotic Vacuum & Audio' },
    { hour: 17, appliance: 'Living Room Lights' },
    { hour: 18, appliance: 'Kitchen Hood & Induction' },
    { hour: 19, appliance: isAcOn ? 'Air Conditioner (Peak Tariff)' : 'Smart TV & Living Lights' },
    { hour: 20, appliance: isAcOn ? 'Air Conditioner (Peak Tariff)' : 'Dinner Cooktop & Lights' },
    { hour: 21, appliance: isAcOn ? 'Air Conditioner & Smart TV' : 'Smart TV & Ceiling Fan' },
    { hour: 22, appliance: isEvOn ? 'EV Fast Charger (Night)' : 'Bedroom Lighting & Laptop' },
    { hour: 23, appliance: isEvOn ? 'EV Fast Charger (Night)' : 'Standby / Air Purifier' },
  ];

  for (let h = 0; h < 24; h++) {
    const timeSlot = `${String(h).padStart(2, '0')}:00 - ${String((h + 1) % 24).padStart(2, '0')}:00`;
    
    // Baseline load curve
    let baseLoad = 0.55;
    if (h >= 6 && h <= 9) baseLoad = 1.85;
    else if (h >= 10 && h <= 16) baseLoad = 1.15;
    else if (h >= 17 && h <= 21) baseLoad = 2.45;
    else if (h >= 22) baseLoad = 0.95;

    // Apply modifiers
    if (isAcOn && ((h >= 14 && h <= 16) || (h >= 19 && h <= 22))) {
      baseLoad += 2.2;
    }
    if (isAnomalyOn && (h >= 2 && h <= 4)) {
      baseLoad += 3.2;
    }
    if (isEvOn && (h >= 22 || h === 23)) {
      baseLoad += 3.8;
    }

    // Add mild natural fluctuation
    const noise = Math.sin(h * 0.9) * 0.08;
    const activeLoadKw = Math.max(0.35, Number((baseLoad + noise).toFixed(2)));

    // Solar generation (peaks 11:00 - 14:00)
    let solarKw = 0;
    if (isSolarOn && h >= 7 && h <= 17) {
      const peakDist = Math.abs(h - 12.5);
      const solarCurve = Math.max(0, 2.4 - peakDist * 0.45);
      solarKw = Number(Math.max(0, solarCurve).toFixed(2));
    }

    const netGridKw = Number(Math.max(0.05, activeLoadKw - solarKw).toFixed(2));
    const isPeak = h >= 18 && h < 22; // 6 PM - 10 PM
    const tariffRateInr = isPeak ? 11.20 : 7.50;
    const hourlyCostInr = Number((netGridKw * tariffRateInr).toFixed(2));

    // Voltage & Current calculation
    const voltageV = Number((230 + Math.sin(h * 1.1) * 2.5).toFixed(1));
    const currentA = Number(((netGridKw * 1000) / (voltageV * 0.96)).toFixed(1));
    const powerFactor = Number((0.95 + (Math.sin(h) * 0.03)).toFixed(2));
    const co2Grams = Math.round(netGridKw * 820); // 820g CO2 per kWh grid avg in India

    let status: DaySpreadsheetRow['status'] = 'Normal';
    if (isAnomalyOn && (h >= 2 && h <= 4)) {
      status = 'Anomaly Alert';
    } else if (isPeak) {
      status = 'Peak Tariff';
    } else if (solarKw >= 1.5) {
      status = 'Solar High';
    }

    rows.push({
      id: `row-${h}`,
      hour: h,
      timeSlot,
      activeLoadKw,
      solarKw,
      netGridKw,
      voltageV,
      currentA,
      powerFactor,
      tariffRateInr,
      hourlyCostInr,
      primaryAppliance: applianceSchedule[h].appliance,
      status,
      co2Grams,
    });
  }

  return rows;
}

export function exportSpreadsheetToCsv(rows: DaySpreadsheetRow[]) {
  const headers = [
    'Time Slot',
    'Hour',
    'Active Load (kW)',
    'Solar Generation (kW)',
    'Net Grid Power (kW)',
    'Grid Voltage (V)',
    'Current Draw (A)',
    'Power Factor',
    'Tariff Rate (INR/kWh)',
    'Hourly Cost (INR)',
    'Primary Load / Appliance',
    'System Status',
    'Carbon Footprint (g CO2)',
  ];

  const csvRows = rows.map((r) => [
    `"${r.timeSlot}"`,
    r.hour,
    r.activeLoadKw,
    r.solarKw,
    r.netGridKw,
    r.voltageV,
    r.currentA,
    r.powerFactor,
    r.tariffRateInr,
    r.hourlyCostInr,
    `"${r.primaryAppliance}"`,
    `"${r.status}"`,
    r.co2Grams,
  ]);

  const csvContent = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SmartEnergy_Daily_Spreadsheet_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
