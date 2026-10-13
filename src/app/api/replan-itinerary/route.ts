import { NextRequest, NextResponse } from 'next/server';
import { replanItineraryWithGemini } from '@/lib/gemini';
import { TripItinerary } from '@/types/trip';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itinerary, instructions, apiKey } = body as {
      itinerary: TripItinerary;
      instructions: string;
      apiKey?: string;
    };

    if (!itinerary || !instructions) {
      return NextResponse.json(
        { error: 'Both itinerary and instructions are required for replanning' },
        { status: 400 }
      );
    }

    const headerApiKey = req.headers.get('x-gemini-key') || apiKey;
    const result = await replanItineraryWithGemini(itinerary, instructions, headerApiKey);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API Error in /api/replan-itinerary:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to replan itinerary' },
      { status: 500 }
    );
  }
}
