'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TripPreferences, 
  TravelerType, 
  TripPace, 
  CurrencyCode, 
  AccommodationType, 
  TransportationMode 
} from '@/types/trip';
import { saveTrip } from '@/lib/storage';
import { POPULAR_GETAWAYS } from '@/lib/mock-data';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Compass, 
  Hotel, 
  Car, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Plane,
  HeartHandshake
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Local Sightseeing',
  'Food & Culinary',
  'Wine & Craft Beer',
  'Nature & Hiking',
  'Beaches & Coastline',
  'History & Heritage',
  'Museums & Galleries',
  'Nightlife & Bars',
  'Wellness & Spa',
  'Photography',
  'Shopping & Boutiques',
  'Adventure Sports',
];

export default function TripForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<TripPreferences>({
    origin: 'San Francisco, CA',
    destination: 'Napa Valley, CA',
    startDate: '2026-10-17',
    endDate: '2026-10-18',
    travelers: 2,
    travelerType: 'couple',
    budget: 900,
    currency: 'USD',
    pace: 'moderate',
    interests: ['Food & Culinary', 'Wine & Craft Beer', 'Local Sightseeing'],
    accommodation: 'cozy-airbnb',
    transportation: 'car',
    dietary: 'No restrictions',
    notes: '',
  });

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);

    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);

    setFormData((prev) => ({
      ...prev,
      startDate: nextSaturday.toISOString().split('T')[0],
      endDate: nextSunday.toISOString().split('T')[0],
    }));
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingSteps = [
    'Analyzing travel preferences & budget parameters...',
    'Consulting Gemini AI travel models & route topologies...',
    'Curating handpicked local dining & activity stops...',
    'Optimizing schedule for geographic proximity & budget balance...',
    'Finalizing personalized weekend getaway itinerary...',
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleQuickSelectGetaway = (getaway: typeof POPULAR_GETAWAYS[0]) => {
    setFormData((prev) => ({
      ...prev,
      origin: getaway.origin,
      destination: getaway.destination,
      budget: getaway.budgetUsd,
      interests: getaway.tags,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!formData.origin.trim()) {
      setErrorMessage('Please enter your starting origin location.');
      return;
    }
    if (!formData.destination.trim()) {
      setErrorMessage('Please enter your destination.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setErrorMessage('Please choose both start and end travel dates.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMessage('End date cannot be earlier than start date.');
      return;
    }
    if (formData.budget < 50) {
      setErrorMessage('Please enter a realistic weekend budget (minimum 50).');
      return;
    }

    setIsSubmitting(true);
    setLoadingStep(0);

    // Simulate animated progress steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': storedKey,
        },
        body: JSON.stringify({
          preferences: formData,
          apiKey: storedKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate itinerary');
      }

      // Persist the trip
      await saveTrip(result.itinerary);

      clearInterval(interval);
      // Navigate to detail page
      router.push(`/trips/${result.itinerary.id}`);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An error occurred while generating your trip.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Getaway Presets Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Inspo: Popular Weekend Getaway Templates
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {POPULAR_GETAWAYS.map((getaway, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSelectGetaway(getaway)}
              disabled={isSubmitting}
              className="group p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left hover:border-sky-500 hover:shadow-sm transition-all"
            >
              <div className="h-16 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                <img
                  src={getaway.image}
                  alt={getaway.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {getaway.destination}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ${getaway.budgetUsd} est.
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Generator Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white dark:bg-slate-850 p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700/80 shadow-xl space-y-6"
      >
        <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-500" />
            <span>Customize Your Weekend Getaway</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in your trip details and let Google Gemini AI build your personalized hour-by-hour itinerary.
          </p>
        </div>

        {/* Section 1: Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Starting From (Origin)</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              placeholder="e.g. San Francisco, CA or London"
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Napa Valley, CA or Cotswolds"
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Section 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>End Date</span>
            </label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Section 3: Budget & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Estimated Budget</span>
            </label>
            <input
              type="number"
              min={50}
              step={25}
              required
              disabled={isSubmitting}
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Currency
            </label>
            <select
              value={formData.currency}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as CurrencyCode })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
        </div>

        {/* Section 4: Travelers & Group Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Number of Travelers</span>
            </label>
            <input
              type="number"
              min={1}
              max={20}
              required
              disabled={isSubmitting}
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: Number(e.target.value) })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Traveler Group Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['solo', 'couple', 'friends', 'family'] as TravelerType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setFormData({ ...formData, travelerType: type })}
                  className={`py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    formData.travelerType === type
                      ? 'bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Pace, Lodging & Transport */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Trip Pace
            </label>
            <select
              value={formData.pace}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, pace: e.target.value as TripPace })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="relaxed">Relaxed (Sleep in, leisurely stops)</option>
              <option value="moderate">Moderate (Balanced mix)</option>
              <option value="packed">Packed / Action-Packed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Accommodation Style
            </label>
            <select
              value={formData.accommodation}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, accommodation: e.target.value as AccommodationType })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="budget">Budget / Hostel</option>
              <option value="cozy-airbnb">Cozy Airbnb / Rental</option>
              <option value="mid-range-hotel">Mid-Range Hotel</option>
              <option value="luxury-resort">Luxury Resort / Boutique</option>
              <option value="camping">Camping / Glamping</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Primary Transit Mode
            </label>
            <select
              value={formData.transportation}
              disabled={isSubmitting}
              onChange={(e) => setFormData({ ...formData, transportation: e.target.value as TransportationMode })}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="car">Road Trip / Car</option>
              <option value="train">Train / Rail</option>
              <option value="flight">Flight</option>
              <option value="public-transit">Public Transit / Bus</option>
            </select>
          </div>
        </div>

        {/* Section 6: Interests Multi-Select */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-2">
            Interests & Trip Vibe (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleInterestToggle(interest)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 7: Notes & Dietary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Dietary Restrictions (Optional)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={formData.dietary}
              onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
              placeholder="e.g. Vegetarian, Vegan, Halal, Gluten-Free..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1.5">
              Special Requests or Notes (Optional)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Celebrating an anniversary, pet-friendly places..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Animated Loading State while generating */}
        {isSubmitting && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-sky-200 dark:border-slate-700 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Creating Your Personalized Itinerary
                </p>
                <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                  {loadingSteps[loadingStep]}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full transition-all duration-700"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 hover:from-sky-600 hover:to-indigo-700 shadow-lg shadow-sky-500/25 disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isSubmitting ? 'Generating Itinerary...' : 'Generate Itinerary with AI'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
