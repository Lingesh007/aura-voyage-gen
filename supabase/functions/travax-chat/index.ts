import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Analyze search patterns to understand user preferences
const analyzeSearchPatterns = (searchHistory: any[]): string => {
  if (!searchHistory || searchHistory.length === 0) {
    return "No previous search history available.";
  }

  const patterns: string[] = [];
  const destinations = new Set<string>();
  const categories = new Map<string, number>();
  let totalSearches = 0;

  searchHistory.forEach((item) => {
    totalSearches += item.search_count || 1;
    
    // Track categories
    if (item.category) {
      categories.set(item.category, (categories.get(item.category) || 0) + (item.search_count || 1));
    }

    // Extract destinations from queries
    const destMatch = item.query.match(/(?:to|in|visit|explore)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi);
    if (destMatch) {
      destMatch.forEach((match: string) => {
        const dest = match.replace(/(?:to|in|visit|explore)\s+/i, '').trim();
        destinations.add(dest);
      });
    }

    // Detect frequent queries
    if (item.search_count >= 3) {
      patterns.push(`Frequently searches: "${item.query}" (${item.search_count} times)`);
    }
  });

  // Build preference summary
  const summary: string[] = [];
  
  if (destinations.size > 0) {
    summary.push(`Interested destinations: ${Array.from(destinations).slice(0, 5).join(', ')}`);
  }

  if (categories.size > 0) {
    const sortedCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    summary.push(`Preferred categories: ${sortedCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}`);
  }

  if (patterns.length > 0) {
    summary.push(`Search patterns: ${patterns.slice(0, 3).join('; ')}`);
  }

  summary.push(`Total search interactions: ${totalSearches}`);

  return summary.join('\n');
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

    // Fetch user's search history for personalization
    let searchPatternContext = "";
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: searchHistory } = await supabase
          .from('search_history')
          .select('query, category, search_count, is_saved')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20);
        
        searchPatternContext = analyzeSearchPatterns(searchHistory || []);
      }
    }

    console.log('Calling Lovable AI with personalized context');

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

USER BEHAVIOR & PREFERENCES (use this to personalize recommendations):
${searchPatternContext}

Your capabilities:
- Help plan business trips with detailed itineraries
- Find and recommend flights, hotels, visas, and activities
- Optimize travel budgets while maintaining quality
- Provide real-time travel advice and recommendations
- Assist with visa documentation and requirements
- Suggest networking opportunities and business centers

PERSONALIZATION GUIDELINES:
- Use the user's search history to anticipate their needs
- Prioritize destinations and categories they frequently search for
- If they repeatedly search for a destination, proactively offer deeper insights
- Reference their past interests naturally ("Since you've been exploring Dubai...")
- Suggest similar destinations based on their patterns

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
