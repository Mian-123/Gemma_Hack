import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/useAppStore';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAppStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Login placeholder page for scaffold completeness
const Login: React.FC = () => {
  const { setAuth } = useAppStore();
  const handleDemoLogin = () => {
    setAuth("mock_token", { id: "1", email: "developer@example.com", createdAt: new Date().toISOString() });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Login to OpportunityAI</h2>
        <p className="text-sm text-[#94A3B8]">Privacy-first AI Career Intelligence</p>
      </div>
      <button 
        onClick={handleDemoLogin}
        className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium py-2 rounded-md transition-colors"
      >
        Sign In (Demo Mode)
      </button>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </QueryClientProvider>
  );
}
export { App };
