import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per window

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
  
  // Get current request count for this IP in the current window
  const { data: existingRecords, error: fetchError } = await supabase
    .from("rate_limits")
    .select("request_count")
    .eq("ip_address", ip)
    .eq("endpoint", "chat")
    .gte("window_start", windowStart)
    .order("window_start", { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Rate limit check error:", fetchError);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS }; // Fail open
  }

  const currentCount = existingRecords?.[0]?.request_count || 0;

  if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Update or insert rate limit record
  const { error: upsertError } = await supabase
    .from("rate_limits")
    .upsert({
      ip_address: ip,
      endpoint: "chat",
      request_count: currentCount + 1,
      window_start: new Date().toISOString(),
    }, {
      onConflict: "ip_address,endpoint,window_start",
    });

  if (upsertError) {
    console.error("Rate limit update error:", upsertError);
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    const { allowed, remaining } = await checkRateLimit(clientIP);
    
    if (!allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Troppe richieste. Riprova tra un minuto.",
          retryAfter: 60 
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60"
          } 
        }
      );
    }

    console.log(`Request from IP: ${clientIP}, Remaining: ${remaining}`);
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Sei un assistente virtuale per GenZ Creation Sites, un'agenzia di sviluppo web moderna e innovativa. Rispondi sempre in italiano in modo amichevole e professionale. Aiuta i visitatori a conoscere i servizi offerti: sviluppo web, design UI/UX, e-commerce, e applicazioni web personalizzate. Sii conciso ma informativo."
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Troppi richieste, riprova tra poco." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servizio temporaneamente non disponibile." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Errore del servizio AI" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-RateLimit-Remaining": remaining.toString()
      },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
