import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Cpu, Mail, Key, Loader } from 'lucide-react';
import { GemmaBadge } from '../components/GemmaBadge';

export const Register: React.FC = () => {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await register({ email, password });
      if (res.success) {
        navigate('/onboarding');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check backend connection.');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto space-y-6">
      <div className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#4F46E5]/10 text-[#818CF8] mb-1">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="text-xs text-[#94A3B8]">Privacy-first AI Career Intelligence Dashboard</p>
        </div>

        {error && (
          <div className="bg-[#991B1B]/15 border border-[#EF4444]/20 rounded-lg p-3 text-xs text-[#F87171] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-[#64748B]" />
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-[#334155] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Sign Up</span>}
          </button>
        </form>

        <div className="text-center text-xs pt-2">
          <span className="text-[#94A3B8]">Already have an account? </span>
          <Link to="/login" className="text-[#818CF8] font-bold hover:underline">Sign In</Link>
        </div>
      </div>

      <div className="flex justify-center">
        <GemmaBadge />
      </div>
    </div>
  );
};
export default Register;
