import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Weekend Getaway Itinerary Builder | AI Travel Planner',
  description:
    'AI-powered weekend getaway travel planner with Google Gemini, Supabase, customized budgets, day-by-day schedules, and PDF export.',
  keywords: [
    'weekend getaway',
    'itinerary builder',
    'travel planner',
    'Google Gemini AI',
    'Supabase',
    'Next.js',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white">
        <Suspense fallback={<div className="h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
