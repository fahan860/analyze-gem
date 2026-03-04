import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { extractedText } = await req.json();

    if (!extractedText || typeof extractedText !== "string") {
      return new Response(JSON.stringify({ error: "Missing extractedText" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial analyst AI. Analyze the provided financial report text and return a structured JSON analysis.

You MUST respond with valid JSON only, no markdown, no explanation. The JSON must have this exact structure:
{
  "summary": "Executive summary of the financial report in under 300 words",
  "kpis": [
    {"label": "Revenue", "value": "$X.XB", "change": "+X.X% YoY", "positive": true},
    {"label": "Net Income", "value": "$X.XB", "change": "+X.X% YoY", "positive": true},
    {"label": "EBITDA", "value": "$X.XB", "change": "+X.X% YoY", "positive": true},
    {"label": "EPS", "value": "$X.XX", "change": "+X.X% YoY", "positive": true},
    {"label": "Total Debt", "value": "$X.XB", "change": "-X.X% YoY", "positive": true},
    {"label": "Cash Flow", "value": "$X.XB", "change": "+X.X% YoY", "positive": true}
  ],
  "risk_factors": ["Risk factor 1", "Risk factor 2", "Risk factor 3", "Risk factor 4", "Risk factor 5"],
  "health_score": 75
}

Rules:
- Extract actual numbers from the text when available
- If a KPI is not found, estimate based on context or mark as "N/A"
- health_score must be 1-100 integer
- risk_factors should be 3-7 specific risks
- positive field indicates if the change is favorable`;

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
          { role: "user", content: `Analyze this financial report:\n\n${extractedText.slice(0, 50000)}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-report error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
