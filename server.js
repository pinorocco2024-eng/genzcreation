app.get("/", (req, res) => {
  res.send("OK - Gemini chat server. Usa POST /api/chat");
});

import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

function toGeminiContents(messages) {
  // Gemini: role "user" / "model" e parts[{text}]
  return (messages || [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-20)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

// CORS semplice per dev (se usi proxy Vite, puoi anche rimuoverlo)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      res.status(500).json({ error: "GEMINI_API_KEY non configurata" });
      return;
    }

    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages mancanti" });
      return;
    }

    const systemInstruction = {
      parts: [
        {
          text:
            "Sei un assistente virtuale per GenZ Creation Sites, un'agenzia di sviluppo web moderna e innovativa. " +
            "Rispondi sempre in italiano in modo amichevole e professionale. " +
            "Aiuta i visitatori a conoscere i servizi: sviluppo web, design UI/UX, e-commerce, applicazioni web personalizzate. " +
            "Sii conciso ma informativo. Non inventare.",
        },
      ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction,
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 700,
        },
      }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const msg =
        data?.error?.message ||
        `Errore Gemini: HTTP ${upstream.status}`;
      res.status(500).json({ error: msg });
      return;
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join("") || "";

    res.json({ text: text || "Ok." });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Errore server" });
  }
});

app.listen(PORT, () => {
  console.log(`Server Gemini pronto: http://localhost:${PORT}`);
});
