import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden" style={{ background: '#080b10' }}>
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20,184,166,0.05), transparent 60%)' }} />

      <div className="relative z-10">
        {/* Glitch 404 */}
        <div className="mb-6 relative">
          <div className="text-[120px] md:text-[160px] font-black leading-none select-none"
            style={{ color: 'transparent', WebkitTextStroke: '2px rgba(20,184,166,0.2)', fontFamily: 'Inter, sans-serif' }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[120px] md:text-[160px] font-black leading-none select-none gradient-text" style={{ fontFamily: 'Inter, sans-serif', opacity: 0.15 }}>
              404
            </div>
          </div>
        </div>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}>
          <Shield size={22} className="text-teal-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={14} />
            Go back
          </button>
          <Link to="/dashboard" className="btn-primary flex items-center gap-2">
            <Home size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
