import React, { useState } from 'react';
import { ChevronDown, Maximize2 } from 'lucide-react';

interface DetailedReportCardProps {
  onOpenSpreadsheetTab?: () => void;
  onCardClick?: () => void;
}

export const DetailedReportCard: React.FC<DetailedReportCardProps> = ({
  onOpenSpreadsheetTab,
  onCardClick,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Wed');

  const daysData = [
    { day: 'Mon', trend: '↑', isUp: true, value: 276 },
    { day: 'Tue', trend: '↑', isUp: true, value: 282 },
    { day: 'Wed', trend: '↑', isUp: true, value: 297 },
    { day: 'Thu', trend: '↓', isUp: false, value: 269 },
    { day: 'Fri', trend: '↑', isUp: true, value: 274 },
    { day: 'Sat', trend: '↓', isUp: false, value: 175 },
    { day: 'Sun', trend: '↓', isUp: false, value: 138 },
  ];

  return (
    <div
      id="detailed-report-card"
      onClick={onCardClick}
      className="bg-[#141716] border border-[#232926] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#38483e] hover:shadow-lg cursor-pointer group relative overflow-hidden"
    >
      {/* Zoom icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[#202723] p-1.5 rounded-full text-[#dce8d6] border border-[#303d35] z-10">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-4 pr-6">
        <div>
          <h2 className="text-lg sm:text-xl font-normal text-white tracking-tight">
            Detailed report
          </h2>
          <p className="text-xs text-[#8a948e] mt-0.5">
            Graphs of energy consumption (Click for weekly analysis)
          </p>
        </div>

        <button
          id="btn-filter-week"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSpreadsheetTab?.();
          }}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#181d1b] border border-[#2d3630] text-xs text-[#d1dbd4] hover:text-white hover:border-[#404c44] transition-all cursor-pointer"
        >
          <span>Week</span>
          <ChevronDown className="w-3 h-3 text-[#8a948e]" />
        </button>
      </div>

      {/* Days Consumption Grid Bars */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4 pt-2">
        {daysData.map((item) => {
          const isSelected = selectedDay === item.day;
          return (
            <div
              key={item.day}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDay(item.day as any);
              }}
              className={`flex flex-col justify-between items-center py-2 px-1 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-[#121815] shadow-sm transform -translate-y-1'
                  : 'bg-[#181d1b] text-[#8a948e] border border-[#242b27] hover:border-[#35413a] hover:text-white'
              }`}
            >
              {/* Day Name & Trend Arrow */}
              <div className="text-[11px] font-medium flex items-center gap-0.5">
                <span>{item.day}</span>
                <span
                  className={`text-[10px] ${
                    isSelected
                      ? 'text-[#121815]'
                      : item.isUp
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {item.trend}
                </span>
              </div>

              {/* Bar representation */}
              <div className="w-full px-1.5 my-2 flex items-end justify-center h-12">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isSelected ? 'bg-[#121815]' : 'bg-[#2b3530]'
                  }`}
                  style={{ height: `${(item.value / 300) * 100}%` }}
                />
              </div>

              {/* Number Value */}
              <div className="text-center">
                <div
                  className={`text-xs font-semibold tracking-tight font-mono ${
                    isSelected ? 'text-[#121815]' : 'text-[#d5ded8]'
                  }`}
                >
                  {item.value}
                </div>
                <div
                  className={`text-[9px] ${
                    isSelected ? 'text-[#3e4f45]' : 'text-[#6e7a73]'
                  }`}
                >
                  kWh
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
