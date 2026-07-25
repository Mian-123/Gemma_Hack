import React from 'react';

interface SkillPillProps {
  skill: string;
  category: 'matched' | 'weak' | 'missing' | 'extra';
}

export const SkillPill: React.FC<SkillPillProps> = ({ skill, category }) => {
  const getStyles = (cat: typeof category) => {
    switch (cat) {
      case 'matched':
        return 'bg-[#15803D]/10 text-[#4ADE80] border-[#22C55E]/30';
      case 'weak':
        return 'bg-[#854D0E]/15 text-[#FACC15] border-[#EAB308]/30';
      case 'missing':
        return 'bg-[#991B1B]/10 text-[#F87171] border-[#EF4444]/30';
      case 'extra':
        return 'bg-[#581C87]/20 text-[#C084FC] border-[#A855F7]/30';
    }
  };

  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${getStyles(category)}`}>
      {skill}
    </span>
  );
};
