import { Resend } from "resend";

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_TO = process.env.RESEND_TO;
    const RESEND_FROM = process.env.RESEND_FROM;

    if (!RESEND_API_KEY) return res.status(500).json({ error: "Missing RESEND_API_KEY" });
    if (!RESEND_TO) return res.status(500).json({ error: "Missing RESEND_TO" });
    if (!RESEND_FROM) return res.status(500).json({ error: "Missing RESEND_FROM" });

    const resend = new Resend(RESEND_API_KEY);

    const safe = (v) => (typeof v === "string" ? v.trim() : "");
    const name = safe(req.body?.name).slice(0, 120);
    const email = safe(req.body?.email).slice(0, 200);
    const phone = safe(req.body?.phone).slice(0, 40);
    const company = safe(req.body?.company).slice(0, 120);
    const subject = safe(req.body?.subject).slice(0, 200);
    const message = safe(req.body?.message).slice(0, 6000);

    if (!email) return res.status(400).json({ error: "Email obbligatoria" });
    if (!message) return res.status(400).json({ error: "Messaggio obbligatorio" });

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5">
        <h2>Nuovo contatto da GenZCreation.it</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name || "-")}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(phone || "-")}</p>
        <p><strong>Azienda:</strong> ${escapeHtml(company || "-")}</p>
        <p><strong>Oggetto:</strong> ${escapeHtml(subject || "-")}</p>
        <hr/>
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

    if (error) return res.status(500).json({ error: error.message || "Resend error" });

    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
