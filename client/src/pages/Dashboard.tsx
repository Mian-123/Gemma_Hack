import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAppStore();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Trigger upload logic
      console.log("File dropped:", e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9]">Career Intelligence Workspace</h1>
        <p className="text-sm text-[#94A3B8]">Analyze resume profile facts, verify skills, and spot opportunities with local intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Resume upload & general profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Resume Upload</h2>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-[#4F46E5] bg-[#4F46E5]/10' : 'border-[#4F46E5]/30 hover:border-[#4F46E5]/55 bg-[#0F172A]/50'
              }`}
            >
              <p className="text-sm text-[#F1F5F9] font-medium">Drag & drop your PDF resume here</p>
              <p className="text-xs text-[#94A3B8] mt-2">Maximum file size: 5MB</p>
              <button className="mt-4 text-xs font-semibold text-[#4F46E5] bg-[#4F46E5]/15 border border-[#4F46E5]/40 hover:bg-[#4F46E5]/25 px-4 py-2 rounded-md transition-colors">
                Select File
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Career Profile</h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[#94A3B8] block text-xs uppercase tracking-wider font-semibold">Current Location</span>
                <span className="text-[#F1F5F9] font-medium">{profile?.location || 'Remote'}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-xs uppercase tracking-wider font-semibold">Target Roles</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {profile?.targetRoles && profile.targetRoles.length > 0 ? (
                    profile.targetRoles.map((role) => (
                      <span key={role} className="bg-[#0F172A] border border-[#1E293B] px-2 py-1 rounded text-xs font-medium">{role}</span>
                    ))
                  ) : (
                    <span className="text-[#94A3B8] italic">No target roles defined</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Verified skills & Career Memory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Verified Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile?.preferredLanguage && (
                <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/50 px-3 py-1 rounded-full text-xs font-medium text-[#F1F5F9]">
                  {profile.preferredLanguage} (Preferred)
                </span>
              )}
              <span className="bg-[#16A34A]/25 border border-[#16A34A]/50 px-3 py-1 rounded-full text-xs font-medium text-[#F1F5F9]">Python (Verified)</span>
              <span className="bg-[#16A34A]/25 border border-[#16A34A]/50 px-3 py-1 rounded-full text-xs font-medium text-[#F1F5F9]">FastAPI (Verified)</span>
              <span className="bg-[#1E293B] border border-[#1E293B] px-3 py-1 rounded-full text-xs font-medium text-[#94A3B8]">React (Git Inferred)</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#1E293B] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Career Memory Context</h2>
            <p className="text-xs text-[#94A3B8] mb-4">Atomic facts automatically summarized by Gemma 4 E2B from your activities, queries, and resumes to personalize your roadmaps and prep work.</p>
            <div className="space-y-3">
              {profile?.careerMemory && profile.careerMemory.length > 0 ? (
                profile.careerMemory.map((fact, index) => (
                  <div key={index} className="flex gap-3 items-start bg-[#0F172A]/50 p-3 rounded-md border border-[#1E293B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] mt-1.5 shrink-0" />
                    <span className="text-sm font-medium">{fact}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-[#94A3B8] italic">
                  No facts recorded. Upload a resume to populate memory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
