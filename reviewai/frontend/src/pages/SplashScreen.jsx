import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => setPhase(4), 2400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#080b10' }}
      onClick={onComplete}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.08) 0%, transparent 70%)',
          opacity: phase >= 1 ? 1 : 0
        }}
      />

      {/* Scan line */}
      {phase >= 1 && (
        <div
          className="absolute left-0 right-0 h-px animate-scan pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)' }}
        />
      )}

      {/* Corner brackets */}
      {[['top-8 left-8', 'top', 'left'], ['top-8 right-8', 'top', 'right'], ['bottom-8 left-8', 'bottom', 'left'], ['bottom-8 right-8', 'bottom', 'right']].map(([pos, v, h], i) => (
        <div
          key={i}
          className={`absolute ${pos} w-8 h-8 transition-opacity duration-500`}
          style={{ opacity: phase >= 2 ? 1 : 0, transitionDelay: `${i * 100}ms` }}
        >
          <div className={`absolute ${v === 'top' ? 'top-0' : 'bottom-0'} ${h === 'left' ? 'left-0' : 'right-0'} w-8 h-px bg-teal-500/50`} />
          <div className={`absolute ${v === 'top' ? 'top-0' : 'bottom-0'} ${h === 'left' ? 'left-0' : 'right-0'} w-px h-8 bg-teal-500/50`} />
        </div>
      ))}

      {/* Main logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo icon */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0.8)',
          }}
        >
          <div className="relative w-20 h-20">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(6,182,212,0.1))',
                border: '1px solid rgba(20,184,166,0.4)',
                boxShadow: phase >= 2 ? '0 0 40px rgba(20,184,166,0.3), inset 0 0 20px rgba(20,184,166,0.05)' : 'none',
                transition: 'box-shadow 0.8s ease',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 32 L8 12 L20 8 L32 12 L32 32" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={phase >= 1 ? 1 : 0} style={{ transition: 'opacity 0.5s 0.3s' }} />
                <path d="M14 26 L18 30 L26 22" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={phase >= 2 ? 1 : 0} style={{ transition: 'opacity 0.5s 0.2s' }} />
                <circle cx="20" cy="20" r="2" fill="#14b8a6" opacity={phase >= 3 ? 1 : 0} style={{ transition: 'opacity 0.3s' }} />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div
          className="flex flex-col items-center gap-2 transition-all duration-700"
          style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)' }}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Review
            </span>
            <span
              className="text-4xl font-bold tracking-tight"
              style={{
                color: '#14b8a6',
                textShadow: phase >= 3 ? '0 0 30px rgba(20,184,166,0.6)' : 'none',
                transition: 'text-shadow 0.8s ease',
              }}
            >
              AI
            </span>
          </div>
          <p
            className="text-sm text-slate-500 tracking-widest uppercase"
            style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}
          >
            Intelligent Code Review
          </p>
        </div>

        {/* Loading bar */}
        <div
          className="w-48 h-px rounded-full overflow-hidden transition-opacity duration-500"
          style={{ background: 'rgba(255,255,255,0.06)', opacity: phase >= 2 ? 1 : 0 }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              background: 'linear-gradient(90deg, #14b8a6, #06b6d4)',
              width: phase >= 3 ? '100%' : phase >= 2 ? '60%' : '0%',
              boxShadow: '0 0 10px rgba(20,184,166,0.6)',
            }}
          />
        </div>

        {/* Status text */}
        <p
          className="text-xs text-slate-600 font-mono transition-opacity duration-500"
          style={{ opacity: phase >= 3 ? 1 : 0 }}
        >
          {phase >= 4 ? 'Ready' : 'Initializing...'}
          {phase < 4 && <span className="animate-blink">_</span>}
        </p>
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-8 text-xs text-slate-700 transition-opacity duration-500" style={{ opacity: phase >= 2 ? 1 : 0 }}>
        Click anywhere to skip
      </p>
    </div>
  );
}
