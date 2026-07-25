import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, Opportunity, SkillGapAnalysis } from '../types';
import { consumeSSE } from '../services/sse';
import { SkillGapReportCard } from '../components/SkillGapReportCard';
import { StreamingReasoningPanel } from '../components/StreamingReasoningPanel';
import { GemmaBadge } from '../components/GemmaBadge';
import { Loader, Cpu, Play, ChevronLeft } from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [reasoningTokens, setReasoningTokens] = useState('');
  const [report, setReport] = useState<SkillGapAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // FIX: Fetch the specific opportunity by ID correctly
  const { data: oppRes, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      // Fetch all opportunities and find the one matching our ID
      const listRes = await api.get<any, ApiResponse<Opportunity[]>>('/opportunities');
      const items = listRes.data || [];
      // IDs from backend are numbers, URL param is string — compare with ==
      const item = items.find((o: Opportunity) => String(o.id) === String(id));
      if (!item) throw new Error('Opportunity not found');
      return { success: true, data: item, error: null };
    },
    enabled: !!id,
  });

  const opp = oppRes?.data;

  // Pre-fill JD textarea when opportunity loads
  React.useEffect(() => {
    if (opp && !jobDescription) {
      setJobDescription(
        `Role: ${opp.title}\nCompany: ${opp.company}\nLocation: ${opp.location}\n\nRequired Skills: ${opp.skillsRequired.join(', ')}\n\nDescription:\n${opp.description}`
      );
    }
  }, [opp]);

  // Run SSE Skill Gap Stream → then fetch structured Pydantic result
  const handleAnalyzeGap = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setReasoningTokens('');
    setReport(null);
    setAiError(null);

    const ssePath = `/ai/skill-gap/stream?jobDescription=${encodeURIComponent(jobDescription)}`;

    await consumeSSE(
      ssePath,
      (token) => setReasoningTokens(prev => prev + token),
      async () => {
        // Stream done → fetch the structured JSON report
        try {
          const res = await api.post<any, ApiResponse<any>>('/ai/skill-gap', {
            jobDescription: jobDescription
          });
          if (res.success && res.data) {
            setReport(res.data);
          }
        } catch (err: any) {
          setAiError(err.message || 'Failed to get skill gap analysis. Make sure Ollama is running.');
        } finally {
          setIsAnalyzing(false);
        }
      },
      (error) => {
        setIsAnalyzing(false);
        setAiError(error.message || 'Streaming connection failed.');
        setReasoningTokens(prev => prev + `\n[Error: ${error.message}]`);
      }
    );
  };

  // Run SSE Roadmap Stream → navigate to RoadmapPage with data
  const handleGenerateRoadmap = async () => {
    if (!report || !opp) return;
    setIsGeneratingRoadmap(true);
    setReasoningTokens('');
    setAiError(null);

    const seedSkills = report.roadmapSeedSkills || [];
    const ssePath = `/ai/roadmap/stream?roleTitle=${encodeURIComponent(opp.title)}&missingSkills=${encodeURIComponent(seedSkills.join(','))}`;

    await consumeSSE(
      ssePath,
      (token) => setReasoningTokens(prev => prev + token),
      async () => {
        try {
          const res = await api.post<any, ApiResponse<any>>('/ai/roadmap', {
            roleTitle: opp.title,
            missingSkills: seedSkills
          });
          if (res.success && res.data) {
            navigate(`/roadmap/${res.data.id || 'new'}`, { state: { roadmap: res.data } });
          }
        } catch (err: any) {
          setAiError(err.message || 'Failed to generate roadmap.');
        } finally {
          setIsGeneratingRoadmap(false);
        }
      },
      (error) => {
        setIsGeneratingRoadmap(false);
        setAiError(error.message || 'Roadmap streaming failed.');
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
        <span className="text-xs text-[#94A3B8] italic">Loading opportunity...</span>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-[#94A3B8]">Opportunity not found.</p>
        <button
          onClick={() => navigate('/opportunities')}
          className="text-[#818CF8] text-sm underline"
        >
          Back to Opportunities
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#334155] pb-4 gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/opportunities')}
            className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Opportunities
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">{opp.title}</h1>
          <p className="text-sm text-[#94A3B8] font-semibold">{opp.company} &bull; {opp.location}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {opp.skillsRequired.map((s: string) => (
              <span key={s} className="text-[10px] bg-[#334155] text-[#CBD5E1] px-2 py-0.5 rounded font-medium">{s}</span>
            ))}
          </div>
        </div>
        <GemmaBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: JD Input + Trigger */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#818CF8]" />
              Job Description Input
            </h3>

            {aiError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
                {aiError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Paste or edit job description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] text-xs text-white p-3 rounded-lg outline-none leading-relaxed resize-y font-mono"
                placeholder="Paste the job description here..."
              />
            </div>

            <button
              onClick={handleAnalyzeGap}
              disabled={isAnalyzing || isGeneratingRoadmap || !jobDescription.trim()}
              className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gemma is analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Gemma Skill Gap Analysis</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-[#475569] text-center">
              Powered by <span className="text-[#818CF8] font-semibold">Gemma 4 E2B</span> running locally via Ollama
            </p>
          </div>
        </div>

        {/* Right: Streaming Panel + Report */}
        <div className="lg:col-span-2 space-y-6">
          <StreamingReasoningPanel
            tokens={reasoningTokens}
            isStreaming={isAnalyzing || isGeneratingRoadmap}
          />

          {report ? (
            <SkillGapReportCard
              report={report}
              onGenerateRoadmap={handleGenerateRoadmap}
              isGeneratingRoadmap={isGeneratingRoadmap}
            />
          ) : (
            !isAnalyzing && !isGeneratingRoadmap && (
              <div className="bg-[#1E293B]/20 border border-[#334155]/40 border-dashed rounded-xl p-12 text-center text-[#64748B] text-xs italic">
                Press <span className="text-[#818CF8] font-semibold not-italic">"Run Gemma Skill Gap Analysis"</span> to compare this job description with your resume profile.
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
export default OpportunityDetailPage;
