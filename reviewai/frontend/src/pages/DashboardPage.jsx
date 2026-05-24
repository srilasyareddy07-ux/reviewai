import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight, Zap, Bug, Code2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { getDashboard } from '../services/api';

import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', info: '#64748b' };
const CATEGORY_ICONS = { security: Shield, performance: Zap, bug: Bug, smell: Code2, style: Code2 };

function ScoreRing({ score, label, color, size = 80 }) {
  const data = [{ value: score }, { value: 100 - score }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={size * 0.36} outerRadius={size * 0.46} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.04)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{score}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  if (loading) return (
    <div className="p-6 space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
    </div>
  );

  const stats = [
    { label: 'Total Reviews', value: data?.totalReviews || 0, icon: GitPullRequest, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
    { label: 'Issues Found', value: data?.totalIssues || 0, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Critical Issues', value: data?.criticalIssues || 0, icon: Shield, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Avg Merge Score', value: `${data?.averageScores?.merge || 0}%`, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  ];

  const severityData = data?.issuesBySeverity || [];
  const categoryData = data?.issuesByCategory || [];
  const categoryColors = { security: '#ef4444', performance: '#f59e0b', bug: '#c084fc', smell: '#14b8a6', style: '#3b82f6' };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, {firstName} 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's what's happening with your code health.</p>
        </div>
        <Link to="/analyze" className="btn-primary flex items-center gap-2 text-sm font-semibold">
          <Zap size={14} />
          New Analysis
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Score rings + charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score rings */}
        <div className="p-5 rounded-xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Average Scores</h3>
          <div className="flex justify-around">
            <ScoreRing score={data?.averageScores?.merge || 0} label="Merge Ready" color="#14b8a6" />
            <ScoreRing score={data?.averageScores?.security || 0} label="Security" color="#3b82f6" />
            <ScoreRing score={data?.averageScores?.quality || 0} label="Quality" color="#22c55e" />
          </div>
        </div>

        {/* Issues by severity */}
        <div className="p-5 rounded-xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Issues by Severity</h3>
          {severityData.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm">No data yet</div>
          ) : (
            <div className="space-y-2.5">
              {severityData.map(s => (
                <div key={s.severity} className="flex items-center gap-3">
                  <div className="w-16 text-xs capitalize" style={{ color: SEVERITY_COLORS[s.severity] || '#64748b' }}>{s.severity}</div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((s.count / (data?.totalIssues || 1)) * 100, 100)}%`, background: SEVERITY_COLORS[s.severity] || '#64748b' }} />
                  </div>
                  <div className="w-6 text-xs text-slate-400 text-right">{s.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues by category */}
        <div className="p-5 rounded-xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Issues by Category</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-slate-500 text-sm">No data yet</div>
          ) : (
            <div className="space-y-2.5">
              {categoryData.map(c => {
                const Icon = CATEGORY_ICONS[c.category] || Code2;
                return (
                  <div key={c.category} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-20">
                      <Icon size={11} style={{ color: categoryColors[c.category] || '#64748b' }} />
                      <span className="text-xs capitalize" style={{ color: categoryColors[c.category] || '#64748b' }}>{c.category}</span>
                    </div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min((c.count / (data?.totalIssues || 1)) * 100, 100)}%`, background: categoryColors[c.category] || '#64748b' }} />
                    </div>
                    <div className="w-6 text-xs text-slate-400 text-right">{c.count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white">Recent Reviews</h3>
          <Link to="/history" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!data?.recentReviews?.length ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <GitPullRequest size={20} className="text-slate-500" />
            </div>
            <div className="text-white font-medium mb-1">No reviews yet</div>
            <div className="text-sm text-slate-500 mb-4">Start by analyzing your first pull request</div>
            <Link to="/analyze" className="btn-primary text-sm">Analyze a PR</Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {data.recentReviews.map(review => (
              <Link key={review.id} to={`/review/${review.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(20,184,166,0.1)' }}>
                  <GitPullRequest size={14} className="text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{review.prTitle || review.repoName || 'Code Analysis'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{review.issues?.length || 0} issues • {review.language}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: (review.mergeScore || 0) >= 70 ? '#22c55e' : (review.mergeScore || 0) >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {review.mergeScore || 0}%
                    </div>
                    <div className="text-xs text-slate-600">merge</div>
                  </div>
                  <div className="text-xs text-slate-600">{format(new Date(review.createdAt), 'MMM d')}</div>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
