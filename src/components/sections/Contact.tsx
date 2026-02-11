import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useContactForm } from "@/contexts/ContactFormContext";
import { contactFormSchema } from "@/lib/validations";
import { z } from "zod";

export const Contact = () => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation(0.2);
  const { formData, setFormData, resetFormData } = useContactForm();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    try {
      setIsSending(true);

      // Validate form data
      const validatedData = contactFormSchema.parse(formData);

      // ✅ INVIO AL TUO BACKEND (Express + Resend)
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || "",
          company: validatedData.company || "",
          subject: validatedData.subject,
          message: validatedData.message,
        }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j?.error || `HTTP ${r.status}`);
      }

      toast({
        title: "Messaggio inviato!",
        description:
          "Ti contatteremo al più presto possibile. Controlla anche la tua email per la conferma.",
      });

      // Reset form
      resetFormData();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dati non validi",
          description: error.errors[0]?.message || "Controlla i campi e riprova.",
          variant: "destructive",
        });
        return;
      }
      console.error("Error sending contact:", error);
      toast({
        title: "Errore nell'invio",
        description:
          error?.message ||
          "Si è verificato un errore. Riprova più tardi o contattaci direttamente via email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // ✅ FIX IMPORTANTISSIMO: merge invece di sovrascrivere tutto
 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { id, value } = e.target;
 setFormData({
    ...formData,
    [id]: value,
  });
};
  // Show toast when form is auto-filled by chatbot
  useEffect(() => {
    if (formData.name && formData.email && formData.subject) {
      const allFilled =
        formData.name !== "" && formData.email !== "" && formData.subject !== "";
      if (allFilled) {
        toast({
          title: "Form compilato!",
          description:
            "Ho compilato il form con i tuoi dati. Controlla e invia quando sei pronto.",
        });
      }
    }
  }, [formData.name, formData.email, formData.subject]);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Iniziamo a{" "}
            <span className="text-primary font-extrabold">Collaborare</span>
          </motion.h2>
          <motion.p
            className="text-foreground/70 max-w-3xl mx-auto text-base sm:text-xl font-semibold px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Hai un progetto in mente? Contattaci e trasformiamo le tue idee in realtà
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Contact Form - Expanded */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sm:p-8 lg:p-12 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-500">
              <motion.h3
                className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 }}
              >
                Invia un Messaggio
              </motion.h3>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      placeholder="Il tuo nome"
                      className="mt-2"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="la-tua-email@esempio.com"
                      className="mt-2"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label htmlFor="phone" className="text-sm sm:text-base">
                      Telefono (opzionale)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+39 333 456 7890"
                      className="mt-2"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.65 }}
                  >
                    <Label htmlFor="company" className="text-sm sm:text-base">
                      Azienda (opzionale)
                    </Label>
                    <Input
                      id="company"
                      placeholder="Nome azienda"
                      className="mt-2"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.7 }}
                >
                  <Label htmlFor="subject" className="text-sm sm:text-base">
                    Oggetto
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Di cosa vuoi parlare?"
                    className="mt-2"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.75 }}
                >
                  <Label htmlFor="message" className="text-sm sm:text-base">
                    Messaggio
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Descrivi il tuo progetto o le tue esigenze..."
                    rows={5}
                    className="mt-2"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full group shadow-lg hover:shadow-xl transition-all"
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    {isSending ? "Invio in corso..." : "Invia Messaggio"}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Informazioni di Contatto</h3>
              <div className="space-y-6">
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                  onClick={() => window.open("mailto:info.genzcreationsite@gmail.com")}
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-foreground/70">info.genzcreationsite@gmail.com</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                  onClick={() => window.open("tel:+393334567890")}
                >
                  <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Telefono</p>
                    <p className="text-foreground/70">+39 3297577848</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Sede</p>
                    <p className="text-foreground/70">Legnano, Italia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section - Removed since map is now in footer */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
