import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_URL = "https://leejy2002.app.n8n.cloud/webhook-test/webhook-listener";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, category, source, userAgent } = await req.json();

    console.log(`[search-webhook] Received search: "${query}" | category: ${category} | source: ${source}`);

    // Get user ID if authenticated
    let userId = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // Forward to n8n webhook
    const webhookPayload = {
      query,
      category: category || "general",
      userId,
      timestamp: new Date().toISOString(),
      source: source || "unknown",
      userAgent: userAgent || null,
    };

    console.log(`[search-webhook] Forwarding to n8n:`, JSON.stringify(webhookPayload));

    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await webhookResponse.text();
    console.log(`[search-webhook] n8n response status: ${webhookResponse.status}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Search forwarded to webhook",
        webhookStatus: webhookResponse.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[search-webhook] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
