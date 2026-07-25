export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
}

export interface ExtractedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  confidenceScores: {
    personal: number;
    skills: number;
    experience: number;
    education: number;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number | null;
  }>;
  targetRoles: string[];
  location: string;
  preferredLanguage: string;
  careerMemory: string[];
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  type: 'job' | 'internship' | 'hackathon' | 'project';
  url: string;
  location: string;
  skillsRequired: string[];
  postedAt: string;
}

export interface OpportunityMatch {
  opportunity: Opportunity;
  score: number;
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
  urgency: 'high' | 'medium' | 'low';
}

export interface SkillGapItem {
  skill: string;
  category: 'matched' | 'weak' | 'missing' | 'extra';
  details: string;
}

export interface SkillGapAnalysis {
  overallMatchPercentage: number;
  gapSummary: string;
  skills: SkillGapItem[];
  roadmapSeedSkills: string[];
}

export interface RoadmapStep {
  stepNumber: number;
  topic: string;
  concepts: string[];
  estimatedHours: number;
  resources: string[];
}

export interface PracticeProject {
  title: string;
  description: string;
  skillsExercised: string[];
}

export interface LearningRoadmap {
  roleTitle: string;
  steps: RoadmapStep[];
  projects: PracticeProject[];
}
