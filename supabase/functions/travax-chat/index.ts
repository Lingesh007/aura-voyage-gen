import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName } = await req.json();

    if (!lovableApiKey) {
      throw new Error('Lovable AI key not configured');
    }

    console.log('Calling Lovable AI with messages:', messages);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are Travax AI, a luxury business travel assistant specializing in B2B and SME travel.${userName ? ` The user's name is ${userName}.` : ''}

Your capabilities:
- Help plan business trips with detailed itineraries
- Find and recommend flights, hotels, visas, and activities
- Optimize travel budgets while maintaining quality
- Provide real-time travel advice and recommendations
- Assist with visa documentation and requirements
- Suggest networking opportunities and business centers

CRITICAL RESPONSE GUIDELINES:
- Be PRECISE and DIRECT - answer exactly what is asked
- Provide SPECIFIC details: exact prices, flight numbers, hotel names, addresses
- Structure responses clearly with headings and bullet points
- Include actionable information (booking links, contact details)
- Keep responses concise but comprehensive (3-5 key points max)
- Use concrete examples rather than general advice
- When suggesting options, limit to 2-3 best choices with clear rationale

TONE: Professional, efficient, and personalized. Prioritize clarity over verbosity.

FORMAT GUIDELINES:
- Use bullet points for multiple items
- Bold important information (prices, names, times)
- Provide specific numbers and dates
- End with a clear next action or question

Always mention that exact bookings can be made through the "Book" button below.`
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please contact support.' }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in travax-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
