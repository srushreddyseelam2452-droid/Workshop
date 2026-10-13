'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & description */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Weekend Getaway Itinerary Builder
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-Powered Smart Travel Planning with Google Gemini & Supabase
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Sparkles className="w-3 h-3" /> Next.js App Router
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3" /> Google Gemini API
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Shield className="w-3 h-3" /> Supabase PostgreSQL
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/create" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              New Trip
            </Link>
            <Link href="/trips" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Saved Trips
            </Link>
            <Link href="/settings" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Settings
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2">
          <p>© 2026 Weekend Getaway Itinerary Builder. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for travellers & students with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
