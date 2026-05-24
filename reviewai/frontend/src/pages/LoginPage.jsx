import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Cpu, GitPullRequest, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: '#080b10' }}>
      {/* Background elements */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(20,184,166,0.06) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(129,140,248,0.04) 0%, transparent 50%)' }} />

      {/* Floating particles */}
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full opacity-30 animate-float"
          style={{ background: '#14b8a6', left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${4 + i}s` }} />
      ))}

      {/* Back button */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to home
      </Link>

      {/* Login card */}
      <div className="relative w-full max-w-sm mx-4">
        <div className="p-8 rounded-2xl" style={{ background: 'rgba(15,17,23,0.95)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
              <Shield size={22} className="text-teal-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Welcome to ReviewAI</h1>
            <p className="text-sm text-slate-400 mt-1 text-center">Sign in to start reviewing code with AI</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { icon: GitPullRequest, text: 'PR Analysis' },
              { icon: Lock, text: 'Security Scan' },
              { icon: Cpu, text: 'AI Powered' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                <item.icon size={11} />
                {item.text}
              </div>
            ))}
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 group"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs text-slate-600 mt-6 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 Your code is never stored. Analysis happens in real-time.
        </p>
      </div>
    </div>
  );
}
