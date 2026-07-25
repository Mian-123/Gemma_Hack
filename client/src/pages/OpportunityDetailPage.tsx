import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, Opportunity, SkillGapAnalysis } from '../types';
import { consumeSSE } from '../services/sse';
import { SkillGapReportCard } from '../components/SkillGapReportCard';
import { StreamingReasoningPanel } from '../components/StreamingReasoningPanel';
import { GemmaBadge } from '../components/GemmaBadge';
import { Loader, Cpu, Play } from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [reasoningTokens, setReasoningTokens] = useState('');
  const [report, setReport] = useState<SkillGapAnalysis | null>(null);

  // 1. Fetch Opportunity Details
  const { data: oppRes, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<Opportunity>>(`/opportunities`);
      // Fallback: search for opportunity in list matching ID
      const listRes = await api.get<any, ApiResponse<Opportunity[]>>('/opportunities');
      const item = (listRes.data || []).find(o => o.id === id);
      if (item) return { success: true, data: item, error: null };
      return res;
    }
  });

  const opp = oppRes?.data;

  // Initialize JD text box when opportunity data loads
  React.useEffect(() => {
    if (opp && !jobDescription) {
      setJobDescription(
        `Role: ${opp.title}\nCompany: ${opp.company}\nLocation: ${opp.location}\n\nRequired Skills: ${opp.skillsRequired.join(', ')}\n\nDescription:\n${opp.description}`
      );
    }
  }, [opp]);

  // Run SSE Skill Gap Stream, then fetch Pydantic structured response
  const handleAnalyzeGap = async () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    setReasoningTokens('');
    setReport(null);

    const ssePath = `/ai/skill-gap/stream?jobDescription=${encodeURIComponent(jobDescription)}`;
    
    await consumeSSE(
      ssePath,
      (token) => {
        setReasoningTokens(prev => prev + token);
      },
      async () => {
        setIsAnalyzing(false);
        // Stream finished, now fetch final validated database object
        try {
          const res = await api.post<any, ApiResponse<any>>('/ai/skill-gap', {
            jobDescription: jobDescription
          });
          if (res.success && res.data) {
            setReport(res.data);
          }
        } catch (err) {
          console.error("Failed to parse final gap report JSON:", err);
        }
      },
      (error) => {
        setIsAnalyzing(false);
        setReasoningTokens(prev => prev + `\n[STREAM ERROR: ${error.message}]`);
      }
    );
  };

  // Run SSE Roadmap Stream, then fetch Pydantic structured path
  const handleGenerateRoadmap = async () => {
    if (!report || !opp) return;

    setIsGeneratingRoadmap(true);
    setReasoningTokens('');

    const seedSkills = report.roadmapSeedSkills || [];
    const ssePath = `/ai/roadmap/stream?roleTitle=${encodeURIComponent(opp.title)}&missingSkills=${encodeURIComponent(seedSkills.join(','))}`;

    await consumeSSE(
      ssePath,
      (token) => {
        setReasoningTokens(prev => prev + token);
      },
      async () => {
        setIsGeneratingRoadmap(false);
        try {
          const res = await api.post<any, ApiResponse<any>>('/ai/roadmap', {
            roleTitle: opp.title,
            missingSkills: seedSkills
          });
          if (res.success && res.data) {
            navigate(`/roadmap/${res.data.id || 'new'}`, { state: { roadmap: res.data } });
          }
        } catch (err) {
          console.error("Failed to parse final learning roadmap:", err);
        }
      },
      (error) => {
        setIsGeneratingRoadmap(false);
        setReasoningTokens(prev => prev + `\n[STREAM ERROR: ${error.message}]`);
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
        <span className="text-xs text-[#94A3B8] italic">Reading opportunity specs...</span>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center py-20 text-[#94A3B8]">
        Opportunity not found. Check local database seeding.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-extrabold text-white">{opp.title}</h1>
          <p className="text-sm text-[#94A3B8] font-semibold">{opp.company} &bull; {opp.location}</p>
        </div>
        <GemmaBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: JD text area and AI triggering */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#818CF8]" />
              Analysis Input Console
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Job Description / Requirements</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] text-xs text-white p-3 rounded-lg outline-none leading-relaxed resize-y font-mono"
              />
            </div>

            <button
              onClick={handleAnalyzeGap}
              disabled={isAnalyzing || isGeneratingRoadmap}
              className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Skill Gaps...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run local Gemma Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Streaming panel and Report Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Streaming Reasoning Panel */}
          <StreamingReasoningPanel 
            tokens={reasoningTokens} 
            isStreaming={isAnalyzing || isGeneratingRoadmap} 
          />

          {/* Final Match Report Card */}
          {report ? (
            <SkillGapReportCard 
              report={report} 
              onGenerateRoadmap={handleGenerateRoadmap}
              isGeneratingRoadmap={isGeneratingRoadmap}
            />
          ) : (
            !isAnalyzing && !isGeneratingRoadmap && (
              <div className="bg-[#1E293B]/20 border border-[#334155]/40 border-dashed rounded-xl p-12 text-center text-[#64748B] text-xs italic">
                Pasted job description details are ready. Press 'Run local Gemma Analysis' to verify compatibilities.
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
export default OpportunityDetailPage;
