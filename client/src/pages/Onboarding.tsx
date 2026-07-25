import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { GemmaBadge } from '../components/GemmaBadge';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto space-y-6">
      <div className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-8 shadow-xl space-y-8 min-h-[420px] flex flex-col justify-between">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-4">
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-widest">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-1 rounded-full transition-all ${
                  s === step ? 'bg-[#4F46E5]' : s < step ? 'bg-[#4F46E5]/40' : 'bg-[#334155]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col justify-center py-4 space-y-4">
          {step === 1 && (
            <div className="space-y-4 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-2xl bg-[#4F46E5]/10 text-[#818CF8]">
                <Award className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">What is OpportunityAI?</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  OpportunityAI is a focused personal career intelligence dashboard. Instead of browsing generic job listings, 
                  it aligns your specific developer skills against direct opportunities to show compatibilities and study roadmaps.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-2xl bg-[#16A34A]/10 text-[#4ADE80]">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">100% Privacy via Local Gemma</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  All resume text extractions, GitHub repo analyses, and matching summaries are computed locally using the 
                  <span className="text-[#818CF8] font-semibold"> Gemma 4 E2B</span> model running on your computer. 
                  Your credentials and career documents never leave your node.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 rounded-2xl bg-[#D97706]/10 text-[#FBBF24]">
                <Cpu className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Unlock Career Optimization</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Get started by uploading a PDF resume or connecting your GitHub. OpportunityAI will identify skill gaps, 
                  generate customized project-based roadmaps, draft tailored cover letters, and prepare you for technical interviews.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#334155] pt-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#CBD5E1] disabled:text-[#334155] disabled:no-underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-md"
          >
            <span>{step === 3 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <div className="flex justify-center">
        <GemmaBadge />
      </div>
    </div>
  );
};
export default Onboarding;
