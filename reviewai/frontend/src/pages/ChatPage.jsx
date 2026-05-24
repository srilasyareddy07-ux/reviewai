import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Bot, User, Loader2, Code2, GitPullRequest, Sparkles, Copy, Check, Trash2 } from 'lucide-react';
import { sendMessage } from '../services/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Why is hardcoding passwords dangerous?',
  'How do I fix SQL injection vulnerabilities?',
  'Explain what N+1 queries are',
  'What are best practices for error handling?',
  'How can I improve code performance?',
  'What is OWASP Top 10?',
];

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-like renderer
  const renderContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0];
        const code = lines.slice(1).join('\n');
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0d13' }}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f1117' }}>
              <span className="text-xs text-slate-500 font-mono">{lang || 'code'}</span>
              <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied!'); }} className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                <Copy size={11} />
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">{code}</pre>
          </div>
        );
      }

      // Inline formatting
      const segments = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {segments.map((seg, j) => {
            if (seg.startsWith('`') && seg.endsWith('`')) {
              return <code key={j} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.08)', color: '#14b8a6' }}>{seg.slice(1, -1)}</code>;
            }
            // Bold
            const boldParts = seg.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((bp, k) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={k} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
              }
              return <span key={k}>{bp}</span>;
            });
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'} group animate-slide-up`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isAI ? '' : ''}`}
        style={{ background: isAI ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.06)', border: isAI ? '1px solid rgba(20,184,166,0.25)' : '1px solid rgba(255,255,255,0.08)' }}>
        {isAI ? <Bot size={14} className="text-teal-400" /> : <User size={14} className="text-slate-400" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative`}
          style={{
            background: isAI ? '#0f1117' : 'rgba(20,184,166,0.12)',
            border: isAI ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(20,184,166,0.2)',
            color: isAI ? '#cbd5e1' : '#e2e8f0',
            borderRadius: isAI ? '4px 18px 18px 18px' : '18px 4px 18px 18px'
          }}>
          <div className="prose-dark whitespace-pre-wrap">{renderContent(msg.content)}</div>
        </div>

        {/* Copy button for AI messages */}
        {isAI && (
          <button onClick={handleCopy} className="mt-1.5 flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
            {copied ? <Check size={11} className="text-teal-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.25)' }}>
        <Bot size={14} className="text-teal-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px 18px 18px 18px' }}>
        <div className="flex gap-1 items-center h-4">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: reviewId
        ? "Hi! I'm ReviewAI Assistant. I have context about your code review. Ask me anything — why an issue exists, how to fix it, what alternatives there are, or anything about the code."
        : "Hi! I'm ReviewAI Assistant — your expert AI code reviewer. Ask me anything about security vulnerabilities, performance optimization, best practices, or paste code for instant analysis."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text = input) => {
    const msg = text.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.filter(m => m.role !== 'system').slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await sendMessage(msg, reviewId, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API configuration in Settings and try again.'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      role: 'assistant',
      content: "Conversation cleared. How can I help you with your code?"
    }]);
  };

  return (
    <div className="flex flex-col h-screen" style={{ maxHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0d13' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.25)' }}>
            <Sparkles size={15} className="text-teal-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Assistant</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Llama 3.3 70B via Groq
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reviewId && (
            <Link to={`/review/${reviewId}`} className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors px-3 py-1.5 rounded-lg" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}>
              <GitPullRequest size={12} />
              View Review
            </Link>
          )}
          <button onClick={handleClear} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only when few messages) */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20,184,166,0.3)'; e.currentTarget.style.color = '#14b8a6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="flex gap-2 items-end p-2 rounded-2xl" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about security, performance, bugs, best practices..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none resize-none leading-6 px-2 py-1 placeholder-slate-600"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{ background: input.trim() && !loading ? '#14b8a6' : 'rgba(255,255,255,0.06)', color: input.trim() && !loading ? '#000' : '#64748b' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
