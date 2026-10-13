'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TripItinerary, TripStats, TripStatus } from '@/types/trip';
import { fetchAllTrips, calculateTripStats, saveTrip, deleteTrip } from '@/lib/storage';
import { POPULAR_GETAWAYS } from '@/lib/mock-data';
import StatsCards from '@/components/StatsCards';
import TripCard from '@/components/TripCard';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Compass, 
  MapPin, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const [trips, setTrips] = useState<TripItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'title'>('date');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    const { trips: loaded } = await fetchAllTrips();
    setTrips(loaded);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: TripStatus) => {
    const target = trips.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, status: newStatus };
      await saveTrip(updated);
      setTrips((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleDeleteTrip = async (id: string) => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter & Sort
  const filteredTrips = trips.filter((trip) => {
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (sortBy === 'budget') {
      return (b.budget?.allocated || 0) - (a.budget?.allocated || 0);
    }
    return a.title.localeCompare(b.title);
  });

  const stats = calculateTripStats(trips);

  return (
    <div className="space-y-10">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        {/* Decorative blur glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-sky-300 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AI-Powered Weekend Trip Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Design Your Perfect Weekend Escape in Seconds.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Input your starting point, destination, dates, budget, and travel vibe. Google Gemini AI instantly crafts an optimized, day-by-day travel itinerary with realistic timings, meals, activities, and budget breakdowns.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-900 bg-white hover:bg-sky-50 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Plan New Weekend Trip</span>
            </Link>

            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Saved Trips ({trips.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Summary Cards */}
      <section>
        <StatsCards stats={stats} />
      </section>

      {/* Trips Section Header with Filters */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-sky-500" />
              <span>Your Weekend Itineraries</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your upcoming adventures, past travels, and custom bucket list plans.
            </p>
          </div>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Itinerary</span>
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Trips' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'planned', label: 'Planned' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-sky-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination, title..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="budget">Sort by Budget</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : sortedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
            <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching itineraries found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or generate a new custom weekend getaway itinerary.
            </p>
            <div className="mt-5">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Itinerary</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Popular Inspo Carousel Banner */}
      <section className="rounded-3xl bg-slate-100 dark:bg-slate-800/60 p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>Featured Weekend Escapes</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need inspiration? Pick any curated getaway to jumpstart your personalized itinerary.
            </p>
          </div>
          <Link
            href="/create"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Custom Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_GETAWAYS.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-36 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.destination}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ${item.budgetUsd} est.
                </span>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700"
                >
                  <span>Build This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
