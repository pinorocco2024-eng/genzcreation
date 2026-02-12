export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history } = req.body || {};
    const userMessage = String(message || "").trim();
    if (!userMessage) return res.status(400).json({ error: "Missing message" });

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const safeHistory = Array.isArray(history) ? history : [];

    const SYSTEM_TEXT =
      "Sei l'assistente virtuale di GenZCreation.it. " +
      "Rispondi SEMPRE in italiano, amichevole e professionale. " +
      "Aiuta su: siti web, UI/UX, e-commerce, SEO, web app, landing page e manutenzione. " +
      "Se servono dettagli, fai UNA domanda alla volta. Non inventare.";

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_TEXT }] },
      ...safeHistory
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return res.status(500).json({ error: data?.error?.message || `Gemini error HTTP ${upstream.status}` });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") || "Ok.";

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
