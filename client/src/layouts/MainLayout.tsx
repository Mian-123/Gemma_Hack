import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GemmaBadge } from '../components/GemmaBadge';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] font-sans flex flex-col">
      <header className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <span className="text-[#4F46E5]">Opportunity</span>AI
          </Link>
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-[#94A3B8]">
              <Link to="/" className="hover:text-[#F1F5F9] transition-colors">Dashboard</Link>
              <Link to="/opportunities" className="hover:text-[#F1F5F9] transition-colors">Opportunities</Link>
              <Link to="/market" className="hover:text-[#F1F5F9] transition-colors">Market Intel</Link>
              <Link to="/tools" className="hover:text-[#F1F5F9] transition-colors">Career Tools</Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <GemmaBadge />
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#DC2626] transition-colors px-3 py-1.5 rounded border border-[#1E293B] hover:border-[#DC2626]/40"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-[#1E293B] bg-[#0F172A] py-6 text-center text-xs text-[#94A3B8]">
        <p>&copy; {new Date().getFullYear()} OpportunityAI. All career data parsed and processed locally via local Gemma 4 E2B model.</p>
      </footer>
    </div>
  );
};
