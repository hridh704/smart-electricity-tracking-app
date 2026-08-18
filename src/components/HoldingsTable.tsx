import React from 'react';
import { SimulationState } from '../types';

interface HoldingsTableProps {
  simState: SimulationState;
  currentNetKw: number;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ simState, currentNetKw }) => {
  const { activeToggles, currentSimHour } = simState;

  // Appliance items formatted like stock positions in the terminal
  const appliances = [
    {
      ticker: 'AC-INV',
      name: 'Air Conditioner',
      loadKw: activeToggles.airConditioner ? 2.5 : 0.0,
      currentA: activeToggles.airConditioner ? 11.2 : 0.0,
      chg: activeToggles.airConditioner ? '+0.37' : '-0.06',
      chgPercent: activeToggles.airConditioner ? '+14.8%' : '-2.1%',
      isPositive: activeToggles.airConditioner,
      share: activeToggles.airConditioner ? '42.0%' : '0.0%',
      status: activeToggles.airConditioner ? 'ON' : 'OFF',
    },
    {
      ticker: 'GEYSER',
      name: 'Water Heater',
      loadKw: activeToggles.waterHeaterAnomaly ? 3.2 : 0.0,
      currentA: activeToggles.waterHeaterAnomaly ? 14.1 : 0.0,
      chg: activeToggles.waterHeaterAnomaly ? '+3.20' : '-0.02',
      chgPercent: activeToggles.waterHeaterAnomaly ? '+99.0%' : '-0.5%',
      isPositive: activeToggles.waterHeaterAnomaly,
      share: activeToggles.waterHeaterAnomaly ? '35.4%' : '0.0%',
      status: activeToggles.waterHeaterAnomaly ? 'SPIKE' : 'IDLE',
    },
    {
      ticker: 'SOLAR',
      name: 'Rooftop Array',
      loadKw: activeToggles.solarInverter ? -1.8 : 0.0,
      currentA: activeToggles.solarInverter ? 7.8 : 0.0,
      chg: activeToggles.solarInverter ? '-1.80' : '0.00',
      chgPercent: activeToggles.solarInverter ? '-18.5%' : '0.0%',
      isPositive: false,
      share: activeToggles.solarInverter ? '-20.0%' : '0.0%',
      status: activeToggles.solarInverter ? 'GEN' : 'OFF',
    },
    {
      ticker: 'EV-CHG',
      name: 'EV Level-2 Fast',
      loadKw: activeToggles.evCharger ? 4.0 : 0.0,
      currentA: activeToggles.evCharger ? 17.5 : 0.0,
      chg: activeToggles.evCharger ? '+4.00' : '0.00',
      chgPercent: activeToggles.evCharger ? '+45.0%' : '0.0%',
      isPositive: activeToggles.evCharger,
      share: activeToggles.evCharger ? '48.2%' : '0.0%',
      status: activeToggles.evCharger ? 'ON' : 'OFF',
    },
    {
      ticker: 'REFRIG',
      name: 'Inverter Refrig',
      loadKw: 0.28,
      currentA: 1.25,
      chg: '+0.01',
      chgPercent: '+0.4%',
      isPositive: true,
      share: '6.5%',
      status: 'AUTO',
    },
    {
      ticker: 'LIGHTS',
      name: 'LED Array (House)',
      loadKw: activeToggles.allLightsOff ? 0.05 : 0.45,
      currentA: activeToggles.allLightsOff ? 0.22 : 2.0,
      chg: activeToggles.allLightsOff ? '-0.40' : '+0.05',
      chgPercent: activeToggles.allLightsOff ? '-88.0%' : '+1.2%',
      isPositive: !activeToggles.allLightsOff,
      share: activeToggles.allLightsOff ? '1.0%' : '7.8%',
      status: activeToggles.allLightsOff ? 'DIM' : 'ON',
    },
    {
      ticker: 'STANDBY',
      name: 'Phantom Circuit',
      loadKw: 0.12 + simState.baseLoadKw,
      currentA: 0.55,
      chg: '-0.01',
      chgPercent: '-0.1%',
      isPositive: false,
      share: '3.1%',
      status: 'BASE',
    },
  ];

  // Tariff Schedule table like Earnings Calendar in screenshot
  const tariffSlabs = [
    {
      ticker: 'PEAK_TOU',
      window: '18:00 - 22:00',
      rate: '₹11.20 / kWh',
      status: currentSimHour >= 18 && currentSimHour < 22 ? 'ACTIVE' : 'UPCOMING',
      impact: '+49% Peak Surcharge',
      isHot: currentSimHour >= 18 && currentSimHour < 22,
    },
    {
      ticker: 'TIER_1',
      window: '0 - 100 kWh',
      rate: '₹4.50 / kWh',
      status: 'LIFELINE',
      impact: 'Base Domestic Slab',
      isHot: false,
    },
    {
      ticker: 'TIER_2',
      window: '101 - 300 kWh',
      rate: '₹7.25 / kWh',
      status: 'STANDARD',
      impact: 'Mid-Tier domestic',
      isHot: false,
    },
    {
      ticker: 'TIER_3',
      window: '> 300 kWh',
      rate: '₹9.80 / kWh',
      status: 'SURPLUS',
      impact: 'High tier penalty',
      isHot: false,
    },
    {
      ticker: 'OFF_PEAK',
      window: '23:00 - 06:00',
      rate: '₹5.50 / kWh',
      status: 'NIGHT',
      impact: 'Optimal for EV/Geyser',
      isHot: currentSimHour >= 23 || currentSimHour < 6,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Appliance NILM Holdings Table */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            NILM APPLIANCE TELEMETRY
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            {appliances.filter((a) => a.loadKw !== 0).length} ACTIVE LOADS
          </span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-1 px-3 py-1.5 border-b border-[#1e2638] text-[10px] font-mono text-slate-400 bg-[#0c1019] uppercase tracking-wider">
          <div className="col-span-3">TICKER</div>
          <div className="col-span-2 text-right">LOAD kW</div>
          <div className="col-span-2 text-right">AMPS</div>
          <div className="col-span-3 text-right">CHG%</div>
          <div className="col-span-2 text-right">ALLOC%</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#182030] font-mono text-[11px]">
          {appliances.map((app) => (
            <div
              key={app.ticker}
              className="grid grid-cols-12 gap-1 px-3 py-1.5 items-center hover:bg-[#151c2c] transition"
            >
              <div className="col-span-3 flex items-center gap-1.5">
                <span className="font-bold text-slate-100">{app.ticker}</span>
              </div>
              <div className="col-span-2 text-right text-slate-300">
                {app.loadKw.toFixed(2)}
              </div>
              <div className="col-span-2 text-right text-slate-400">
                {app.currentA.toFixed(1)}A
              </div>
              <div
                className={`col-span-3 text-right font-medium ${
                  app.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {app.chgPercent}
              </div>
              <div className="col-span-2 text-right text-slate-300 font-semibold">
                {app.share}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tariff Schedule Matrix (Styled like EARNINGS CALENDAR in reference screenshot) */}
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
          <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            TOU TARIFF SCHEDULE
          </span>
          <span className="font-mono text-[10px] bg-[#1a2334] text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
            DISCOM MATRIX
          </span>
        </div>

        <div className="grid grid-cols-12 gap-1 px-3 py-1.5 border-b border-[#1e2638] text-[10px] font-mono text-slate-400 bg-[#0c1019] uppercase tracking-wider">
          <div className="col-span-4">SLAB / TIME</div>
          <div className="col-span-4 text-right">RATE (₹/kWh)</div>
          <div className="col-span-4 text-right">STATUS</div>
        </div>

        <div className="divide-y divide-[#182030] font-mono text-[11px]">
          {tariffSlabs.map((slab) => (
            <div
              key={slab.ticker}
              className={`grid grid-cols-12 gap-1 px-3 py-1.5 items-center hover:bg-[#151c2c] transition ${
                slab.isHot ? 'bg-[#1e222f]/60' : ''
              }`}
            >
              <div className="col-span-4">
                <div className="font-bold text-slate-100">{slab.ticker}</div>
                <div className="text-[9px] text-slate-400">{slab.window}</div>
              </div>
              <div className="col-span-4 text-right">
                <span className={slab.isHot ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {slab.rate}
                </span>
              </div>
              <div className="col-span-4 text-right">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    slab.isHot
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {slab.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
