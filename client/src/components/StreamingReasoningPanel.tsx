import React from 'react';
import { Cpu } from 'lucide-react';

interface StreamingReasoningPanelProps {
  tokens: string;
  isStreaming: boolean;
}

export const StreamingReasoningPanel: React.FC<StreamingReasoningPanelProps> = ({ tokens, isStreaming }) => {
  if (!isStreaming && !tokens) return null;

  return (
    <div className="w-full bg-[#1E293B] border border-[#4F46E5]/40 rounded-lg p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#334155] pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A5B4FC]">
          <Cpu className="w-4 h-4 text-[#818CF8]" />
          <span>Gemma Local Reasoning Output</span>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
            <span className="text-[10px] text-[#22C55E] font-mono uppercase tracking-widest font-bold">Streaming</span>
          </div>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto bg-[#0F172A] rounded p-3 text-sm font-mono text-[#E2E8F0] whitespace-pre-wrap leading-relaxed border border-[#334155]/30">
        {tokens || "Awaiting local Gemma model response token streams..."}
      </div>
    </div>
  );
};
