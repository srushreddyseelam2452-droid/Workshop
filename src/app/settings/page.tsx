'use client';

import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { SAMPLE_TRIPS } from '@/lib/mock-data';
import AuthModal from '@/components/AuthModal';
import { 
  Settings, 
  Key, 
  Database, 
  Shield, 
  User, 
  Check, 
  Copy, 
  RotateCcw, 
  ExternalLink, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  const [copiedSchema, setCopiedSchema] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key') || '';
      setGeminiKey(stored);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUserSession(data.session);
      });
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserSession(session);
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleSaveGeminiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', geminiKey.trim());
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2500);
    }
  };

  const handleTestGeminiKey = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': geminiKey.trim(),
        },
        body: JSON.stringify({
          preferences: {
            origin: 'San Francisco, CA',
            destination: 'Napa Valley, CA',
            startDate: '2026-10-17',
            endDate: '2026-10-18',
            travelers: 1,
            travelerType: 'solo',
            budget: 500,
            currency: 'USD',
            pace: 'moderate',
            interests: ['Sightseeing'],
            accommodation: 'mid-range-hotel',
            transportation: 'car',
          },
          apiKey: geminiKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.isAiGenerated) {
        setAiTestResult('✅ Gemini API connected and verified successfully!');
      } else {
        setAiTestResult(`ℹ️ Status: ${data.message || 'Fallback mode used.'}`);
      }
    } catch (e: any) {
      setAiTestResult(`❌ Connection test error: ${e.message}`);
    } finally {
      setTestingAi(false);
    }
  };

  const handleCopySchema = () => {
    const schemaSql = `-- Supabase PostgreSQL Schema for Weekend Getaway Itinerary Builder
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'planned',
  budget_allocated NUMERIC(10, 2) NOT NULL DEFAULT 0,
  budget_estimated NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  itinerary_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their trips" ON public.trips FOR ALL USING (auth.uid() = user_id);`;

    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleResetSampleTrips = () => {
    if (window.confirm('Reset all saved trips back to default sample getaways?')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('weekend_getaway_trips_v1', JSON.stringify(SAMPLE_TRIPS));
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 2000);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-sky-500" />
          <span>App Settings & Integrations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure Google Gemini AI credentials, verify Supabase PostgreSQL connection, and manage local preferences.
        </p>
      </div>

      {/* Section 1: Google Gemini AI Configuration */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Gemini API Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powers AI itinerary generation, budget optimization, and schedule replanning
              </p>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            <span>Get Free Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Gemini API Key (stored securely in browser session / or server env)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-colors shrink-0"
              >
                {savedKeySuccess ? 'Saved!' : 'Save Key'}
              </button>

              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={testingAi}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 disabled:opacity-50"
              >
                {testingAi ? 'Testing...' : 'Test AI Connection'}
              </button>
            </div>
          </div>

          {aiTestResult && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
              {aiTestResult}
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            * Note: You can also place <code className="text-slate-700 dark:text-slate-300">GEMINI_API_KEY</code> in <code className="text-slate-700 dark:text-slate-300">.env.local</code>. When absent, the application automatically uses high-quality dynamic fallback generation so you can test smoothly!
          </p>
        </div>
      </div>

      {/* Section 2: Supabase Database & Auth */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase & PostgreSQL Database
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent storage, user accounts, and Row Level Security
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            {isSupabaseConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Fallback'}</span>
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            The app is configured to store all itineraries in PostgreSQL via Supabase when <code className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are provided.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{userSession ? 'Supabase Account Logged In' : 'Sign In / Register Supabase User'}</span>
            </button>

            <button
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'SQL Schema Copied!' : 'Copy PostgreSQL Schema'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Data Management & Reset */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Demo & Sample Data Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reload sample weekend getaways or wipe local test trips
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Restore Sample Trips
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Restores Napa Valley, Boston, and Goa pre-configured itineraries.
            </p>
          </div>

          <button
            onClick={handleResetSampleTrips}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetSuccess ? 'Restored!' : 'Restore Samples'}</span>
          </button>
        </div>
      </div>

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          supabase?.auth.getSession().then(({ data }) => setUserSession(data.session));
        }}
      />
    </div>
  );
}
