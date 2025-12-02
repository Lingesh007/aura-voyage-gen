import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { base = 'USD', symbols } = await req.json();
    
    // Using exchangerate-api (free tier)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    let rates = data.rates;
    if (symbols) {
      const symbolList = symbols.split(',');
      rates = Object.fromEntries(
        Object.entries(data.rates).filter(([key]) => symbolList.includes(key))
      );
    }
    
    return new Response(
      JSON.stringify({
        base: data.base,
        date: data.date,
        rates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
