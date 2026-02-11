import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function toGeminiContents(messages) {
  // Gemini usa role: "user" e "model"
  return (messages || [])
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

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

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Endpoint streaming Gemini (SSE)
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`;

    const systemInstruction = {
      parts: [{
        text:
          "Sei un assistente virtuale per GenZ Creation Sites. Rispondi in italiano in modo amichevole e professionale. " +
          "Aiuta su: sviluppo web, design UI/UX, e-commerce, applicazioni web personalizzate. Sii conciso ma informativo."
      }],
    };

    const geminiReqBody = {
      systemInstruction,     // system instruction (testo)
      contents: toGeminiContents(messages),
      generationConfig: {
        // con Gemini 3 spesso è consigliato lasciare la temperatura default,
        // ma puoi impostarla se vuoi
        // temperature: 1.0,
      },
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY, // auth ufficiale Gemini API :contentReference[oaicite:3]{index=3}
      },
      body: JSON.stringify(geminiReqBody),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      res.write(`data: ${JSON.stringify({ error: errText || `HTTP ${upstream.status}` })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }

    // Leggiamo SSE Gemini, estraiamo testo e lo “rimappiamo” in delta OpenAI-like
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE: eventi separati da \n\n, ma spesso basta processare per riga data:
      while (true) {
        const idx = buffer.indexOf("\n");
        if (idx === -1) break;

        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);

        line = line.replace(/\r$/, "");
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let json;
        try {
          json = JSON.parse(payload);
        } catch {
          continue;
        }

        // Gemini streaming: candidate -> content -> parts -> text
        const chunkText =
          json?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join("") || "";

        if (!chunkText) continue;

        // In streaming Gemini può mandare porzioni; noi calcoliamo il delta rispetto a fullText
        let delta = chunkText;
        if (chunkText.startsWith(fullText)) {
          delta = chunkText.slice(fullText.length);
        }
        fullText = chunkText;

        if (delta) {
          // formato compatibile col tuo parser attuale
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`);
        }
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (e) {
    res.status(500).json({ error: e?.message || "Errore server" });
  }
});

app.listen(3001, () => {
  console.log("Server on http://localhost:3001");
});
