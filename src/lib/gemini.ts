import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripItinerary, TripPreferences } from '@/types/trip';
import { generateDynamicFallbackItinerary } from './mock-data';

function getApiKey(customKey?: string): string | null {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

export async function generateItineraryWithGemini(
  prefs: TripPreferences,
  customApiKey?: string
): Promise<{ itinerary: TripItinerary; isAiGenerated: boolean; message?: string }> {
  const apiKey = getApiKey(customApiKey);

  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY detected. Using dynamic fallback itinerary generator.');
    return {
      itinerary: generateDynamicFallbackItinerary(prefs),
      isAiGenerated: false,
      message: 'Generated using intelligent fallback. To use live Google Gemini AI, add your GEMINI_API_KEY in Settings or .env.local.',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const prompt = `
You are an expert travel planner and local concierge AI specialized in crafting high-efficiency, realistic, and budget-optimized weekend getaways.

Generate a comprehensive weekend travel itinerary based strictly on the following user preferences:
- Origin: ${prefs.origin}
- Destination: ${prefs.destination}
- Dates: ${prefs.startDate} to ${prefs.endDate}
- Travelers: ${prefs.travelers} (${prefs.travelerType})
- Total Allocated Budget: ${prefs.currency} ${prefs.budget}
- Pace: ${prefs.pace}
- Interests: ${prefs.interests.join(', ') || 'General sightseeing, local food, hidden gems'}
- Preferred Accommodation: ${prefs.accommodation}
- Preferred Transportation: ${prefs.transportation}
- Dietary Preferences: ${prefs.dietary || 'None specified'}
- Additional Notes: ${prefs.notes || 'None'}

CRITICAL INSTRUCTIONS:
1. Provide a realistic day-by-day plan with sensible activity order taking geographic proximity into account.
2. For each day, include 3 to 5 distinct activities across morning, midday, afternoon, and evening.
3. Every activity MUST specify: title, description, realistic location, duration, category (one of: sightseeing, food, outdoor, culture, relaxation, nightlife, transit, shopping), estimatedCost (in ${prefs.currency}), and practical insider tips.
4. Calculate a realistic category-wise budget breakdown (transportation, accommodation, foodAndDining, activitiesAndAttractions, miscellaneous).
5. Ensure the estimated total matches or respects the user's allocated budget of ${prefs.currency} ${prefs.budget}.
6. Include destination-specific packing list and expected weather advice.
7. Return strictly valid JSON conforming to the following structure:

{
  "title": "Compelling Title for the Trip",
  "summary": "2-3 sentences summarizing the weekend getaway experience",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "budget": {
    "allocated": ${prefs.budget},
    "breakdown": {
      "transportation": number,
      "accommodation": number,
      "foodAndDining": number,
      "activitiesAndAttractions": number,
      "miscellaneous": number,
      "totalEstimated": number,
      "currency": "${prefs.currency}",
      "isUnderBudget": boolean,
      "savingsOrOverrun": number,
      "costPerPerson": number
    }
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Day 1 Title",
      "theme": "Theme of the day",
      "dayEstimatedCost": number,
      "activities": [
        {
          "id": "act-1-1",
          "timeSlot": "morning",
          "time": "09:00 AM",
          "title": "Activity Title",
          "description": "Engaging description",
          "location": "Specific place name or district",
          "duration": "2 hours",
          "category": "sightseeing",
          "estimatedCost": number,
          "tips": "Pro-tip for visitors",
          "isCompleted": false
        }
      ]
    }
  ],
  "travelTips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
  "packingList": [
    {
      "category": "Clothing",
      "items": ["Item 1", "Item 2"]
    },
    {
      "category": "Essentials",
      "items": ["Item 3", "Item 4"]
    }
  ],
  "weatherForecast": {
    "summary": "Weather conditions summary",
    "tempRange": "Expected temperature range",
    "recommendation": "What to wear or carry"
  }
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const fullItinerary: TripItinerary = {
      id: `trip-${Date.now()}`,
      userId: 'demo-user',
      title: parsed.title || `Weekend in ${prefs.destination}`,
      destination: prefs.destination,
      origin: prefs.origin,
      startDate: prefs.startDate,
      endDate: prefs.endDate,
      durationDays: parsed.days ? parsed.days.length : 2,
      status: 'planned',
      heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      summary: parsed.summary || `A tailored trip to ${prefs.destination}.`,
      highlights: parsed.highlights || [],
      budget: parsed.budget || {
        allocated: prefs.budget,
        breakdown: {
          transportation: Math.round(prefs.budget * 0.2),
          accommodation: Math.round(prefs.budget * 0.4),
          foodAndDining: Math.round(prefs.budget * 0.25),
          activitiesAndAttractions: Math.round(prefs.budget * 0.1),
          miscellaneous: Math.round(prefs.budget * 0.05),
          totalEstimated: prefs.budget,
          currency: prefs.currency,
          isUnderBudget: true,
          savingsOrOverrun: 0,
          costPerPerson: Math.round(prefs.budget / prefs.travelers),
        },
      },
      days: parsed.days || [],
      travelTips: parsed.travelTips || [],
      packingList: parsed.packingList || [],
      weatherForecast: parsed.weatherForecast || {
        summary: 'Pleasant travel weather',
        tempRange: '18°C - 24°C',
        recommendation: 'Pack light layers.',
      },
      preferences: prefs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      itinerary: fullItinerary,
      isAiGenerated: true,
      message: 'Successfully generated with Google Gemini 1.5 Flash!',
    };
  } catch (error: any) {
    console.error('[Gemini Generation Error]:', error);
    // Graceful fallback to dynamic generator
    const fallback = generateDynamicFallbackItinerary(prefs);
    return {
      itinerary: fallback,
      isAiGenerated: false,
      message: `Gemini API request failed (${error?.message || 'Check key'}). Provided dynamic fallback itinerary.`,
    };
  }
}

export async function replanItineraryWithGemini(
  currentItinerary: TripItinerary,
  instructions: string,
  customApiKey?: string
): Promise<{ itinerary: TripItinerary; isAiGenerated: boolean; message?: string }> {
  const apiKey = getApiKey(customApiKey);

  if (!apiKey) {
    // Intelligent local modification fallback
    const modified = { ...currentItinerary };
    modified.updatedAt = new Date().toISOString();
    modified.summary = `${modified.summary} (Modified: ${instructions})`;
    return {
      itinerary: modified,
      isAiGenerated: false,
      message: 'Replanned in local mode. Connect Gemini API key for deep AI replanning.',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const prompt = `
You are an expert travel replanner. A user has an existing weekend getaway itinerary and wants to adjust or replan it according to specific instructions.

CURRENT ITINERARY DATA:
${JSON.stringify({
  title: currentItinerary.title,
  destination: currentItinerary.destination,
  budget: currentItinerary.budget,
  days: currentItinerary.days,
  preferences: currentItinerary.preferences,
})}

USER REPLANNING INSTRUCTION:
"${instructions}"

INSTRUCTIONS:
1. Modify the itinerary activities, timings, suggestions, or budget breakdown to fulfill the user's instructions (e.g. make it cheaper, replace activities, change pace, add dietary spots, etc.).
2. Keep the overall duration and days consistent unless requested otherwise.
3. Recalculate the budget breakdown and day costs to reflect the new activities.
4. Return the updated JSON with: title, summary, highlights, budget, days, travelTips, packingList, weatherForecast conforming to the existing structure.
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    const updatedItinerary: TripItinerary = {
      ...currentItinerary,
      title: parsed.title || currentItinerary.title,
      summary: parsed.summary || currentItinerary.summary,
      highlights: parsed.highlights || currentItinerary.highlights,
      budget: parsed.budget || currentItinerary.budget,
      days: parsed.days || currentItinerary.days,
      travelTips: parsed.travelTips || currentItinerary.travelTips,
      packingList: parsed.packingList || currentItinerary.packingList,
      weatherForecast: parsed.weatherForecast || currentItinerary.weatherForecast,
      updatedAt: new Date().toISOString(),
    };

    return {
      itinerary: updatedItinerary,
      isAiGenerated: true,
      message: 'Itinerary successfully replanned with Google Gemini AI!',
    };
  } catch (error: any) {
    console.error('[Gemini Replan Error]:', error);
    return {
      itinerary: currentItinerary,
      isAiGenerated: false,
      message: `Replan error: ${error?.message || 'Check Gemini configuration.'}`,
    };
  }
}
