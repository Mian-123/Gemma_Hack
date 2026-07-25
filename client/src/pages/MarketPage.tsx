import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse } from '../types';
import { MarketInsightChart } from '../components/MarketInsightChart';
import { GemmaBadge } from '../components/GemmaBadge';
import { BarChart3, Loader, AlertCircle } from 'lucide-react';

export const MarketPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('job');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Market Insights from backend
  const { data: insightsRes, isLoading } = useQuery({
    queryKey: ['market-insights', selectedRole],
    queryFn: async () => {
      setErrorMsg(null);
      const res = await api.post<any, ApiResponse<any>>('/market/insights', {
        roleCategory: selectedRole
      });
      if (res.success && res.error) {
        // Insufficient data error returned as 200 success per specs
        setErrorMsg(res.error);
      }
      return res;
    }
  });

  const marketData = insightsRes?.data;
  const topSkills = marketData?.topSkills || [];
  const insights = marketData?.insights || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Market Intelligence
            </h1>
            <GemmaBadge />
          </div>
          <p className="text-sm text-[#94A3B8]">
            Aggregate skill frequency count across listings and reason about labor trends.
          </p>
        </div>
      </div>

      {/* Selector Console */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[#818CF8]" />
          <span className="text-sm font-semibold text-[#CBD5E1]">Aggregate Category:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] text-xs text-white px-3 py-2 rounded-lg outline-none cursor-pointer"
          >
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="hackathon">Hackathons</option>
            <option value="project">Projects</option>
          </select>
        </div>
        
        <span className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider">
          Required samples for analysis: &gt;= 10 listings
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
          <span className="text-xs text-[#94A3B8] italic">Compiling skill frequency maps...</span>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#1E293B]/20 border border-[#334155]/60 border-dashed rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-[#EAB308] mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Insufficient Postings footprint</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{errorMsg}</p>
          </div>
          <p className="text-[10px] text-[#64748B]">
            Hint: Select category 'job' or run backend database seed script to populate enough samples.
          </p>
        </div>
      ) : marketData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart block */}
          <div className="lg:col-span-2 space-y-6">
            <MarketInsightChart data={topSkills} />
          </div>

          {/* Gemma insights block */}
          <div className="lg:col-span-1 bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#334155] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC]">
                Gemma Market Assessment
              </h4>
              <GemmaBadge />
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {insights.map((ins: any, idx: number) => {
                const badgeColor = 
                  ins.type === 'critical' ? 'bg-[#991B1B]/15 text-[#F87171] border-[#EF4444]/20' :
                  ins.type === 'emerging' ? 'bg-[#15803D]/15 text-[#4ADE80] border-[#22C55E]/20' :
                  'bg-[#334155] text-[#CBD5E1] border-[#475569]';
                  
                return (
                  <div key={idx} className="bg-[#0F172A]/70 border border-[#334155]/40 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white leading-snug">{ins.title}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                        {ins.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">{ins.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
};
export default MarketPage;
