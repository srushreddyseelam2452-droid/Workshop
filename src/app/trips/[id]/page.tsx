'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TripItinerary, TripStatus } from '@/types/trip';
import { getTripById, saveTrip, deleteTrip } from '@/lib/storage';
import { exportItineraryToPDF } from '@/lib/pdf-export';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import BudgetBreakdownView from '@/components/BudgetBreakdownView';
import PackingListView from '@/components/PackingListView';
import AIReplannerModal from '@/components/AIReplannerModal';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Wand2, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Share2,
  DollarSign,
  Compass,
  Check
} from 'lucide-react';

function TripDetailContent() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'budget' | 'packing'>('timeline');
  const [isReplannerOpen, setIsReplannerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (tripId) {
      loadTrip(tripId);
    }
  }, [tripId]);

  const loadTrip = async (id: string) => {
    setLoading(true);
    const data = await getTripById(id);
    setTrip(data);
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: TripStatus) => {
    if (!trip) return;
    const updated = { ...trip, status: newStatus };
    await saveTrip(updated);
    setTrip(updated);
    showSavedNotification();
  };

  const handleActivityToggle = async (dayNumber: number, activityId: string, completed: boolean) => {
    if (!trip) return;
    const updatedDays = trip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === activityId ? { ...act, isCompleted: completed } : act
          ),
        };
      }
      return day;
    });

    const updated = { ...trip, days: updatedDays };
    await saveTrip(updated);
    setTrip(updated);
  };

  const handleTripUpdated = async (updatedTrip: TripItinerary) => {
    await saveTrip(updatedTrip);
    setTrip(updatedTrip);
    showSavedNotification();
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (window.confirm(`Are you sure you want to permanently delete "${trip.title}"?`)) {
      await deleteTrip(trip.id);
      router.push('/trips');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const showSavedNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-12 w-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trip Not Found</h2>
        <p className="text-xs text-slate-500">The requested itinerary could not be found or has been deleted.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const currency = trip.budget.breakdown.currency || 'USD';
  const totalCost = trip.budget.breakdown.totalEstimated || 0;
  const allocated = trip.budget.allocated || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Itinerary changes saved!</span>
        </div>
      )}

      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReplannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Replan</span>
          </button>

          <button
            onClick={() => exportItineraryToPDF(trip)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handleDelete}
            title="Delete Trip"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 border border-transparent hover:border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={trip.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top floating metadata */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Status Selector */}
              <select
                value={trip.status}
                onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white cursor-pointer outline-none capitalize"
              >
                <option value="planned" className="bg-slate-900 text-white">Planned</option>
                <option value="upcoming" className="bg-slate-900 text-white">Upcoming</option>
                <option value="completed" className="bg-slate-900 text-white">Completed</option>
                <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
              </select>

              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 text-sky-300">
                {trip.durationDays} Days Itinerary
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gemini AI Generated</span>
            </span>
          </div>

          {/* Bottom Title & Meta */}
          <div className="absolute bottom-5 left-5 right-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <MapPin className="w-4 h-4" />
              <span>{trip.origin} &rarr; {trip.destination}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>{trip.startDate} - {trip.endDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span>{trip.preferences?.travelers || 1} Travelers ({trip.preferences?.travelerType || 'couple'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-sky-400" />
                <span>
                  Budget: {currency} {totalCost.toLocaleString()} / {currency} {allocated.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="p-5 sm:p-6 bg-slate-950/90 border-t border-slate-800 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {trip.summary}
          </p>

          {/* Highlights */}
          {trip.highlights && trip.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {trip.highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-sky-200"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'timeline', label: 'Day-by-Day Schedule', icon: Clock },
          { id: 'budget', label: 'Budget Breakdown', icon: DollarSign },
          { id: 'packing', label: 'Packing & Local Weather', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                isActive
                  ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div>
        {activeTab === 'timeline' && (
          <ItineraryTimeline
            trip={trip}
            onActivityToggle={handleActivityToggle}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetBreakdownView
            trip={trip}
            onOptimizeClick={() => setIsReplannerOpen(true)}
          />
        )}

        {activeTab === 'packing' && (
          <PackingListView trip={trip} />
        )}
      </div>

      {/* AI Replanner Modal */}
      <AIReplannerModal
        trip={trip}
        isOpen={isReplannerOpen}
        onClose={() => setIsReplannerOpen(false)}
        onTripUpdated={handleTripUpdated}
      />
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-12 w-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      }
    >
      <TripDetailContent />
    </React.Suspense>
  );
}
