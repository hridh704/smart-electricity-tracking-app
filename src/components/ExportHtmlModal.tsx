import React, { useState } from 'react';
import { X, Download, Copy, Check, Code, CheckCircle2 } from 'lucide-react';
import { generateStandaloneHtmlCode } from '../utils/exportHtml';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtmlCode();

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartenergy_edge_ai_dashboard.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f141f] border border-[#1e2638] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative font-mono text-xs">
        {/* Top bar */}
        <div className="p-4 border-b border-[#1e2638] bg-[#131926] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-cyan-500/40 bg-[#101726] flex items-center justify-center text-cyan-400">
              <Code className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Export Standalone Single-File HTML
              </h2>
              <p className="text-[10px] text-slate-400">
                100% self-contained bundle for offline STEAM Expo presentation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#182030] hover:bg-[#222d42] text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content & instructions */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-slate-300 custom-scrollbar">
          <div className="bg-[#0c1018] border border-[#182030] rounded p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-100 text-[11px]">
                Ready for STEAM Expo Offline Execution
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Bundles Tailwind CSS, Chart.js, Lucide Icons, ESP32 telemetry simulation, and Gemini API integration into one single <code className="bg-[#182030] px-1 py-0.2 rounded text-cyan-300 font-mono">.html</code> file. Double-click to open in any browser.
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 text-[10px] font-semibold mb-1">
              <span>Preview HTML Code:</span>
              <span className="text-cyan-400">{(htmlCode.length / 1024).toFixed(1)} KB Total</span>
            </div>
            <pre className="bg-[#090d15] border border-[#182030] rounded p-2.5 font-mono text-[9px] text-slate-400 max-h-44 overflow-y-auto select-all custom-scrollbar">
              {htmlCode.slice(0, 750)}
              {'\n... [Full bundle included in download / copy] ...'}
            </pre>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-3 border-t border-[#1e2638] bg-[#0c1018] flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-3 py-1.5 rounded bg-[#182030] hover:bg-[#222d42] text-slate-200 font-semibold text-[10px] flex items-center justify-center gap-1.5 border border-[#1e2638] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied HTML Code!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-4 py-1.5 rounded bg-[#151c2c] hover:bg-[#1f283d] text-slate-100 font-bold text-[10px] flex items-center justify-center gap-1.5 border border-[#27344c] transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download .HTML File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
