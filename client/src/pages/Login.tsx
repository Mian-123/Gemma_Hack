import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Key, Mail, Loader, Cpu } from 'lucide-react';
import { GemmaBadge } from '../components/GemmaBadge';

export const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/onboarding');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Backend might be unreachable.');
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('developer@example.com');
    setPassword('demopass123');
    try {
      const res = await login({ email: 'developer@example.com', password: 'demopass123' });
      if (res.success) {
        navigate('/');
      } else {
        setError('Demo sign in failed.');
      }
    } catch (err: any) {
      setError('Connection refused. Run python main.py backend first.');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto space-y-6">
      <div className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-6 shadow-xl space-y-6">
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#4F46E5]/10 text-[#818CF8] mb-1">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to OpportunityAI</h2>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 disabled:bg-[#4F46E5]/50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="relative flex items-center justify-center border-t border-[#334155] pt-4 text-xs font-medium text-[#64748B]">
          <span className="bg-[#1E293B] px-2 absolute uppercase tracking-wider text-[10px]">Or use Demo</span>
        </div>

        <button
          onClick={handleDemoSignIn}
          className="w-full bg-transparent hover:bg-[#334155]/20 text-[#818CF8] hover:text-white border border-[#4F46E5]/30 hover:border-[#818CF8] font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Bypass with Local Demo Account</span>
        </button>

        <div className="text-center text-xs pt-2">
          <span className="text-[#94A3B8]">Don't have an account? </span>
          <Link to="/register" className="text-[#818CF8] font-bold hover:underline">Sign Up</Link>
        </div>
      </div>

      <div className="flex justify-center">
        <GemmaBadge />
      </div>
    </div>
  );
};
export default Login;
