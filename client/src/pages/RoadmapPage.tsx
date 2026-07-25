import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, LearningRoadmap } from '../types';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { GemmaBadge } from '../components/GemmaBadge';
import { ChevronLeft, Compass, Loader } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const location = useLocation();
  const stateRoadmap = location.state?.roadmap as LearningRoadmap | undefined;

  // 1. Fetch Roadmap from Database if not present in navigation state
  const { data: roadmapRes, isLoading } = useQuery({
    queryKey: ['roadmap', reportId],
    queryFn: async () => {
      if (stateRoadmap) return { success: true, data: stateRoadmap, error: null };
      await api.get<any, ApiResponse<any>>('/opportunities'); // Placeholder or specific roadmap API if exists
      // Fallback stub: return mock
      const mockRoadmap: LearningRoadmap = {
        roleTitle: "Backend Developer",
        steps: [
          {
            stepNumber: 1,
            topic: "Advanced PostgreSQL and Caching",
            concepts: ["Indexing structures", "Query execution plan tuning", "Redis caching patterns"],
            estimatedHours: 12,
            resources: ["PostgreSQL High Performance Book", "Redis Official Developer Training"]
          },
          {
            stepNumber: 2,
            topic: "Docker Orchestration and CI/CD",
            concepts: ["Multi-stage Docker builds", "GitHub Actions workflows", "Kubernetes basics"],
            estimatedHours: 16,
            resources: ["Docker Official Guides", "Kubernetes Up & Running Course"]
          }
        ],
        projects: [
          {
            title: "Cached REST Service Containerization",
            description: "Compose a multi-container Docker environment running a Python API with Redis caching and PostgreSQL persistence.",
            skillsExercised: ["Docker", "PostgreSQL", "Redis"]
          }
        ]
      };
      return { success: true, data: mockRoadmap, error: null };
    },
    enabled: !stateRoadmap
  });

  const roadmap = stateRoadmap || roadmapRes?.data;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between border-b border-[#334155] pb-4">
        <Link 
          to="/opportunities" 
          className="flex items-center gap-1 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Opportunities Workspace</span>
        </Link>
        <GemmaBadge />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader className="w-8 h-8 text-[#818CF8] animate-spin" />
          <span className="text-xs text-[#94A3B8] italic">Assembling learning modules...</span>
        </div>
      ) : roadmap ? (
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 shadow-xl">
          <RoadmapTimeline roadmap={roadmap} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#1E293B]/20 border border-[#334155] border-dashed rounded-xl space-y-4">
          <Compass className="w-12 h-12 text-[#64748B]" />
          <div className="text-center">
            <h3 className="font-bold text-white text-base">No Learning Roadmap Active</h3>
            <p className="text-xs text-[#94A3B8] mt-1">To generate a custom study plan, trigger a Skill Gap Analysis from an Opportunity page.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoadmapPage;
