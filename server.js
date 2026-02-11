import express from "express";
import { Resend } from "resend";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;

// Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

// Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_TO = process.env.RESEND_TO;
const RESEND_FROM = process.env.RESEND_FROM;

// Init Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// CORS (dev-friendly). In prod puoi restringere l'origine.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("OK - GenZCreation server. POST /api/chat | POST /api/contact");
});

// ----------------------
// 1) GEMINI CHAT ENDPOINT
// ----------------------
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

    // history: [{ role: "user"|"assistant", text: "..." }]
    const safeHistory = Array.isArray(history) ? history : [];

    const SYSTEM_TEXT =
      "Sei l'assistente virtuale di GenZCreation.it. " +
      "Rispondi in italiano, amichevole e professionale. " +
      "Aiuta su: siti web, UI/UX, e-commerce, SEO, web app, landing page e manutenzione. " +
      "Se servono dettagli fai una domanda alla volta. Non inventare.";

    const contents = [
      // system instruction “semplice”
      { role: "user", parts: [{ text: SYSTEM_TEXT }] },
      ...safeHistory
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.text === "string" &&
            m.text.trim().length > 0
        )
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

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
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
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

// ----------------------------
// 2) CONTACT FORM -> RESEND API
// ----------------------------
app.post("/api/contact", async (req, res) => {
  try {
    if (!resend) return res.status(500).json({ error: "Missing RESEND_API_KEY" });
    if (!RESEND_TO) return res.status(500).json({ error: "Missing RESEND_TO" });
    if (!RESEND_FROM) return res.status(500).json({ error: "Missing RESEND_FROM" });

    const safe = (v) => (typeof v === "string" ? v.trim() : "");

    const name = safe(req.body?.name).slice(0, 120);
    const email = safe(req.body?.email).slice(0, 200);
    const phone = safe(req.body?.phone).slice(0, 40);
    const subject = safe(req.body?.subject).slice(0, 200);
    const message = safe(req.body?.message).slice(0, 6000);

    // Validazioni minime
    if (!email) return res.status(400).json({ error: "Email obbligatoria" });
    if (!message) return res.status(400).json({ error: "Messaggio obbligatorio" });

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5">
        <h2>Nuovo contatto da GenZCreation.it</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name || "-")}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(phone || "-")}</p>
        <p><strong>Oggetto:</strong> ${escapeHtml(subject || "-")}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: RESEND_TO,
      replyTo: email,
      subject: subject ? `Contatto: ${subject}` : "Nuovo contatto dal sito",
      html,
    });

    if (error) {
      return res.status(500).json({ error: error.message || "Resend error" });
    }

    // (Opzionale) autoresponder al cliente:
    // Se lo vuoi, dimmelo e lo attivo con un secondo invio.

    return res.json({ ok: true, id: data?.id || null });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Helper: evita injection HTML nell’email
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`- Chat:    POST /api/chat`);
  console.log(`- Contact: POST /api/contact`);
});
