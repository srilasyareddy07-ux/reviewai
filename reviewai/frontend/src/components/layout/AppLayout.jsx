import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, GitPullRequest, MessageSquare, Clock, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, Bell, Search, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: GitPullRequest, label: 'Analyze PR' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }) {
  const { user, dbUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${collapsed ? 'justify-center' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
          <Shield size={15} className="text-teal-400" />
        </div>
        {!collapsed && <span className="font-bold text-white text-sm">Review<span className="text-teal-400">AI</span></span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-teal-400/10 text-teal-400 border border-teal-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Quick analyze CTA */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <button onClick={() => { navigate('/analyze'); setMobileOpen(false); }} className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
            style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.2)', color: '#14b8a6' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.15)'}>
            <Zap size={13} />
            New Analysis
          </button>
        </div>
      )}

      {/* User */}
      <div className={`p-3 border-t ${collapsed ? '' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=14b8a6&color=000`}
              alt="avatar" className="w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.displayName || 'User'}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=U&background=14b8a6&color=000`}
              alt="avatar" className="w-8 h-8 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080b10' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative" style={{ width: collapsed ? 64 : 224, background: '#0a0d13', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10"
          style={{ background: '#161b24', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 flex flex-col flex-shrink-0" style={{ background: '#0a0d13', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0" style={{ background: '#0a0d13', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Search size={14} />
              <span>Quick search...</span>
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#475569' }}>⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Bell size={15} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs text-slate-400">AI Ready</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
