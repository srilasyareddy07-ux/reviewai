import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Code2, Trash2, ArrowRight, Shield, Zap, AlertTriangle, Search, Filter, Clock } from 'lucide-react';
import { getReviews, deleteReview } from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6' };

function ReviewCard({ review, onDelete }) {
  const criticalCount = review.issues.filter(i => i.severity === 'critical').length;
  const highCount = review.issues.filter(i => i.severity === 'high').length;
  const mergeColor = review.mergeScore >= 70 ? '#22c55e' : review.mergeScore >= 40 ? '#f59e0b' : '#ef4444';

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(review.id);
      onDelete(review.id);
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Link to={`/review/${review.id}`} className="block group rounded-xl p-4 transition-all duration-200"
      style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: review.prUrl ? 'rgba(20,184,166,0.1)' : 'rgba(129,140,248,0.1)' }}>
          {review.prUrl ? <GitPullRequest size={16} className="text-teal-400" /> : <Code2 size={16} className="text-indigo-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{review.prTitle || review.repoName || 'Code Analysis'}</h3>
              {review.prUrl && (
                <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">{review.prUrl}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Trash2 size={13} />
              </button>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>{review.language}</span>

            {review.issues.length > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-slate-500" />
                <span className="text-xs text-slate-400">{review.issues.length} issues</span>
                {criticalCount > 0 && <span className="badge-critical">{criticalCount} critical</span>}
                {highCount > 0 && <span className="badge-high">{highCount} high</span>}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={11} />
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Score bars */}
          {(review.mergeScore !== null && review.mergeScore !== undefined) && (
            <div className="flex items-center gap-3 mt-3">
              {[
                { label: 'Merge', value: review.mergeScore, color: mergeColor },
                { label: 'Quality', value: review.qualityScore, color: '#22c55e' },
                { label: 'Security', value: review.securityScore, color: '#3b82f6' },
              ].filter(s => s.value !== null && s.value !== undefined).map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-12">{s.label}</span>
                  <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: s.color }}>{s.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | pr | code

  useEffect(() => {
    setLoading(true);
    getReviews(page, 10)
      .then(r => {
        setReviews(r.data.reviews);
        setTotal(r.data.total);
      })
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    setTotal(t => t - 1);
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search || (r.prTitle || r.repoName || '').toLowerCase().includes(search.toLowerCase()) || (r.prUrl || '').includes(search);
    const matchFilter = filter === 'all' || (filter === 'pr' && r.prUrl) || (filter === 'code' && !r.prUrl);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Review History</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total reviews</p>
        </div>
        <Link to="/analyze" className="btn-primary text-sm flex items-center gap-2">
          <GitPullRequest size={14} />
          New Review
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="input pl-9"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['all', 'pr', 'code'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
              style={{ background: filter === f ? 'rgba(20,184,166,0.15)' : 'transparent', color: filter === f ? '#14b8a6' : '#64748b', border: filter === f ? '1px solid rgba(20,184,166,0.2)' : '1px solid transparent' }}>
              {f === 'all' ? 'All' : f === 'pr' ? 'GitHub PRs' : 'Code Paste'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Clock size={24} className="text-slate-600" />
          </div>
          <div className="text-white font-medium mb-1">{search ? 'No reviews match your search' : 'No reviews yet'}</div>
          <div className="text-sm text-slate-500 mb-4">
            {search ? 'Try a different search term' : 'Start by analyzing your first pull request'}
          </div>
          {!search && <Link to="/analyze" className="btn-primary text-sm">Analyze a PR</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">Previous</button>
          <span className="text-sm text-slate-400">Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)} className="btn-secondary disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
