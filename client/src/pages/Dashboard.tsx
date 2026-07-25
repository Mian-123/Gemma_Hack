import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { ApiResponse, UserProfile, Opportunity } from '../types';
import { GemmaBadge } from '../components/GemmaBadge';
import { 
  FileText, 
  Terminal, 
  ChevronRight, 
  Compass, 
  Award,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  useAppStore();

  // 1. Fetch Profile Data
  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<UserProfile>>('/profile');
      return res;
    }
  });

  // 2. Fetch Opportunities
  const { data: opportunitiesRes } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<Opportunity[]>>('/opportunities');
      return res;
    }
  });

  const profile = profileRes?.data;
  const opportunities = (opportunitiesRes?.data || []).slice(0, 3); // top 3 for preview

  // Calculate completeness progress
  const getCompleteness = () => {
    if (!profile) return 15;
    let score = 20; // registered account
    if (profile.location) score += 20;
    if (profile.targetRoles && profile.targetRoles.length > 0) score += 30;
    if (profile.preferredLanguage) score += 15;
    if (profile.careerMemory && profile.careerMemory.length > 0) score += 15;
    return score;
  };

  const completeness = getCompleteness();

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155]/60 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Developer Career Workspace
            </h1>
            <GemmaBadge />
          </div>
          <p className="text-sm text-[#94A3B8] max-w-xl">
            Analyze codebases, verify resume data privacy-first, and close skill gaps using local Gemma model.
          </p>
        </div>
        <div className="z-10 shrink-0">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-md"
          >
            <span>Explore Opportunities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Completeness & Quick Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Completeness Card */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#818CF8]" />
              Profile Completeness
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#CBD5E1]">
                <span>Status: {completeness === 100 ? 'Ready for matching' : 'Incomplete'}</span>
                <span>{completeness}%</span>
              </div>
              <div className="w-full bg-[#0F172A] h-2.5 rounded-full overflow-hidden border border-[#334155]">
                <div 
                  className={`h-2.5 transition-all duration-500 ${
                    completeness >= 80 ? 'bg-[#22C55E]' : completeness >= 50 ? 'bg-[#EAB308]' : 'bg-[#EF4444]'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Connect resume and GitHub signals to unlock highly tailored match compatibility ratings.
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#A5B4FC]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/resume"
                className="flex items-center justify-between p-3.5 bg-[#0F172A]/70 hover:bg-[#0F172A] border border-[#334155]/60 hover:border-[#4F46E5]/40 rounded-lg group transition-all text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#818CF8]" />
                  <span className="text-[#E2E8F0] group-hover:text-white">Parse Resume PDF</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#818CF8] transition-colors" />
              </Link>

              <Link 
                to="/github"
                className="flex items-center justify-between p-3.5 bg-[#0F172A]/70 hover:bg-[#0F172A] border border-[#334155]/60 hover:border-[#4F46E5]/40 rounded-lg group transition-all text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#818CF8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-[#E2E8F0] group-hover:text-white">Connect GitHub Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#818CF8] transition-colors" />
              </Link>

              <Link 
                to="/opportunities"
                className="flex items-center justify-between p-3.5 bg-[#0F172A]/70 hover:bg-[#0F172A] border border-[#334155]/60 hover:border-[#4F46E5]/40 rounded-lg group transition-all text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-[#818CF8]" />
                  <span className="text-[#E2E8F0] group-hover:text-white">Paste a Job Description</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#818CF8] transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Career Memory & Recent Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Career Memory */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#818CF8]" />
                Local Career Memory Context
              </h3>
              <span className="text-[10px] bg-[#334155] text-[#CBD5E1] px-2 py-0.5 rounded font-mono">Atomic Facts</span>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Insights extracted by Gemma from uploaded profiles to personalize cover letters, interview responses, and pathways.
            </p>

            <div className="space-y-2">
              {profile?.careerMemory && profile.careerMemory.length > 0 ? (
                profile.careerMemory.map((fact, index) => (
                  <div key={index} className="flex gap-3 items-start bg-[#0F172A]/50 p-3 rounded-lg border border-[#334155]/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8] mt-1.5 shrink-0" />
                    <span className="text-xs font-semibold text-[#CBD5E1] leading-relaxed">{fact}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#64748B] bg-[#0F172A]/30 border border-[#334155]/30 border-dashed rounded-lg">
                  No facts logged. Upload a resume or select preferred tools to populate memory.
                </div>
              )}
            </div>
          </div>

          {/* Top Opportunities Preview */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155]/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#818CF8]" />
                Top Opportunities Preview
              </h3>
              <Link to="/opportunities" className="text-xs text-[#818CF8] hover:text-white font-semibold transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <div 
                    key={opp.id}
                    className="flex items-center justify-between p-3.5 bg-[#0F172A]/50 hover:bg-[#0F172A] border border-[#334155]/30 hover:border-[#334155] rounded-lg transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">{opp.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                        <span className="font-semibold">{opp.company}</span>
                        <span>&bull;</span>
                        <span>{opp.location}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#334155] text-[#CBD5E1]">
                        {opp.type}
                      </span>
                      <button 
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                        className="p-1 text-[#64748B] hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#64748B]">
                  No opportunities indexed in local database. Run backend seed logic first.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Dashboard;
