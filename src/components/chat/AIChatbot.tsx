import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useContactForm } from "@/contexts/ContactFormContext";
import { z } from "zod";

type Message = { role: "user" | "assistant"; content: string };

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const WELCOME_TEXT = "Ciao, hai domande sui nostri servizi? Sono qui per aiutarti!";

function safeParseContactJson(text: string): ContactPayload | null {
  // Cerca una riga tipo: CONTACT_JSON: {...}
  const marker = "CONTACT_JSON:";
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return null;

  const jsonPart = text.slice(idx + marker.length).trim();
  try {
    const obj = JSON.parse(jsonPart);
    const parsed = z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().optional(),
      })
      .safeParse(obj);

    if (!parsed.success) return null;

    return {
      name: parsed.data.name || "",
      email: parsed.data.email || "",
      phone: parsed.data.phone || "",
      subject: parsed.data.subject || "",
      message: parsed.data.message || "",
    };
  } catch {
    return null;
  }
}

function stripContactJson(text: string) {
  const marker = "CONTACT_JSON:";
  const idx = text.lastIndexOf(marker);
  if (idx === -1) return text.trim();
  return text.slice(0, idx).trim();
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // welcome sempre disponibile quando chat chiusa e nessun messaggio
  const [showWelcome, setShowWelcome] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { setFormData } = useContactForm();

  // endpoint Next.js
  const CHAT_URL = "/api/chat";

  // Estrazione base dall’utente (email + nome + oggetto + telefono)
  const extractContactInfoFromUser = (message: string) => {
    const emailRegex =
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex =
      /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{6,10}/g;

    const emails = message.match(emailRegex);
    const phones = message.match(phoneRegex);

    let validatedEmail = "";
    if (emails?.[0]) {
      const emailResult = z.string().email().safeParse(emails[0]);
      if (emailResult.success) validatedEmail = emails[0];
    }

    let phone = "";
    if (phones?.[0]) {
      const cleaned = phones[0].replace(/[^\d+]/g, "");
      if (cleaned.length >= 8 && cleaned.length <= 16) phone = cleaned;
    }

    const namePatterns = [
      /(?:il mio nome|mio nome)[:\s]+(?:è[:\s]+)?([a-zA-ZÀ-ÿ'\s-]{2,})/i,
      /(?:mi chiamo|sono)[:\s]+([a-zA-ZÀ-ÿ'\s-]{2,})/i,
      /(?:nome)\s*[:]\s*([a-zA-ZÀ-ÿ'\s-]{2,})/i,
    ];

    let name = "";
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match?.[1]) {
        const potentialName = match[1].trim();
        const nameResult = z.string().min(2).max(100).safeParse(potentialName);
        if (nameResult.success) {
          name = potentialName;
          break;
        }
      }
    }

    const subjectPatterns = [
      /(?:oggetto)[:\s]+(.+?)(?:$)/i,
      /(?:subject)[:\s]+(.+?)(?:$)/i,
      /(?:preventivo per|mi serve|vorrei)[:\s]+(.+?)(?:$)/i,
    ];

    let subject = "";
    for (const pattern of subjectPatterns) {
      const match = message.match(pattern);
      if (match?.[1]) {
        const potential = match[1].trim();
        const ok = z.string().min(3).max(200).safeParse(potential);
        if (ok.success) {
          subject = potential;
          break;
        }
      }
    }

    return { email: validatedEmail, name, phone, subject };
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // welcome: se chat chiusa e nessun messaggio, fallo vedere
  useEffect(() => {
    if (!isOpen && messages.length === 0) setShowWelcome(true);
  }, [isOpen, messages.length]);

  const applyContactToForm = (payload: Partial<ContactPayload>) => {
    const safePayload: ContactPayload = {
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.phone || "",
      subject: payload.subject || "",
      message: payload.message || "",
    };

    setFormData({
      name: safePayload.name,
      email: safePayload.email,
      phone: safePayload.phone,
      subject: safePayload.subject,
      message: safePayload.message,
    });

    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userText = input.trim();

  const userMessage: Message = { role: "user", content: userText };
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);

  // autocompila contatti se l’utente scrive dati
  const contactInfo = extractContactInfoFromUser(userText);
  if (contactInfo.email || contactInfo.name || contactInfo.subject) {
    setFormData({
      email: contactInfo.email,
      name: contactInfo.name,
      subject: contactInfo.subject,
      message: contactInfo.subject,
    });

    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  }

  setInput("");
  setIsLoading(true);
  setShowWelcome(false);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: messages.slice(-10).map((m) => ({
          role: m.role,
          text: m.content,
        })),
      }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json?.error || `HTTP ${response.status}`);
    }

    const assistantText =
      typeof json?.text === "string" && json.text.trim()
        ? json.text
        : "Ok.";

    setMessages([...updatedMessages, { role: "assistant" as const, content: assistantText }]);
  } catch (error: any) {
    console.error("Chat error:", error);
    toast({
      title: "Errore",
      description: error?.message || "Si è verificato un errore. Riprova più tardi.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Welcome Bubble - sempre in basso quando chat chiusa e senza messaggi */}
      <AnimatePresence>
        {showWelcome && !isOpen && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 max-w-xs"
          >
            <div className="glass-card p-4 rounded-2xl shadow-elegant relative">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-2 right-2 text-foreground/60 hover:text-foreground"
                type="button"
                aria-label="Chiudi benvenuto"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Ciao! 👋</p>
                  <p className="text-xs text-foreground/70">{WELCOME_TEXT}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowWelcome(false);
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        aria-label={isOpen ? "Chiudi chat" : "Apri chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[32rem] glass-card rounded-2xl shadow-elegant overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-gradient-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Assistente GenZ</h3>
                  <p className="text-xs text-white/80">Sempre disponibile per te</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-foreground/60 text-sm py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary/60" />
                    <p>Ciao! Come posso aiutarti oggi?</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-primary text-white"
                          : "glass-card text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="glass-card p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-card/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scrivi un messaggio..."
                  disabled={isLoading}
                  className="flex-1 glass-button"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-gradient-primary hover:scale-105 transition-transform"
                  type="button"
                  aria-label="Invia"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
