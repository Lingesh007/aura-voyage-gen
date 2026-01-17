import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MURF_API_KEY = Deno.env.get('MURF_API_KEY');
    if (!MURF_API_KEY) {
      console.error("MURF_API_KEY not found in environment variables");
      throw new Error("Murf API key not configured");
    }

    const { text, voiceId = "en-US-natalie" } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating speech for text: "${text.substring(0, 50)}..." with voice: ${voiceId}`);

    // Call Murf API to generate speech
    const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MURF_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceId,
        format: "MP3",
        modelVersion: "GEN2",
        sampleRate: 44100,
        channelType: "MONO",
        encodeAsBase64: true,
      }),
    });

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      console.error(`Murf API error: ${murfResponse.status} - ${errorText}`);
      throw new Error(`Murf API error: ${murfResponse.status}`);
    }

    const murfData = await murfResponse.json();
    console.log(`Speech generated successfully. Audio length: ${murfData.audioLengthInSeconds}s`);

    return new Response(
      JSON.stringify({
        success: true,
        audioFile: murfData.audioFile,
        encodedAudio: murfData.encodedAudio,
        audioLengthInSeconds: murfData.audioLengthInSeconds,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Error in murf-tts function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate speech",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
