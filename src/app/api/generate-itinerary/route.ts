import { NextRequest, NextResponse } from 'next/server';
import { generateItineraryWithGemini } from '@/lib/gemini';
import { TripPreferences } from '@/types/trip';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { preferences, apiKey } = body as { preferences: TripPreferences; apiKey?: string };

    if (!preferences) {
      return NextResponse.json(
        { error: 'Missing trip preferences' },
        { status: 400 }
      );
    }

    if (!preferences.destination || !preferences.origin) {
      return NextResponse.json(
        { error: 'Origin and Destination are required' },
        { status: 400 }
      );
    }

    if (!preferences.startDate || !preferences.endDate) {
      return NextResponse.json(
        { error: 'Start date and End date are required' },
        { status: 400 }
      );
    }

    // Header override if passed
    const headerApiKey = req.headers.get('x-gemini-key') || apiKey;

    const result = await generateItineraryWithGemini(preferences, headerApiKey);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API Error in /api/generate-itinerary:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
