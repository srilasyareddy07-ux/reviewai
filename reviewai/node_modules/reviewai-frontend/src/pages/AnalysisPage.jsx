import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, Code2, Shield, Zap, AlertTriangle, ChevronDown, Loader2, ExternalLink } from 'lucide-react';
import { analyzePR, analyzeCode } from '../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'cpp', 'rust', 'ruby', 'php'];

const EXAMPLE_CODE = `// Example: Vulnerable authentication code
const express = require('express');
const app = express();

const DB_PASSWORD = "admin123";
const API_KEY = "sk-prod-abc123xyz";

app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  db.query(query, (err, results) => {
    res.json(results);
  });
});

function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    for (var j = 0; j < users.length; j++) {
      if (users[i].id !== users[j].id) {
        result.push(users[i]);
      }
    }
  }
  return result;
}`;

const EXAMPLE_PRS = [
  'https://github.com/vercel/next.js/pull/60000',
  'https://github.com/facebook/react/pull/27000',
  'https://github.com/microsoft/vscode/pull/200000',
];

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('pr'); // pr | code
  const [prUrl, setPrUrl] = useState('');
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handlePRAnalyze = async () => {
    if (!prUrl.trim()) return toast.error('Please enter a GitHub PR URL');
    if (!prUrl.includes('github.com')) return toast.error('Please enter a valid GitHub PR URL');

    setLoading(true);
    setLoadingMsg('Fetching PR from GitHub...');
    try {
      setTimeout(() => setLoadingMsg('AI analyzing code...'), 2000);
      setTimeout(() => setLoadingMsg('Generating review comments...'), 5000);
      const res = await analyzePR(prUrl);
      toast.success('Analysis complete!');
      navigate(`/review/${res.data.review.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Check your PR URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeAnalyze = async () => {
    if (!code.trim()) return toast.error('Please paste some code to analyze');

    setLoading(true);
    setLoadingMsg('AI analyzing code...');
    try {
      setTimeout(() => setLoadingMsg('Detecting issues...'), 2000);
      setTimeout(() => setLoadingMsg('Generating fixes...'), 4000);
      const res = await analyzeCode(code, language);
      toast.success('Analysis complete!');
      navigate(`/review/${res.data.review.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analyze Code</h1>
        <p className="text-slate-400 text-sm">Submit a GitHub PR URL or paste code directly for instant AI review.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { id: 'pr', label: 'GitHub PR', icon: GitPullRequest },
          { id: 'code', label: 'Paste Code', icon: Code2 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === t.id ? 'rgba(20,184,166,0.15)' : 'transparent', color: tab === t.id ? '#14b8a6' : '#64748b', border: tab === t.id ? '1px solid rgba(20,184,166,0.2)' : '1px solid transparent' }}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* PR Tab */}
      {tab === 'pr' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-2xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="block text-sm font-medium text-white mb-3">GitHub Pull Request URL</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <GitPullRequest size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="url"
                  value={prUrl}
                  onChange={e => setPrUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePRAnalyze()}
                  placeholder="https://github.com/owner/repo/pull/123"
                  className="input pl-10"
                />
              </div>
              <button onClick={handlePRAnalyze} disabled={loading} className="btn-primary px-6 flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                {loading ? 'Analyzing...' : 'Analyze PR'}
              </button>
            </div>

            {loading && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg animate-fade-in" style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
                <Loader2 size={14} className="animate-spin text-teal-400" />
                <span className="text-sm text-teal-400">{loadingMsg}</span>
              </div>
            )}
          </div>

          {/* Example PRs */}
          <div className="p-4 rounded-xl" style={{ background: '#0a0d13', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-xs text-slate-500 mb-3 font-medium">Try example PRs</div>
            <div className="space-y-2">
              {EXAMPLE_PRS.map(url => (
                <button key={url} onClick={() => setPrUrl(url)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-all text-left group"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}>
                  <ExternalLink size={11} className="text-slate-500 group-hover:text-teal-400" />
                  <span className="font-mono truncate">{url}</span>
                </button>
              ))}
            </div>
          </div>

          {/* What we analyze */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: 'Security Vulnerabilities', color: '#ef4444' },
              { icon: Zap, label: 'Performance Issues', color: '#f59e0b' },
              { icon: AlertTriangle, label: 'Logic Bugs', color: '#c084fc' },
              { icon: Code2, label: 'Code Quality', color: '#14b8a6' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl flex flex-col gap-2" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.05)' }}>
                <item.icon size={16} style={{ color: item.color }} />
                <span className="text-xs text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Tab */}
      {tab === 'code' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 rounded-2xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Paste Your Code</label>
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg outline-none"
                  style={{ background: '#161b24', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={() => setCode(EXAMPLE_CODE)} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  Load Example
                </button>
              </div>
            </div>

            {/* Code editor */}
            <div className="relative rounded-xl overflow-hidden" style={{ background: '#0a0d13', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Line numbers */}
              <div className="flex">
                <div className="select-none pt-4 pb-4 px-3 text-right text-xs leading-6 text-slate-600 font-mono border-r min-w-[3rem]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="flex-1 p-4 text-sm font-mono leading-6 resize-none outline-none text-slate-200 bg-transparent code-scroll"
                  style={{ minHeight: '360px', caretColor: '#14b8a6' }}
                  spellCheck={false}
                  placeholder="Paste your code here..."
                />
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{code.split('\n').length} lines</span>
                <span>{code.length} chars</span>
                <span className="capitalize">{language}</span>
              </div>
              <button onClick={handleCodeAnalyze} disabled={loading || !code.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {loading ? loadingMsg : 'Analyze Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
