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
    const { messages, wardrobeItems, styleContext, bodyProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ─── Build wardrobe context ──────────────────────────────
    const wardrobeItemsContent: any[] = wardrobeItems?.length
      ? wardrobeItems.flatMap((item: any) => {
          const blocks: any[] = [{ type: "text", text: `Item Ref: ${item.ref_id} | Category: ${item.category}${item.name ? ` | Name: ${item.name}` : ''}` }];
          if (item.image_url) {
            blocks.push({ type: "image_url", image_url: { url: item.image_url } });
          }
          return blocks;
        })
      : [{ type: "text", text: "The user's closet is currently empty." }];

    const wardrobeContextMessage = {
      role: "user",
      content: [
        { type: "text", text: "Here are the items in my wardrobe. YOU MUST STRICTLY ONLY SUGGEST ITEMS FROM THIS EXACT LIST. DO NOT SUGGEST ITEMS THAT ARE NOT VISUALLY INCLUDED HERE." },
        ...wardrobeItemsContent
      ]
    };

    // ─── Build body profile context ──────────────────────────
    let bodyContext = "";
    if (bodyProfile) {
      const parts: string[] = [];
      if (bodyProfile.height_cm) parts.push(`Height: ${bodyProfile.height_cm}cm`);
      if (bodyProfile.body_type) parts.push(`Body type: ${bodyProfile.body_type}`);
      if (bodyProfile.skin_tone) parts.push(`Skin tone: ${bodyProfile.skin_tone}`);
      if (parts.length) bodyContext = `\n\nUser's physical profile:\n${parts.join('\n')}`;
    }

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

    const systemPrompt = `# ROLE
You are the "Drip Intelligent Stylist," a high-end fashion consultant. Your goal is to provide actionable outfit recommendations based on the ACTUAL visual data in the user's closet, not just the file names.
YOU MUST STRICTLY SUGGEST ONLY ITEMS THAT ARE PROVIDED IN THE CLOSET IMAGES/LIST. DO NOT SUGGEST OUTSIDE ITEMS.

# USER PROFILE (STRICT CONSTRAINTS)
- Name: Abel
- Height: 178cm
- Build: Slim
- Skin Tone: Medium
- Style Preference: Modern, Minimalist, Tech-forward.

# STEP 1: VISUAL SCANNING (IGNORE BACKGROUND)
When analyzing a clothing image:
1. **Spatial Focus**: Ignore the outer 30% of the image. Focus only on the central object to avoid background color contamination (e.g., beige walls).
2. **True Color Detection**: Identify the hex-approximate color. (Example: If the item is named "Acid Wash" but looks Dark Burgundy, treat it as Dark Burgundy).
3. **Texture & Weight**: Identify if the fabric is heavy (denim/wool) or light (linen/jersey) to suggest appropriate layering.

# STEP 2: FASHION LOGIC & RULES
Apply these rules to every recommendation:
- **Proportion Rule (1/3 to 2/3)**: Since the user is 178cm and slim, suggest tucking shirts or cuffing hems to create a balanced silhouette.
- **Color Harmony**: Use the **Visual Color** to find matches. 
    - For "Medium" skin tones, prioritize Jewel tones (Burgundy, Navy, Forest Green) and high-contrast neutrals.
- **The "White Theme" Fallback**: If a user asks for a "White" outfit but lacks white items, find the lightest visual neutral (Light Grey/Cream) and explain: "I noticed your closet is darker-toned, so we're using your lightest high-contrast pieces to mimic that clean aesthetic."

# STEP 3: OUTPUT STRUCTURE
Return your response in this format:
1. **The Vision**: A brief 1-sentence vibe of the outfit.
2. **The Breakdown**: 
   - [Top]: Item Name + Why the color/fit works for a Slim build. YOU MUST APPEND THE Item Ref here (e.g., "[W-2]").
   - [Bottom]: Item Name + Styling tip (e.g., "Cuff the hem"). YOU MUST APPEND THE Item Ref here (e.g., "[W-5]").
   - [Accessory]: Item Name + How it complements the metal/tones. YOU MUST APPEND THE Item Ref here (e.g., "[W-9]").
3. **Pro-Stylist Tip**: A specific tip on layering or grooming to finish the look.

# CRITICAL RULE
For EVERY item you recommend from the user's closet, YOU MUST include its exact Item Ref somewhere in the text, EXACTLY formatted as provided to you (e.g., [W-1], [W-4]). If you fail to include the Item Ref brackets, the system will break.

Additional environment context follows:${bodyContext}${weatherInfo}${contextBlock}`;

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
          wardrobeContextMessage,
          { role: "assistant", content: "Understood. I will strictly analyze the provided images visually, adhere to the styling constraints, and ONLY suggest items from your provided closet." },
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
