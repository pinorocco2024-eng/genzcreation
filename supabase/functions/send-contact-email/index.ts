import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Name contains invalid characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone number too long" })
    .optional()
    .or(z.literal('')),
  company: z.string()
    .trim()
    .max(200, { message: "Company name too long" })
    .optional()
    .or(z.literal('')),
  subject: z.string()
    .trim()
    .min(3, { message: "Subject too short" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message too short" })
    .max(5000, { message: "Message must be less than 5000 characters" })
});

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

// HTML escaping function to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate input
    const validationResult = contactFormSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message, phone, company } = validationResult.data;

    console.log('Sending contact email from:', name, email);

    // Send email to the company
    const emailResponse = await resend.emails.send({
      from: "GenZ Creation Site <onboarding@resend.dev>",
      to: ["info.genzcreationsite@gmail.com"],
      subject: `Nuovo contatto: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            Nuovo messaggio dal sito web
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Dettagli del contatto:</h3>
            <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            ${phone ? `<p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>` : ''}
            ${company ? `<p><strong>Azienda:</strong> ${escapeHtml(company)}</p>` : ''}
            <p><strong>Oggetto:</strong> ${escapeHtml(subject)}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Messaggio:</h3>
            <p style="line-height: 1.6; color: #555;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px;">
              Questo messaggio è stato inviato dal modulo di contatto di GenZ Creation Site
            </p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: "GenZ Creation Site <onboarding@resend.dev>",
      to: [email],
      subject: "Messaggio ricevuto - GenZ Creation Site",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">
            Grazie per averci contattato!
          </h2>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="color: #333; margin-top: 0;">Ciao ${escapeHtml(name)},</h3>
            <p style="color: #555; line-height: 1.6; font-size: 16px;">
              Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto possibile.
            </p>
            <p style="color: #555; line-height: 1.6;">
              Il nostro team si prenderà cura della tua richiesta entro 24 ore.
            </p>
          </div>
          
          <div style="background-color: #7c3aed; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h4 style="margin: 0 0 10px 0; font-size: 18px;">Nel frattempo...</h4>
            <p style="margin: 0; opacity: 0.9;">
              Visita il nostro portfolio per scoprire i progetti che abbiamo realizzato per i nostri clienti.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              A presto,<br>
              <strong style="color: #7c3aed;">Il Team di GenZ Creation Site</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email inviata con successo" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Errore nell'invio dell'email", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);