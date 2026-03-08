import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Fetch weather for a location using Open-Meteo (free, no key) ──
async function fetchWeather(location: string): Promise<string | null> {
  try {
    // Geocode location
    const geoResp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`
    );
    const geoData = await geoResp.json();
    const place = geoData.results?.[0];
    if (!place) return null;

    // Fetch current weather
    const weatherResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    );
    const weatherData = await weatherResp.json();
    const c = weatherData.current;
    if (!c) return null;

    const weatherDescriptions: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail',
    };

    const desc = weatherDescriptions[c.weather_code] || 'Unknown';
    return `Location: ${place.name}, ${place.country}. Current weather: ${desc}, Temperature: ${c.temperature_2m}°C (feels like ${c.apparent_temperature}°C), Humidity: ${c.relative_humidity_2m}%, Wind: ${c.wind_speed_10m} km/h.`;
  } catch (e) {
    console.error("Weather fetch error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, wardrobeItems, styleContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ─── Build wardrobe context ──────────────────────────────
    const wardrobeContext = wardrobeItems?.length
      ? `\n\nThe user's closet contains these items:\n${wardrobeItems.map((item: any) => `- ${item.category}${item.name ? `: ${item.name}` : ''}`).join('\n')}`
      : "\n\nThe user's closet is currently empty.";

    // ─── Build style context ─────────────────────────────────
    let weatherInfo = "";
    if (styleContext?.location) {
      const weather = await fetchWeather(styleContext.location);
      if (weather) weatherInfo = `\n\nCurrent climate data:\n${weather}`;
    }

    let contextBlock = "";
    if (styleContext) {
      const parts: string[] = [];
      if (styleContext.occasion) parts.push(`Occasion: ${styleContext.occasion}`);
      if (styleContext.eventType) parts.push(`Event details: ${styleContext.eventType}`);
      if (styleContext.comfort) parts.push(`Comfort preference: ${styleContext.comfort}`);
      if (parts.length) contextBlock = `\n\nUser's style preferences for this session:\n${parts.join('\n')}`;
    }

    const systemPrompt = `You are a personal AI fashion stylist. You help users with outfit suggestions, styling advice, and fashion tips. You're trendy, supportive, and knowledgeable about fashion.

IMPORTANT: You MUST factor in the following when giving advice:
1. **Climate & Weather**: Check the weather data provided and recommend fabrics, layers, and accessories accordingly. If it's hot, suggest breathable fabrics. If rainy, suggest waterproof options. If cold, recommend layering.
2. **Occasion & Event**: Tailor formality, colors, and silhouettes to match the event (e.g., business formal for interviews, relaxed for brunches).
3. **Comfort vs Style**: Respect the user's comfort preference. If they prioritize comfort, suggest softer fabrics, relaxed fits, and easy shoes. If style-focused, push bolder choices.
4. **Practical factors**: Consider walking requirements, indoor/outdoor settings, time of day, and cultural context of the location.

Always explain WHY you're recommending something based on these factors (e.g., "Since it's 34°C and humid in Mumbai, I'd suggest...").

Additional guidelines:
- Use the user's existing wardrobe items when possible
- Suggest color coordination and pattern mixing
- Keep responses concise, friendly, and actionable
- Use emojis sparingly for personality${wardrobeContext}${weatherInfo}${contextBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI styling service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-stylist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
