import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, ExtractedResume } from '../types';
import { ResumeUploadDropzone } from '../components/ResumeUploadDropzone';
import { GemmaBadge } from '../components/GemmaBadge';
import { Award, Calendar, RefreshCw, Briefcase, GraduationCap } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeUpload, setActiveUpload] = useState(false);

  // 1. Fetch Latest Resume
  const { data: latestRes, isLoading } = useQuery({
    queryKey: ['latest-resume'],
    queryFn: async () => {
      const res = await api.get<any, ApiResponse<any>>('/resume/latest');
      return res;
    }
  });

  const resumeData = latestRes?.data;
  const parsedResume: ExtractedResume | null = resumeData?.parsedJson || null;

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['latest-resume'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    setActiveUpload(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#334155] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Resume Intelligence
            </h1>
            <GemmaBadge />
          </div>
          <p className="text-sm text-[#94A3B8]">
            Upload and review resume text extractions processed securely on your local node.
          </p>
        </div>
        <div>
          {parsedResume && !activeUpload && (
            <button
              onClick={() => setActiveUpload(true)}
              className="inline-flex items-center gap-1.5 bg-transparent hover:bg-[#334155]/20 text-[#818CF8] hover:text-white border border-[#4F46E5]/40 hover:border-[#818CF8] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-[#64748B] italic text-sm">
            Fetching latest parsing analytics...
          </div>
        ) : activeUpload || !parsedResume ? (
          <div className="space-y-4">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Upload Resume PDF</h3>
              <p className="text-xs text-[#CBD5E1]">
                Your PDF file is converted to raw text and parsed locally via Gemma. Zero details are transmitted to external servers.
              </p>
              <ResumeUploadDropzone onUploadSuccess={handleUploadSuccess} />
              
              {parsedResume && (
                <div className="text-center pt-2">
                  <button 
                    onClick={() => setActiveUpload(false)}
                    className="text-xs font-semibold text-[#64748B] hover:text-white transition-colors"
                  >
                    Cancel & View Latest
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Parsed Resume Details View */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#334155] pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#818CF8] uppercase tracking-widest">Active Resume</span>
                  <h3 className="text-xl font-bold text-white">{parsedResume.name || 'Extracted Profile'}</h3>
                  <div className="text-xs text-[#CBD5E1] flex flex-wrap gap-x-4 gap-y-1">
                    <span>Email: {parsedResume.email || 'None'}</span>
                    {parsedResume.phone && <span>Phone: {parsedResume.phone}</span>}
                  </div>
                </div>
                {resumeData.confidenceScores && (
                  <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-right">
                    <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">Overall Confidence</span>
                    <span className="font-mono text-sm font-bold text-[#22C55E]">
                      {Math.round((resumeData.confidenceScores.skills || 0.9) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#818CF8]" />
                  Extracted Skills & Tooling
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsedResume.skills && parsedResume.skills.length > 0 ? (
                    parsedResume.skills.map(s => (
                      <span key={s} className="bg-[#0F172A]/70 text-[#CBD5E1] border border-[#334155] px-3 py-1 rounded text-xs font-semibold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B] italic">No technical skills detected</span>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#818CF8]" />
                  Work Experience
                </h4>
                <div className="space-y-4">
                  {parsedResume.experience && parsedResume.experience.length > 0 ? (
                    parsedResume.experience.map((exp, idx) => (
                      <div key={idx} className="bg-[#0F172A]/50 border border-[#334155]/40 rounded-lg p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="font-bold text-sm text-white">{exp.position}</h5>
                          <span className="text-xs text-[#818CF8] font-semibold">{exp.company}</span>
                        </div>
                        {exp.startDate && (
                          <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{exp.startDate} &mdash; {exp.endDate || 'Present'}</span>
                          </div>
                        )}
                        <p className="text-xs text-[#CBD5E1] leading-relaxed whitespace-pre-line">{exp.description}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B] italic pl-2">No work history provided</span>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#818CF8]" />
                  Education
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {parsedResume.education && parsedResume.education.length > 0 ? (
                    parsedResume.education.map((edu, idx) => (
                      <div key={idx} className="bg-[#0F172A]/50 border border-[#334155]/40 rounded-lg p-4 space-y-1">
                        <h5 className="font-bold text-sm text-white">{edu.institution}</h5>
                        <p className="text-xs text-[#818CF8] font-semibold">
                          {edu.degree} &bull; {edu.fieldOfStudy}
                        </p>
                        <p className="text-[10px] text-[#64748B]">Class of {edu.graduationYear}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B] italic">No educational records provided</span>
                  )}
                </div>
              </div>

              {/* Projects & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Projects */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC]">Extracted Projects</h5>
                  <div className="space-y-3">
                    {parsedResume.projects && parsedResume.projects.length > 0 ? (
                      parsedResume.projects.map((proj, idx) => (
                        <div key={idx} className="bg-[#0F172A]/30 border border-[#334155]/30 rounded-lg p-3 space-y-1">
                          <h6 className="font-bold text-xs text-white">{proj.title}</h6>
                          <p className="text-[11px] text-[#CBD5E1] leading-normal">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies && proj.technologies.map(t => (
                              <span key={t} className="text-[9px] bg-[#1E293B] text-[#94A3B8] px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748B] italic">No project listings found</span>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#A5B4FC]">Certifications</h5>
                  <ul className="space-y-2 pl-4 list-disc text-xs text-[#CBD5E1]">
                    {parsedResume.certifications && parsedResume.certifications.length > 0 ? (
                      parsedResume.certifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))
                    ) : (
                      <li className="text-[#64748B] italic list-none pl-0">No certifications parsed</li>
                    )}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResumePage;
