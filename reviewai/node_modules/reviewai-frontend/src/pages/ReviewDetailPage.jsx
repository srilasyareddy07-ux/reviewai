import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, Bug, Code2, ChevronDown, ChevronUp, Wand2, MessageSquare, ArrowLeft, GitPullRequest, ExternalLink, Check, Copy, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getReview, generateFix } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', info: '#64748b' };
const CATEGORY_COLORS = { security: '#ef4444', performance: '#f59e0b', bug: '#c084fc', smell: '#14b8a6', style: '#3b82f6' };
const CATEGORY_ICONS = { security: Shield, performance: Zap, bug: Bug, smell: Code2, style: Code2 };

function ScoreMini({ value, label, color }) {
  const data = [{ v: value }, { v: 100 - value }];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 72, height: 72 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={32} dataKey="v" startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.04)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white">{value || 0}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function IssueCard({ issue, reviewId, code, language, onFixGenerated }) {
  const [expanded, setExpanded] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [fix, setFix] = useState(issue.fixedCode ? { fixedCode: issue.fixedCode } : null);
  const [copied, setCopied] = useState(false);

  const Icon = CATEGORY_ICONS[issue.category] || Code2;
  const sevColor = SEVERITY_COLORS[issue.severity] || '#64748b';
  const catColor = CATEGORY_COLORS[issue.category] || '#64748b';

  const handleFix = async (e) => {
    e.stopPropagation();
    setFixLoading(true);
    try {
      const res = await generateFix(reviewId, issue.id);
      setFix(res.data.fix);
      if (onFixGenerated) onFixGenerated(issue.id, res.data.fix);
      toast.success('Fix generated!');
    } catch {
      toast.error('Failed to generate fix');
    } finally {
      setFixLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200 hover:border-white/10"
      style={{ background: '#0f1117', border: `1px solid rgba(255,255,255,0.06)` }}>
      {/* Header */}
      <button className="w-full flex items-start gap-3 p-4 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${catColor}15` }}>
          <Icon size={14} style={{ color: catColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-white">{issue.title}</span>
            <span className={`badge-${issue.severity}`}>{issue.severity}</span>
            <span className="badge" style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30` }}>{issue.category}</span>
            {issue.lineNumber && <span className="text-xs text-slate-500 font-mono">line {issue.lineNumber}</span>}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{issue.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {issue.confidence && (
            <span className="text-xs text-slate-500">{Math.round(issue.confidence * 100)}%</span>
          )}
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-slide-down border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="pt-3">
            <p className="text-sm text-slate-300 leading-relaxed">{issue.description}</p>
          </div>

          {/* Original code */}
          {issue.originalCode && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-slate-400">Problematic Code</span>
              </div>
              <div className="relative rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={language || 'javascript'}
                  style={oneDark}
                  customStyle={{ margin: 0, fontSize: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '12px' }}
                >
                  {issue.originalCode}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Fixed code */}
          {fix?.fixedCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-medium text-slate-400">Suggested Fix</span>
                </div>
                <button onClick={() => handleCopy(fix.fixedCode)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors">
                  {copied ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="relative rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={language || 'javascript'}
                  style={oneDark}
                  customStyle={{ margin: 0, fontSize: '12px', background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: '8px', padding: '12px' }}
                >
                  {fix.fixedCode}
                </SyntaxHighlighter>
              </div>
              {fix.explanation && (
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{fix.explanation}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {!fix && (
              <button onClick={handleFix} disabled={fixLoading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', color: '#14b8a6' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.1)'}>
                {fixLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                {fixLoading ? 'Generating...' : 'Generate Fix'}
              </button>
            )}
            <Link to={`/chat?reviewId=${reviewId}&issueId=${issue.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-secondary">
              <MessageSquare size={12} />
              Ask AI
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDiff, setShowDiff] = useState(true);

  useEffect(() => {
    getReview(id)
      .then(r => setReview(r.data.review))
      .catch(() => toast.error('Review not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-6 space-y-4">
      {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
    </div>
  );

  if (!review) return (
    <div className="p-6 text-center text-slate-400">
      <AlertTriangle className="mx-auto mb-3 text-slate-600" size={32} />
      Review not found. <Link to="/history" className="text-teal-400 hover:underline">View history</Link>
    </div>
  );

  const filteredIssues = activeFilter === 'all' ? review.issues : review.issues.filter(i => i.severity === activeFilter || i.category === activeFilter);
  const severityCounts = ['critical', 'high', 'medium', 'low'].reduce((acc, s) => {
    acc[s] = review.issues.filter(i => i.severity === s).length;
    return acc;
  }, {});

  const getMergeColor = (score) => score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const getMergeLabel = (score) => score >= 70 ? 'Ready to Merge' : score >= 40 ? 'Needs Work' : 'Not Ready';

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen">
      {/* Left: Code diff */}
      <div className={`${showDiff ? 'lg:w-1/2' : 'lg:w-0 lg:overflow-hidden'} transition-all duration-300 border-r flex-shrink-0`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0d13' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <ArrowLeft size={14} />
            </button>
            <div>
              <div className="text-sm font-semibold text-white truncate max-w-48">{review.prTitle || review.repoName || 'Code Analysis'}</div>
              <div className="text-xs text-slate-500">{review.language} · {format(new Date(review.createdAt), 'MMM d, yyyy HH:mm')}</div>
            </div>
          </div>
          <button onClick={() => setShowDiff(!showDiff)} className="text-xs text-slate-500 hover:text-white transition-colors hidden lg:block">
            {showDiff ? 'Hide diff' : 'Show diff'}
          </button>
        </div>

        {/* PR meta */}
        {review.prUrl && (
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0a0d13' }}>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <GitPullRequest size={12} className="text-teal-400" />
              <span className="font-mono truncate max-w-xs">{review.prUrl}</span>
            </div>
            <a href={review.prUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Code / diff */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {review.rawDiff || review.codeSnippet ? (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between px-4 py-2 text-xs font-mono" style={{ background: '#161b24', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                <span>{review.rawDiff ? 'diff view' : 'code'}</span>
                <span>{review.language}</span>
              </div>
              <SyntaxHighlighter
                language={review.language || 'javascript'}
                style={oneDark}
                showLineNumbers
                customStyle={{ margin: 0, fontSize: '12px', background: '#0a0d13', borderRadius: 0, maxHeight: '70vh' }}
                lineNumberStyle={{ color: '#374151', minWidth: '2.5em' }}
              >
                {review.rawDiff || review.codeSnippet || ''}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              <div className="text-center">
                <Code2 size={24} className="mx-auto mb-2 text-slate-600" />
                No code diff available
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Review */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scores header */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0d13' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-semibold text-white">AI Review Results</div>
              <div className="text-xs text-slate-500">{review.issues.length} issues found</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/chat?reviewId=${review.id}`} className="btn-secondary flex items-center gap-1.5 text-xs">
                <MessageSquare size={12} />
                Chat
              </Link>
            </div>
          </div>

          {/* Score row */}
          <div className="flex items-center gap-6">
            <ScoreMini value={review.mergeScore} label="Merge Ready" color={getMergeColor(review.mergeScore)} />
            <ScoreMini value={review.qualityScore} label="Quality" color="#22c55e" />
            <ScoreMini value={review.securityScore} label="Security" color="#3b82f6" />
            <div className="flex-1">
              {/* Merge badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
                style={{ background: `${getMergeColor(review.mergeScore)}15`, color: getMergeColor(review.mergeScore), border: `1px solid ${getMergeColor(review.mergeScore)}30` }}>
                {getMergeLabel(review.mergeScore)}
              </div>
              {review.summary && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{review.summary}</p>
              )}
            </div>
          </div>

          {/* Severity summary chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {Object.entries(severityCounts).filter(([, count]) => count > 0).map(([sev, count]) => (
              <button key={sev} onClick={() => setActiveFilter(activeFilter === sev ? 'all' : sev)}
                className={`badge-${sev} cursor-pointer transition-all`}
                style={{ opacity: activeFilter !== 'all' && activeFilter !== sev ? 0.4 : 1 }}>
                {count} {sev}
              </button>
            ))}
            {activeFilter !== 'all' && (
              <button onClick={() => setActiveFilter('all')} className="text-xs text-slate-500 hover:text-white transition-colors">
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Issues list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Check size={20} className="text-green-400" />
              </div>
              <div className="text-white font-medium mb-1">
                {activeFilter === 'all' ? 'No issues found!' : `No ${activeFilter} issues`}
              </div>
              <div className="text-sm text-slate-500">
                {activeFilter === 'all' ? 'Your code looks clean.' : 'Try changing the filter.'}
              </div>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                reviewId={review.id}
                code={review.codeSnippet}
                language={review.language}
                onFixGenerated={(issueId, fix) => {
                  setReview(r => ({
                    ...r,
                    issues: r.issues.map(i => i.id === issueId ? { ...i, fixedCode: fix.fixedCode } : i)
                  }));
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
