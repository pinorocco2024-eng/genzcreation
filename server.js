import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

// CORS per dev
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("OK - Gemini server. POST /api/chat");
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const { message, history } = req.body || {};
    const userMessage = (message || "").trim();
    if (!userMessage) {
      return res.status(400).json({ error: "Missing message" });
    }

    // history: [{role:"user"|"assistant", text:"..."}]
    const safeHistory = Array.isArray(history) ? history : [];

    const systemText =
      "Sei l'assistente virtuale di GenZCreation.it. Rispondi in italiano, amichevole e professionale. " +
      "Aiuta su: siti web, UI/UX, e-commerce, SEO, web app. Se servono dettagli fai una domanda alla volta.";

    const contents = [
      { role: "user", parts: [{ text: systemText }] }, // (semplice, funziona)
      ...safeHistory
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      MODEL
    )}:generateContent`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
      }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(500).json({
        error: data?.error?.message || `Gemini error HTTP ${upstream.status}`,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join("") || "Ok.";

    return res.json({ text });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini server running: http://localhost:${PORT}`);
});
