import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiResponse, Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { GemmaBadge } from '../components/GemmaBadge';
import { Search, SlidersHorizontal, Loader, Compass } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // 1. Fetch Opportunities
  const { data: opportunitiesRes, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<Opportunity[]>>('/opportunities');
      return res;
    }
  });

  const opportunities = opportunitiesRes?.data || [];

  // Filter opportunities client-side for dynamic UX
  const filtered = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.skillsRequired.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = selectedType === 'all' || opp.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Opportunities Workspace
            </h1>
            <GemmaBadge />
          </div>
          <p className="text-sm text-[#94A3B8]">
            Browse jobs, internships, hackathons, and projects curated for local parsing.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-[#64748B]" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, company, location, or skills (e.g. FastAPI)..."
            className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-[#475569] outline-none outline-0"
          />
        </div>

        {/* Type selector */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-[#64748B] shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] text-sm text-white px-3 py-2 rounded-lg outline-none outline-0 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="hackathon">Hackathons</option>
            <option value="project">Projects</option>
          </select>
        </div>
      </div>

      {/* Grid of Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
          <span className="text-xs text-[#94A3B8] italic">Compiling opportunities from local db...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(opp => (
            <OpportunityCard 
              key={opp.id} 
              opportunity={opp} 
              onViewDetails={() => navigate(`/opportunities/${opp.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#1E293B]/30 border border-[#334155]/40 border-dashed rounded-xl space-y-4">
          <Compass className="w-12 h-12 text-[#64748B]" />
          <div className="text-center space-y-1">
            <h3 className="font-bold text-white text-base">No Matching Opportunities</h3>
            <p className="text-xs text-[#94A3B8]">Try adjusting your search filters or pasting a custom Job Description.</p>
          </div>
        </div>
      )}

    </div>
  );
};
export default OpportunitiesPage;
