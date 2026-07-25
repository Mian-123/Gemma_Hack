import React from 'react';

interface MatchScoreBadgeProps {
  score: number;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score }) => {
  const getBandStyles = (s: number) => {
    if (s >= 80) return 'bg-[#15803D]/20 text-[#22C55E] border-[#22C55E]/40';
    if (s >= 50) return 'bg-[#854D0E]/20 text-[#EAB308] border-[#EAB308]/40';
    return 'bg-[#991B1B]/20 text-[#EF4444] border-[#EF4444]/40';
  };

  return (
    <div className={`inline-flex items-center justify-center font-mono font-bold text-sm px-2.5 py-1 rounded border ${getBandStyles(score)}`}>
      {score}% Match
    </div>
  );
};
