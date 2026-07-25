import React, { useState } from 'react';
import type { LearningRoadmap } from '../types';
import { CheckSquare, Square, ChevronDown, ChevronUp, BookOpen, Layers, Clock, Code } from 'lucide-react';
import { GemmaBadge } from './GemmaBadge';

interface RoadmapTimelineProps {
  roadmap: LearningRoadmap;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmap }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 1: true });

  const toggleStepCompleted = (stepNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const toggleStepExpanded = (stepNum: number) => {
    setExpandedSteps(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Custom Learning Path</h3>
            <GemmaBadge />
          </div>
          <p className="text-xs text-[#94A3B8]">Ordered study plan customized for target role: {roadmap.roleTitle}</p>
        </div>
        
        {/* Simple Progress Bar */}
        <div className="text-right space-y-1">
          <span className="text-xs font-semibold text-[#CBD5E1]">
            {Object.values(completedSteps).filter(Boolean).length} / {roadmap.steps.length} Steps Complete
          </span>
          <div className="w-32 bg-[#0F172A] h-2 rounded-full overflow-hidden border border-[#334155]">
            <div 
              className="bg-[#22C55E] h-2 transition-all duration-300"
              style={{ width: `${(Object.values(completedSteps).filter(Boolean).length / roadmap.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-4">
        {roadmap.steps.map((step) => {
          const isCompleted = !!completedSteps[step.stepNumber];
          const isExpanded = !!expandedSteps[step.stepNumber];

          return (
            <div 
              key={step.stepNumber}
              className={`border rounded-xl transition-all ${
                isCompleted 
                  ? 'border-[#22C55E]/40 bg-[#15803D]/5' 
                  : 'border-[#334155] bg-[#1E293B]'
              }`}
            >
              {/* Step Header */}
              <div 
                onClick={() => toggleStepExpanded(step.stepNumber)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button 
                    onClick={(e) => toggleStepCompleted(step.stepNumber, e)}
                    className="text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-[#22C55E]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#818CF8] uppercase tracking-widest">
                      Step {step.stepNumber}
                    </span>
                    <h4 className={`font-bold text-sm md:text-base ${isCompleted ? 'text-[#CBD5E1] line-through' : 'text-white'}`}>
                      {step.topic}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#94A3B8] bg-[#0F172A] px-2 py-1 rounded border border-[#334155]/60">
                    <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>~{step.estimatedHours} hrs</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </div>
              </div>

              {/* Step Content */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 border-t border-[#334155]/50 space-y-4 text-sm">
                  {/* Concepts */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#A5B4FC] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Key Concepts to Master
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 list-disc text-[#CBD5E1] text-xs">
                      {step.concepts.map((concept, idx) => (
                        <li key={idx}>{concept}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#A5B4FC] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Recommended Study Material
                    </span>
                    <ul className="space-y-1 text-xs text-[#CBD5E1] pl-5 list-disc">
                      {step.resources.map((resource, idx) => (
                        <li key={idx}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Suggested Practice Projects */}
      {roadmap.projects && roadmap.projects.length > 0 && (
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#334155] pb-2">
            <Code className="w-5 h-5 text-[#818CF8]" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Suggested Portfolio Projects</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.projects.map((proj, idx) => (
              <div key={idx} className="bg-[#0F172A]/70 border border-[#334155]/40 rounded-lg p-4 space-y-3">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-sm text-[#F1F5F9]">{proj.title}</h5>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{proj.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.skillsExercised.map((sk, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-semibold bg-[#334155] text-[#CBD5E1] px-1.5 py-0.5 rounded">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
