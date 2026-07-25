import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { ApiResponse, UserProfile } from '../types';
import { GemmaBadge } from '../components/GemmaBadge';
import { Globe, MapPin, Tag, LogOut, CheckCircle2, Loader } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAppStore();

  const [location, setLocation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Fetch Profile Data
  const { isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<UserProfile>>('/profile');
      if (res.success && res.data) {
        setLocation(res.data.location || '');
        setPreferredLanguage(res.data.preferredLanguage || '');
        setTargetRoles(res.data.targetRoles?.join(', ') || '');
      }
      return res;
    }
  });

  // 2. Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      setSuccess(false);
      const rolesArray = targetRoles
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
        
      const res = await api.put<any, ApiResponse<UserProfile>>('/profile', {
        location,
        preferred_language: preferredLanguage,
        target_roles: rolesArray,
      });
      if (!res.success) {
        throw new Error(res.error || 'Failed to update profile');
      }
      return res;
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['profile'], res);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Developer Settings
          </h1>
          <p className="text-sm text-[#94A3B8]">Customize preferred programming languages and targets.</p>
        </div>
        <GemmaBadge />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
        </div>
      ) : (
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            {success && (
              <div className="bg-[#16A34A]/10 border border-[#22C55E]/30 rounded-lg p-3 text-xs text-[#4ADE80] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Profile configurations successfully sync'd!</span>
              </div>
            )}

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#818CF8]" />
                Job Search Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, San Francisco, CA"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none outline-0"
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#818CF8]" />
                Preferred Programming Language
              </label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="e.g. Python, TypeScript, Rust"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none outline-0"
              />
            </div>

            {/* Target Roles */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#818CF8]" />
                Target Roles (Comma-separated)
              </label>

              <input
                type="text"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="e.g. Fullstack Engineer, Backend Developer, SRE"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none outline-0"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {updateMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <span>Save Configurations</span>}
            </button>
          </form>

          {/* Logout Action block */}
          <div className="border-t border-[#334155] pt-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Authentication Control</h4>
              <p className="text-[11px] text-[#64748B]">Clear active session tokens from localStorage</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-[#991B1B]/15 hover:bg-[#991B1B]/25 text-[#F87171] border border-[#EF4444]/25 hover:border-[#F87171] font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;
