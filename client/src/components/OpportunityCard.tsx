import React from 'react';
import type { Opportunity } from '../types';
import { MatchScoreBadge } from './MatchScoreBadge';
import { GemmaBadge } from './GemmaBadge';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { SkillPill } from './SkillPill';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchScore?: number;
  explanation?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  urgency?: string;
  onViewDetails?: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  matchScore,
  explanation,
  matchingSkills = [],
  missingSkills = [],
  onViewDetails
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-[#1E3A8A] text-[#93C5FD]';
      case 'internship': return 'bg-[#065F46] text-[#6EE7B7]';
      case 'hackathon': return 'bg-[#701A75] text-[#F472B6]';
      default: return 'bg-[#78350F] text-[#FCD34D]';
    }
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] hover:border-[#4F46E5]/40 rounded-xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between">
      <div className="space-y-3">
        {/* Title, Org & Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getTypeColor(opportunity.type)}`}>
                {opportunity.type}
              </span>
              {matchScore !== undefined && (
                <div className="sm:hidden">
                  <MatchScoreBadge score={matchScore} />
                </div>
              )}
            </div>
            <h4 className="font-bold text-white text-base md:text-lg hover:text-[#818CF8] transition-colors leading-tight">
              {opportunity.title}
            </h4>
            <p className="text-sm text-[#94A3B8] font-medium">{opportunity.company}</p>
          </div>
          {matchScore !== undefined && (
            <div className="hidden sm:block">
              <MatchScoreBadge score={matchScore} />
            </div>
          )}
        </div>

        {/* Location & Posted */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(opportunity.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Requirements Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {opportunity.skillsRequired.slice(0, 4).map((sk, idx) => (
            <span key={idx} className="text-[10px] bg-[#0F172A]/60 text-[#CBD5E1] px-2 py-0.5 rounded border border-[#334155]">
              {sk}
            </span>
          ))}
          {opportunity.skillsRequired.length > 4 && (
            <span className="text-[10px] text-[#64748B] self-center pl-1 font-mono">
              +{opportunity.skillsRequired.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Gemma Match Details Section */}
      {explanation && (
        <div className="bg-[#0F172A]/70 border border-[#4F46E5]/15 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#334155]/40 pb-1">
            <span className="text-[10px] font-bold text-[#818CF8] uppercase tracking-wider">Local Gemma Fit analysis</span>
            <GemmaBadge />
          </div>
          <p className="text-xs text-[#CBD5E1] leading-relaxed italic">
            "{explanation}"
          </p>
          
          {/* Matching / Missing highlights */}
          <div className="flex flex-wrap gap-1 border-t border-[#334155]/20 pt-2">
            {matchingSkills.slice(0, 3).map(s => (
              <SkillPill key={s} skill={s} category="matched" />
            ))}
            {missingSkills.slice(0, 3).map(s => (
              <SkillPill key={s} skill={s} category="missing" />
            ))}
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="pt-2 border-t border-[#334155]/30 flex items-center justify-between gap-4 text-xs font-semibold">
        {onViewDetails ? (
          <button 
            onClick={onViewDetails}
            className="text-[#818CF8] hover:text-[#A5B4FC] transition-colors"
          >
            Compare & Analyze
          </button>
        ) : (
          <div />
        )}
        
        {opportunity.url && (
          <a 
            href={opportunity.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 text-[#94A3B8] hover:text-white transition-colors"
          >
            <span>Apply External</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
