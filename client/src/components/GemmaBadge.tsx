import React from 'react';

interface GemmaBadgeProps {
  latencyMs?: number;
}

export const GemmaBadge: React.FC<GemmaBadgeProps> = ({ latencyMs }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1E293B] border border-[#4F46E5]/30 shadow-inner">
      <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
      <span className="font-sans text-xs font-semibold text-[#F1F5F9] tracking-wider uppercase">
        Local Inference Active
      </span>
      <span className="font-mono text-xs text-[#94A3B8] bg-[#0F172A] px-1.5 py-0.5 rounded border border-[#4F46E5]/20">
        gemma4:e2b
      </span>
      {latencyMs !== undefined && (
        <span className="font-mono text-xs text-[#F59E0B]">
          {latencyMs}ms
        </span>
      )}
    </div>
  );
};
