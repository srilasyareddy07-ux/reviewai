import React, { useEffect, useState } from 'react';
import { User, Key, Github, Bell, Palette, Save, Eye, EyeOff, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0d13' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.1)' }}>
          <Icon size={14} className="text-teal-400" />
        </div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-white">{label}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0`}
        style={{ background: checked ? '#14b8a6' : 'rgba(255,255,255,0.1)' }}>
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200" style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

function SecretInput({ value, onChange, placeholder, label, helpLink, helpText }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-white">{label}</label>
        {helpLink && (
          <a href={helpLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
            {helpText || 'Get key'} <ExternalLink size={10} />
          </a>
        )}
      </div>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pr-10"
        />
        <button onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'cpp', 'rust', 'ruby'];

export default function SettingsPage() {
  const { user, dbUser } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    autoAnalyze: false,
    githubWebhook: false,
    defaultLanguage: 'javascript',
    groqApiKey: '',
    githubToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(r => { if (r.data.settings) setSettings(s => ({ ...s, ...r.data.settings })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  if (loading) return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      {Array(3).fill(0).map((_, i) => <div key={i} className="h-48 skeleton rounded-xl" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your preferences and API keys</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Section title="Profile" icon={User}>
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=14b8a6&color=000&size=64`}
              alt="avatar"
              className="w-14 h-14 rounded-xl"
            />
            <div>
              <div className="text-base font-semibold text-white">{user?.displayName || 'User'}</div>
              <div className="text-sm text-slate-400">{user?.email}</div>
              <div className="text-xs text-slate-600 mt-1">Signed in with Google</div>
            </div>
          </div>
        </Section>

        {/* AI Configuration */}
        <Section title="AI Configuration" icon={Key}>
          <SecretInput
            label="Groq API Key"
            value={settings.groqApiKey || ''}
            onChange={v => set('groqApiKey', v)}
            placeholder="gsk_..."
            helpLink="https://console.groq.com/keys"
            helpText="Get Groq API key"
          />
          <div className="flex items-start gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
            <AlertCircle size={13} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-400">Your Groq API key is used for AI analysis. If not provided, the server's default key is used. Keys are encrypted and never exposed.</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={e => set('defaultLanguage', e.target.value)}
              className="input"
            >
              {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#161b24] capitalize">{l}</option>)}
            </select>
          </div>
        </Section>

        {/* GitHub Integration */}
        <Section title="GitHub Integration" icon={Github}>
          <SecretInput
            label="GitHub Personal Access Token"
            value={settings.githubToken || ''}
            onChange={v => set('githubToken', v)}
            placeholder="ghp_..."
            helpLink="https://github.com/settings/tokens"
            helpText="Generate token"
          />
          <div className="flex items-start gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <AlertCircle size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-500">
              Required for private repositories and higher API rate limits. Needs <code className="text-slate-400">repo</code> scope for private repos, or no scope for public repos.
            </span>
          </div>
          <ToggleSwitch
            checked={settings.githubWebhook}
            onChange={v => set('githubWebhook', v)}
            label="Auto-analyze new PRs"
            desc="Automatically analyze PRs when opened (requires webhook setup)"
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon={Palette}>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={v => set('emailNotifications', v)}
            label="Email notifications"
            desc="Receive email when analysis is complete"
          />
          <ToggleSwitch
            checked={settings.autoAnalyze}
            onChange={v => set('autoAnalyze', v)}
            label="Auto-analyze on paste"
            desc="Start analysis immediately when you paste code"
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={v => set('emailNotifications', v)}
            label="Security alerts"
            desc="Get notified about critical security vulnerabilities"
          />
          <ToggleSwitch
            checked={false}
            onChange={() => toast('Coming soon!')}
            label="Weekly digest"
            desc="Weekly summary of your code quality trends"
          />
        </Section>

        {/* Danger zone */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#0f1117', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)' }}>
            <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white">Delete all reviews</div>
                <div className="text-xs text-slate-500 mt-0.5">Permanently delete all your review history and data</div>
              </div>
              <button onClick={() => toast.error('This action cannot be undone. Contact support.')} className="px-4 py-2 rounded-lg text-xs font-medium text-red-400 transition-all"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save bottom bar */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50 px-6">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
