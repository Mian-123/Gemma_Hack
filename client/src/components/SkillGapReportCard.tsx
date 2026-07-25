import React from 'react';
import type { SkillGapAnalysis } from '../types';
import { SkillPill } from './SkillPill';
import { MatchScoreBadge } from './MatchScoreBadge';
import { GemmaBadge } from './GemmaBadge';
import { ArrowRight, Info, AlertTriangle, ShieldCheck, PlusCircle } from 'lucide-react';

interface SkillGapReportCardProps {
  report: SkillGapAnalysis;
  onGenerateRoadmap?: () => void;
  isGeneratingRoadmap?: boolean;
}

export const SkillGapReportCard: React.FC<SkillGapReportCardProps> = ({ 
  report, 
  onGenerateRoadmap,
  isGeneratingRoadmap = false 
}) => {
  // Group skills by category
  const matchedSkills = report.skills.filter(s => s.category === 'matched');
  const weakSkills = report.skills.filter(s => s.category === 'weak');
  const missingSkills = report.skills.filter(s => s.category === 'missing');
  const extraSkills = report.skills.filter(s => s.category === 'extra');

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Gemma Skill Gap Analysis</h3>
            <GemmaBadge />
          </div>
          <p className="text-xs text-[#94A3B8]">Semantic parsing and mapping of profile skills vs. requirements</p>
        </div>
        <MatchScoreBadge score={report.overallMatchPercentage} />
      </div>

      {/* Narrative Gap Summary */}
      <div className="bg-[#0F172A] rounded-lg p-4 flex gap-3 border border-[#4F46E5]/20">
        <Info className="w-5 h-5 text-[#818CF8] flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <span className="font-bold text-[#A5B4FC]">AI Fit Summary</span>
          <p className="text-[#CBD5E1] leading-relaxed">{report.gapSummary}</p>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Matched Column */}
        <div className="space-y-3 bg-[#0F172A]/40 rounded-lg p-3 border border-[#15803D]/10">
          <div className="flex items-center gap-1.5 text-[#4ADE80] font-semibold text-xs border-b border-[#334155]/40 pb-2 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Matched ({matchedSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.length > 0 ? (
              matchedSkills.map(s => <SkillPill key={s.skill} skill={s.skill} category="matched" />)
            ) : (
              <span className="text-[10px] text-[#64748B] italic">None identified</span>
            )}
          </div>
        </div>

        {/* Weak/Partial Column */}
        <div className="space-y-3 bg-[#0F172A]/40 rounded-lg p-3 border border-[#854D0E]/10">
          <div className="flex items-center gap-1.5 text-[#FACC15] font-semibold text-xs border-b border-[#334155]/40 pb-2 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Brush Up ({weakSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakSkills.length > 0 ? (
              weakSkills.map(s => <SkillPill key={s.skill} skill={s.skill} category="weak" />)
            ) : (
              <span className="text-[10px] text-[#64748B] italic">None identified</span>
            )}
          </div>
        </div>

        {/* Missing Column */}
        <div className="space-y-3 bg-[#0F172A]/40 rounded-lg p-3 border border-[#991B1B]/10">
          <div className="flex items-center gap-1.5 text-[#F87171] font-semibold text-xs border-b border-[#334155]/40 pb-2 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Missing ({missingSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map(s => <SkillPill key={s.skill} skill={s.skill} category="missing" />)
            ) : (
              <span className="text-[10px] text-[#64748B] italic">None identified</span>
            )}
          </div>
        </div>

        {/* Extra Column */}
        <div className="space-y-3 bg-[#0F172A]/40 rounded-lg p-3 border border-[#581C87]/10">
          <div className="flex items-center gap-1.5 text-[#C084FC] font-semibold text-xs border-b border-[#334155]/40 pb-2 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" />
            <span>Extra Assets ({extraSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {extraSkills.length > 0 ? (
              extraSkills.map(s => <SkillPill key={s.skill} skill={s.skill} category="extra" />)
            ) : (
              <span className="text-[10px] text-[#64748B] italic">None identified</span>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {onGenerateRoadmap && (report.roadmapSeedSkills?.length > 0 || missingSkills.length > 0 || weakSkills.length > 0) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onGenerateRoadmap}
            disabled={isGeneratingRoadmap}
            className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm shadow-md"
          >
            {isGeneratingRoadmap ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Compiling AI Learning Steps...</span>
              </>
            ) : (
              <>
                <span>Generate Learning Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
