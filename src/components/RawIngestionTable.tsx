import React, { useState } from 'react';
import { Copy, Check, Download, Pause, Play, Trash2 } from 'lucide-react';
import { Esp32Packet } from '../types';

interface RawIngestionTableProps {
  packets: Esp32Packet[];
  onClearLogs: () => void;
}

export const RawIngestionTable: React.FC<RawIngestionTableProps> = ({ packets, onClearLogs }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleCopyPacket = (packet: Esp32Packet) => {
    navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopiedId(packet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCsv = () => {
    if (packets.length === 0) return;
    const headers = ['PacketID', 'Timestamp', 'Voltage_V', 'Current_A', 'Power_kW', 'PowerFactor', 'Freq_Hz', 'CRC16', 'Anomaly'];
    const rows = packets.map((p) => [
      p.id,
      p.timestamp,
      p.voltageV,
      p.currentA,
      p.powerKw,
      p.powerFactor,
      p.frequencyHz,
      p.crc,
      p.isAnomaly ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `esp32_nilm_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0f141f] border border-[#1e2638] rounded-md overflow-hidden text-xs flex flex-col justify-between h-full min-h-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2638] bg-[#131926]">
        <span className="font-mono font-bold tracking-wider text-slate-200 uppercase text-[11px]">
          ESP32 UART RAW INGESTION
        </span>

        <div className="flex items-center gap-1 font-mono text-[10px]">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-0.5 rounded bg-[#182030] text-slate-300 hover:bg-[#222d42] border border-[#1e2638]"
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
          <button
            onClick={handleDownloadCsv}
            className="p-1 rounded bg-[#182030] text-slate-300 hover:bg-[#222d42] border border-[#1e2638]"
            title="Download CSV"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded bg-[#182030] text-slate-400 hover:text-rose-300 border border-[#1e2638]"
            title="Clear Buffer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal log feed */}
      <div className="p-2.5 overflow-y-auto space-y-1 font-mono text-[10px] bg-[#090d15] flex-1 max-h-60 custom-scrollbar">
        {packets.length === 0 ? (
          <div className="text-slate-600 italic py-6 text-center">
            Waiting for UART ADC frames...
          </div>
        ) : (
          packets.slice(0, 25).map((packet) => (
            <div
              key={packet.id}
              className={`p-1.5 rounded flex items-center justify-between gap-2 border transition ${
                packet.isAnomaly
                  ? 'bg-rose-950/30 border-rose-800 text-rose-200'
                  : 'bg-[#0f1422] border-[#182030] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500">[{packet.timestamp}]</span>
                <span className="text-cyan-400 font-bold">#{packet.id}</span>
                <span className="font-bold text-slate-100">{packet.powerKw.toFixed(2)}kW</span>
                <span className="text-slate-400">{packet.voltageV}V</span>
                <span className="text-slate-400">{packet.currentA}A</span>
                <span className="text-slate-400">PF:{packet.powerFactor}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-slate-500">{packet.crc}</span>
                <button
                  onClick={() => handleCopyPacket(packet)}
                  className="text-slate-400 hover:text-white"
                  title="Copy JSON"
                >
                  {copiedId === packet.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="px-3 py-1.5 border-t border-[#1e2638] bg-[#0c1018] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>SCT-013 + ZMPT101B @ 1.2 kHz</span>
        <span className="text-cyan-400 font-bold">{packets.length} FRAMES</span>
      </div>
    </div>
  );
};
