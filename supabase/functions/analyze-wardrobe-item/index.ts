import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert fashion cataloger. Look at the clothing image provided and reply with a single, highly descriptive name combining its exact color, material, pattern, and garment type (e.g., 'Blue & White Short-Sleeve Cuban Collar Shirt', 'Caramel Brown Oxford Button-Down', 'Distressed Light Wash Denim Jeans'). 
    
    CRITICAL RULES:
    1. Sleeve Length: Pay extreme attention to sleeve length! If sleeves end at or above the elbow, you MUST describe it as 'Short-Sleeve' or 'Half-Sleeve'. Never classify short-sleeve garments as long-sleeve!
    2. Garment Style: Identify exact collar & cut (e.g., Cuban Collar, Camp Collar, Resort Shirt, Oxford, Polo, Kurta, Chinos).
    3. Pattern & Color: Identify primary colors and patterns accurately (e.g. Printed, Patterned, Paisley, Floral, Plaid, Solid).
    4. Reply strictly with the descriptive name only. Do not add any conversational text, quotes, or markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Vision capable
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "image_url", image_url: { url: imageUrl } }
            ] 
          }
        ]
      }),
    });

    if (!response.ok) {
       console.error("AI gateway error:", response.status, await response.text());
       throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "Clothing Item";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-wardrobe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
