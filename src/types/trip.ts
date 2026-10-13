export type TravelerType = 'solo' | 'couple' | 'friends' | 'family';
export type TripPace = 'relaxed' | 'moderate' | 'packed';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
export type TripStatus = 'planned' | 'upcoming' | 'completed' | 'cancelled';
export type AccommodationType = 'budget' | 'cozy-airbnb' | 'mid-range-hotel' | 'luxury-resort' | 'camping';
export type TransportationMode = 'car' | 'train' | 'flight' | 'public-transit';
export type ActivityCategory = 'sightseeing' | 'food' | 'outdoor' | 'culture' | 'relaxation' | 'nightlife' | 'transit' | 'shopping';

export interface TripPreferences {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  travelerType: TravelerType;
  budget: number;
  currency: CurrencyCode;
  pace: TripPace;
  interests: string[];
  accommodation: AccommodationType;
  transportation: TransportationMode;
  dietary?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  time: string; // e.g. "09:00 AM"
  title: string;
  description: string;
  location: string;
  duration: string;
  category: ActivityCategory;
  estimatedCost: number;
  tips?: string;
  isCompleted?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  activities: Activity[];
  dayEstimatedCost: number;
}

export interface BudgetBreakdown {
  transportation: number;
  accommodation: number;
  foodAndDining: number;
  activitiesAndAttractions: number;
  miscellaneous: number;
  totalEstimated: number;
  currency: CurrencyCode;
  isUnderBudget: boolean;
  savingsOrOverrun: number;
  costPerPerson: number;
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface WeatherForecast {
  summary: string;
  tempRange: string;
  recommendation: string;
}

export interface TripItinerary {
  id: string;
  userId?: string;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: TripStatus;
  heroImage?: string;
  summary: string;
  highlights: string[];
  budget: {
    allocated: number;
    breakdown: BudgetBreakdown;
  };
  days: DayPlan[];
  travelTips: string[];
  packingList: PackingCategory[];
  weatherForecast: WeatherForecast;
  preferences: TripPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface TripStats {
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  plannedTrips: number;
  cancelledTrips: number;
  totalEstimatedSpend: number;
  currency: CurrencyCode;
}
