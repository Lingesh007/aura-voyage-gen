import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a receipt OCR processor. Extract structured data from receipt images. Return ONLY a JSON object with these fields:
- merchant_name: string (store/vendor name)
- amount: number (total amount)
- currency: string (3-letter code, default USD)
- date: string (YYYY-MM-DD format)
- category: string (one of: flights, hotels, meals, transport, communication, entertainment, office_supplies, other)
- items: array of {description: string, amount: number}
- tax: number or null
- tip: number or null

If you cannot extract a field, use null. Always return valid JSON.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all data from this receipt image.' },
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_receipt_data',
              description: 'Extract structured receipt data from an image',
              parameters: {
                type: 'object',
                properties: {
                  merchant_name: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  date: { type: 'string' },
                  category: { type: 'string', enum: ['flights', 'hotels', 'meals', 'transport', 'communication', 'entertainment', 'office_supplies', 'other'] },
                  items: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, amount: { type: 'number' } }, required: ['description', 'amount'] } },
                  tax: { type: 'number', nullable: true },
                  tip: { type: 'number', nullable: true },
                },
                required: ['merchant_name', 'amount', 'currency', 'date', 'category'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_receipt_data' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let receiptData;
    if (toolCall?.function?.arguments) {
      receiptData = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      receiptData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    return new Response(JSON.stringify({ receiptData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Receipt OCR error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
