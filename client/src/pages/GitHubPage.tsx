import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse } from '../types';
import { Loader, Cpu, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { GemmaBadge } from '../components/GemmaBadge';

export const GitHubPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  // FIX: Use the correct GET /github/analysis endpoint — NOT POST /connect with empty username
  const { data: profileRes } = useQuery({
    queryKey: ['github-profile'],
    queryFn: async () => {
      try {
        const res = await api.get<any, ApiResponse<any>>('/github/analysis');
        return res;
      } catch {
        return null; // 404 means not connected yet — that's fine
      }
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (githubUsername: string) => {
      setError(null);
      const res = await api.post<any, ApiResponse<any>>('/github/connect', { username: githubUsername });
      if (!res.success) {
        throw new Error(res.error || 'Failed to connect to GitHub');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      setError(err.message || 'GitHub connection failed. Make sure the username is correct.');
    }
  });

  const githubData = profileRes?.data;
  const isConnected = !!githubData?.username;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    connectMutation.mutate(username.trim());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              GitHub Connector
            </h1>
            <GemmaBadge />
          </div>
          <p className="text-sm text-[#94A3B8]">
            Analyze public repository footprints locally to extract technical expertise metrics.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Connect Form */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base">
            <svg className="w-6 h-6 text-[#818CF8]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <h3>{isConnected ? 'Connected GitHub Identity' : 'Link GitHub Username'}</h3>
          </div>

          <p className="text-xs text-[#CBD5E1]">
            OpportunityAI crawls your public repositories and uses Gemma to infer skill signals from project names, descriptions, and structures.
          </p>

          {error && (
            <div className="bg-[#991B1B]/15 border border-[#EF4444]/20 rounded-lg p-3 text-xs text-[#F87171] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isConnected ? (
            <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub Username (e.g. Mian-123)"
                className="flex-1 bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg px-4 py-2 text-sm text-white placeholder-[#475569] outline-none outline-0"
              />
              <button
                type="submit"
                disabled={connectMutation.isPending}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {connectMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <span>Analyze Repository Signals</span>}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#0F172A]/70 border border-[#22C55E]/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                <span className="text-sm font-semibold text-white">Linked Username: @{githubData.username}</span>
              </div>
              <button
                onClick={() => connectMutation.mutate(githubData.username)}
                disabled={connectMutation.isPending}
                className="text-xs text-[#818CF8] hover:text-white flex items-center gap-1 font-semibold"
              >
                {connectMutation.isPending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                <span>Sync Repos</span>
              </button>
            </div>
          )}
        </div>

        {/* Repository list & Inferred skills */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inferred Skills Column */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 md:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] border-b border-[#334155]/40 pb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#818CF8]" />
                Inferred Skill Signals
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {/* FIX: Handle both string[] and {name, confidence, evidence}[] formats */}
                {githubData.inferredSkills && githubData.inferredSkills.length > 0 ? (
                  githubData.inferredSkills.map((sk: any, idx: number) => {
                    const skillName = typeof sk === 'string' ? sk : sk.name || 'Unknown';
                    const confidence = typeof sk === 'object' ? sk.confidence : null;
                    return (
                      <div key={idx} className="bg-[#0F172A] border border-[#4F46E5]/30 px-2.5 py-1.5 rounded text-xs">
                        <span className="text-[#818CF8] font-semibold">{skillName}</span>
                        {confidence && (
                          <span className="ml-1.5 text-[#64748B]">· {confidence}</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-[#64748B] italic">No skills inferred yet. Sync repos.</span>
                )}
              </div>
            </div>

            {/* Repositories Column */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] border-b border-[#334155]/40 pb-2">
                Analyzed Repositories ({githubData.repos?.length || 0})
              </h4>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {githubData.repos && githubData.repos.length > 0 ? (
                  githubData.repos.map((repo: any, idx: number) => (
                    <div key={idx} className="bg-[#0F172A]/50 border border-[#334155]/30 rounded-lg p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <a href={repo.url} target="_blank" rel="noreferrer" className="font-bold text-xs sm:text-sm text-white hover:text-[#818CF8] transition-colors">
                          {repo.name}
                        </a>
                        {/* FIX: languages is {lang: weight} object, not string */}
                        {repo.languages && Object.keys(repo.languages).length > 0 && (
                          <span className="text-[10px] font-semibold bg-[#334155] text-[#CBD5E1] px-2 py-0.5 rounded">
                            {Object.keys(repo.languages)[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
                        <span>⭐ {repo.stars || 0}</span>
                        {repo.lastUpdated && <span>Updated: {repo.lastUpdated}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-[#64748B] italic">
                    No repository profiles parsed yet. Click Sync.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default GitHubPage;
