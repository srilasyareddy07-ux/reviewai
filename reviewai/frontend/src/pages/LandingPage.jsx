import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, GitPullRequest, Code2, ChevronRight, Star, CheckCircle2, ArrowRight, Lock, TrendingUp, Eye, MessageSquare, Github, Cpu } from 'lucide-react';

const FEATURES = [
  { icon: Shield, title: 'Security Scanner', desc: 'Detect hardcoded secrets, SQL injection, API key leaks, and 50+ vulnerability patterns automatically.', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { icon: Zap, title: 'Performance Analysis', desc: 'Find inefficient loops, redundant API calls, memory leaks, and N+1 query problems before they ship.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: Eye, title: 'Code Quality Review', desc: 'Identify code smells, long functions, unclear naming, duplicated logic, and maintainability issues.', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  { icon: Code2, title: 'AI Auto-Fix', desc: 'One-click AI-generated fixes with detailed explanations for every detected issue.', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  { icon: TrendingUp, title: 'Merge Readiness Score', desc: 'Composite score combining security, quality, and performance metrics to guide merge decisions.', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask questions about any detected issue. Get explanations, alternatives, and deeper context instantly.', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
];

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'Rust', 'Ruby'];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'Senior Engineer @ Razorpay', quote: 'ReviewAI caught a hardcoded DB password that would have shipped to production. Game-changer for our team.', rating: 5 },
  { name: 'Priya Sharma', role: 'Tech Lead @ Zepto', quote: 'Reduced our code review time by 60%. The AI suggestions are actually smart, not just linting rules.', rating: 5 },
  { name: 'Ravi Kumar', role: 'CTO @ YC Startup', quote: 'The merge readiness score gives our non-technical founders a clear signal on code health. Love it.', rating: 5 },
];

const PRICING = [
  { name: 'Starter', price: 'Free', desc: 'For individual developers', features: ['10 reviews/month', 'Basic AI analysis', 'Security scanner', 'GitHub PR support'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$19', period: '/month', desc: 'For professional developers', features: ['Unlimited reviews', 'Advanced AI analysis', 'Auto-fix generator', 'AI chat assistant', 'Priority support', 'Analytics dashboard'], cta: 'Start Free Trial', highlight: true },
  { name: 'Team', price: '$49', period: '/month', desc: 'For engineering teams', features: ['Everything in Pro', 'Team analytics', 'Webhook integration', 'Custom rules', 'SSO support', 'Dedicated support'], cta: 'Contact Sales', highlight: false },
];

const FAQS = [
  { q: 'How does ReviewAI connect to GitHub?', a: 'Paste any public GitHub PR URL, or add your personal access token for private repos. We never store your code — analysis happens in real-time.' },
  { q: 'Which AI model powers the analysis?', a: 'We use Llama 3.3 70B via Groq for ultra-fast inference. Typically under 3 seconds for a full PR analysis.' },
  { q: 'Is my code kept private?', a: 'Yes. Code is processed in memory and never persisted on our servers. Only issue summaries and scores are saved.' },
  { q: 'Which languages are supported?', a: 'JavaScript, TypeScript, Python, Java, Go, C++, Rust, Ruby, PHP, Swift, Kotlin, and more.' },
  { q: 'Can I use my own Groq API key?', a: 'Absolutely. Add your Groq API key in Settings to use your own quota and get unlimited reviews.' },
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [langIdx, setLangIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLangIdx(i => (i + 1) % LANGUAGES.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#080b10', color: '#e2e8f0' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5" style={{ background: 'rgba(8,11,16,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}>
            <Shield size={16} className="text-teal-400" />
          </div>
          <span className="font-bold text-white">Review<span className="text-teal-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {['Features', 'Pricing', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link to="/login" className="btn-primary text-sm font-semibold">Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-40" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 60%)' }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', color: '#14b8a6' }}>
            <Cpu size={12} />
            Powered by Llama 3.3 70B via Groq
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            AI Code Review<br />
            <span className="gradient-text">That Actually Works</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Catch security vulnerabilities, performance issues, and bugs before they reach production.
            Connect your GitHub PR and get an AI-powered review in under 3 seconds.
          </p>

          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all" style={{ background: '#14b8a6', color: '#000', boxShadow: '0 0 20px rgba(20,184,166,0.3)' }}>
              <GitPullRequest size={16} />
              Analyze a PR — it's free
              <ChevronRight size={14} />
            </Link>
            <a href="https://github.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm btn-secondary">
              <Github size={16} />
              View on GitHub
            </a>
          </div>

          {/* Language ticker */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>Supports</span>
            <span className="font-mono text-teal-400 transition-all duration-300 w-24 text-left">{LANGUAGES[langIdx]}</span>
            <span>and more</span>
          </div>
        </div>

        {/* Hero code preview */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f1117' }}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-mono">auth.js — Pull Request #42</span>
            </div>
            {/* Code */}
            <div className="p-6 text-left font-mono text-sm leading-relaxed">
              <div className="text-slate-500">// auth.js</div>
              <div className="text-slate-300">const <span className="text-teal-400">password</span> = <span className="text-red-400 relative">"admin123"
                <span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ transform: 'translate(100%, -20%)' }} />
              </span>;</div>
              <div className="text-slate-300">const <span className="text-yellow-400">query</span> = `SELECT * FROM users WHERE id = <span className="text-orange-400 relative">${'{'}userId{'}'}
                <span className="absolute -right-2 top-0 w-2 h-2 rounded-full bg-orange-500 animate-pulse" style={{ transform: 'translate(100%, -20%)' }} />
              </span>`;</div>

              {/* AI Review box */}
              <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-red-400" />
                  <span className="text-red-400 text-xs font-semibold">CRITICAL — Security Issue Detected</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>🔑 Hardcoded password in source code</div>
                  <div>💉 SQL injection vulnerability (line 2)</div>
                  <div className="text-teal-400 mt-2">✓ Fix: Use process.env.DB_PASSWORD & parameterized queries</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-4 flex items-center gap-4 text-xs">
                {[['Merge Score', '23%', '#ef4444'], ['Security', '12%', '#ef4444'], ['Quality', '45%', '#f59e0b']].map(([label, val, color]) => (
                  <div key={label} className="flex-1">
                    <div className="flex justify-between mb-1"><span className="text-slate-500">{label}</span><span style={{ color }}>{val}</span></div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: val, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4" style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)' }}>
              Core Features
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need for<br />bulletproof code</h2>
            <p className="text-slate-400 text-lg">Six specialized AI review modes working together in one unified workflow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '40'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 px-6" style={{ background: '#0a0e16' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 mb-16">From PR URL to full AI review in under 3 seconds.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Paste PR URL', desc: 'Drop any GitHub PR link or paste code directly', icon: GitPullRequest },
              { step: '02', title: 'Fetch Diff', desc: 'We pull changed files and commits from GitHub API', icon: Github },
              { step: '03', title: 'AI Analyzes', desc: 'Llama 3.3 70B scans every line for issues', icon: Cpu },
              { step: '04', title: 'Get Review', desc: 'Structured comments, scores, and one-click fixes', icon: CheckCircle2 },
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-8 right-0 w-full h-px" style={{ background: 'linear-gradient(90deg, rgba(20,184,166,0.3), transparent)', transform: 'translateX(50%)' }} />}
                <div className="p-5 rounded-2xl text-left" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs font-mono text-teal-500 mb-3">{s.step}</div>
                  <s.icon size={20} className="text-teal-400 mb-3" />
                  <div className="font-semibold text-white text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Trusted by developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-0.5 mb-4">{Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="font-medium text-white text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6" style={{ background: '#0a0e16' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Simple pricing</h2>
          <p className="text-slate-400 text-center mb-16">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((p, i) => (
              <div key={i} className={`p-6 rounded-2xl relative ${p.highlight ? 'shadow-glow' : ''}`}
                style={{ background: p.highlight ? 'rgba(20,184,166,0.05)' : '#0f1117', border: p.highlight ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#14b8a6', color: '#000' }}>Most Popular</div>}
                <div className="mb-4">
                  <div className="font-semibold text-white mb-1">{p.name}</div>
                  <div className="text-3xl font-bold text-white">{p.price}<span className="text-sm text-slate-400 font-normal">{p.period}</span></div>
                  <div className="text-xs text-slate-500 mt-1">{p.desc}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-teal-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`block text-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Frequently asked</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#0f1117' }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span className="font-medium text-sm text-white">{faq.q}</span>
                  <span className="text-slate-500 transition-transform" style={{ transform: activeFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed animate-slide-down">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20,184,166,0.06), transparent)' }} />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-4">Start reviewing smarter</h2>
          <p className="text-slate-400 mb-8">Join thousands of developers shipping safer, faster code.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold" style={{ background: '#14b8a6', color: '#000', boxShadow: '0 0 30px rgba(20,184,166,0.3)' }}>
            Get started for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-teal-400" />
          <span className="text-white font-medium">Review<span className="text-teal-400">AI</span></span>
          <span>— Intelligent Code Review Platform</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <span>© 2024 ReviewAI. All rights reserved.</span>
      </footer>
    </div>
  );
}
