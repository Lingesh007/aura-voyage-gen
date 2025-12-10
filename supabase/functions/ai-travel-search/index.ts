import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  searchType: 'flights' | 'hotels' | 'visas' | 'activities';
  query: string;
  departure?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  budget?: string;
  preferences?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const searchRequest: SearchRequest = await req.json();
    
    if (!lovableApiKey) {
      throw new Error('Lovable AI key not configured');
    }

    console.log('AI Travel Search request:', searchRequest);

    // Build contextual prompt based on search type
    const systemPrompt = buildSystemPrompt(searchRequest.searchType);
    const userPrompt = buildUserPrompt(searchRequest);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_travel_options",
              description: "Provide travel options based on search criteria",
              parameters: {
                type: "object",
                properties: {
                  options: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Hotel/Flight/Activity name" },
                        destination: { type: "string" },
                        departure: { type: "string", description: "For flights: departure city" },
                        arrival: { type: "string", description: "For flights: arrival city" },
                        departureTime: { type: "string", description: "For flights: departure time" },
                        arrivalTime: { type: "string", description: "For flights: arrival time" },
                        duration: { type: "string" },
                        price: { type: "number" },
                        currency: { type: "string" },
                        rating: { type: "number", description: "For hotels: star rating 1-5" },
                        class: { type: "string", description: "For flights: cabin class" },
                        flightCode: { type: "string", description: "For flights: flight number" },
                        airline: { type: "string", description: "For flights: airline name" },
                        layover: { type: "string", description: "For flights: layover info" },
                        pointsEarned: { type: "number", description: "Loyalty points earned" },
                        location: { type: "string", description: "For hotels: area/neighborhood" },
                        amenities: { type: "string", description: "For hotels: key amenities" },
                        roomType: { type: "string", description: "For hotels: room category" },
                        pricePerNight: { type: "number", description: "For hotels: nightly rate" },
                        processingTime: { type: "string", description: "For visas: processing time" },
                        validity: { type: "string", description: "For visas: visa validity" },
                        visaType: { type: "string", description: "For visas: entry type" },
                        participants: { type: "string", description: "For activities: group size" },
                        includes: { type: "string", description: "For activities: what's included" },
                        highlights: { type: "string", description: "Key selling points" },
                        deal: { type: "string", description: "Any special offers or discounts" }
                      },
                      required: ["name", "destination", "price"]
                    }
                  },
                  summary: { type: "string", description: "Brief summary of recommendations" },
                  tips: { type: "string", description: "Travel tips for this search" }
                },
                required: ["options", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_travel_options" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ 
          success: true,
          data: result.options,
          summary: result.summary,
          tips: result.tips,
          searchType: searchRequest.searchType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback if tool call didn't work
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to generate recommendations',
        data: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-travel-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSystemPrompt(searchType: string): string {
  const basePrompt = `You are Travax AI, a luxury B2B and SME travel specialist. Generate UNIQUE, REALISTIC travel options for each request. 

CRITICAL RULES:
1. Generate 3-5 varied options with different price points
2. Use REAL airline names, hotel brands, and destinations
3. Prices should be realistic and in USD
4. Each response must be unique - vary names, prices, times
5. Include current/seasonal deals when relevant
6. Focus on business travel needs: WiFi, meeting rooms, central locations`;

  const typePrompts: Record<string, string> = {
    flights: `${basePrompt}
    
For FLIGHTS include:
- Real airline codes and flight numbers (e.g., BA178, EK215, UA123)
- Accurate flight durations for the routes
- Mix of direct and connecting flights
- Business and economy class options
- Loyalty points estimates (roughly 2x the ticket price)
- Departure/arrival times in realistic schedules`,

    hotels: `${basePrompt}
    
For HOTELS include:
- Real hotel brand names (Marriott, Hilton, IHG, Accor, boutique hotels)
- Star ratings (3-5 stars)
- Specific neighborhood/location details
- Business amenities: WiFi, business center, meeting rooms
- Price per night that's realistic for the destination
- Room types: Standard, Deluxe, Suite
- Current deals: early booking discounts, corporate rates`,

    visas: `${basePrompt}
    
For VISAS include:
- Accurate visa types for the destination country
- Realistic processing times
- Current visa fees
- Entry type (single/multiple)
- Validity periods
- Required documents summary
- Expedited processing options`,

    activities: `${basePrompt}
    
For ACTIVITIES include:
- Popular business-appropriate activities
- Team building options
- Cultural experiences
- Networking opportunities (business lounges, clubs)
- Duration and group sizes
- What's included (transport, meals, guide)
- Cancellation policies`
  };

  return typePrompts[searchType] || basePrompt;
}

function buildUserPrompt(req: SearchRequest): string {
  const parts: string[] = [];
  
  parts.push(`Search for ${req.searchType}:`);
  
  if (req.query) {
    parts.push(`User query: "${req.query}"`);
  }
  
  if (req.departure) {
    parts.push(`From: ${req.departure}`);
  }
  
  if (req.destination) {
    parts.push(`To/Destination: ${req.destination}`);
  }
  
  if (req.departureDate) {
    parts.push(`Departure: ${req.departureDate}`);
  }
  
  if (req.returnDate) {
    parts.push(`Return: ${req.returnDate}`);
  }
  
  if (req.checkInDate) {
    parts.push(`Check-in: ${req.checkInDate}`);
  }
  
  if (req.checkOutDate) {
    parts.push(`Check-out: ${req.checkOutDate}`);
  }
  
  if (req.adults) {
    parts.push(`Adults: ${req.adults}`);
  }
  
  if (req.children) {
    parts.push(`Children: ${req.children}`);
  }
  
  if (req.rooms) {
    parts.push(`Rooms: ${req.rooms}`);
  }
  
  if (req.budget) {
    parts.push(`Budget: ${req.budget}`);
  }
  
  if (req.preferences?.length) {
    parts.push(`Preferences: ${req.preferences.join(', ')}`);
  }
  
  parts.push(`\nGenerate unique, realistic options with current pricing. Each option should be distinct.`);
  
  return parts.join('\n');
}
