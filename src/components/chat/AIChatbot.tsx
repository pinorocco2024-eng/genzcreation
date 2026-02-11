import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useContactForm } from "@/contexts/ContactFormContext";
import { z } from "zod";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Se il provider non c'è, non facciamo crashare il bot
  let setFormData: ((data: any) => void) | undefined;
  try {
    ({ setFormData } = useContactForm());
  } catch {
    setFormData = undefined;
  }

  // Se usi il proxy Vite, lascia così:
  const CHAT_URL = "/api/chat";

  // --- Extract contact info with validation ---
  const extractContactInfo = (message: string) => {
    const emailRegex =
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = message.match(emailRegex);

    let validatedEmail = "";
    if (emails?.[0]) {
      const emailResult = z.string().email().safeParse(emails[0]);
      if (emailResult.success) validatedEmail = emails[0];
    }

    const namePatterns = [
      /(?:il mio nome|mio nome)[:\s]+(?:è[:\s]+)?([a-z]+)/gi,
      /(?:nome|mi chiamo|sono)[:\s]+([a-z]+)/gi,
      /(?:nome)\s*[:]\s*([a-z]+)/gi,
    ];

    let name = "";
    for (const pattern of namePatterns) {
      const match = pattern.exec(message);
      if (match?.[1]) {
        const potentialName =
          match[1].charAt(0).toUpperCase() + match[1].slice(1);
        const nameResult = z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-zA-Z\s'-]+$/)
          .safeParse(potentialName);
        if (nameResult.success) {
          name = potentialName;
          break;
        }
      }
    }

    const subjectPatterns = [
      /(?:oggetto)[:\s]+(.+?)(?:\s+come oggetto|$)/gi,
      /(?:oggetto|subject)\s*[:]\s*(.+?)(?:\s+e\s|,|$)/gi,
      /(?:oggetto|subject)[:\s]+(.+?)(?:\.|$)/gi,
    ];

    let subject = "";
    for (const pattern of subjectPatterns) {
      const match = pattern.exec(message);
      if (match?.[1]) {
        const potentialSubject = match[1].trim();
        const subjectResult = z
          .string()
          .min(3)
          .max(200)
          .safeParse(potentialSubject);
        if (subjectResult.success) {
          subject = potentialSubject;
          break;
        }
      }
    }

    return { email: validatedEmail, name, subject };
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) setShowWelcome(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    const contactInfo = extractContactInfo(input);
    if (
      setFormData &&
      (contactInfo.email || contactInfo.name || contactInfo.subject)
    ) {
      setFormData({
        email: contactInfo.email,
        name: contactInfo.name,
        subject: contactInfo.subject,
        message: contactInfo.subject,
      });

      setTimeout(() => {
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }

    setInput("");
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          json?.error ||
          `Errore HTTP ${response.status}`;
        throw new Error(msg);
      }

      const assistantText =
        typeof json?.text === "string" && json.text.trim()
          ? json.text
          : "Ok.";

      setMessages([...updatedMessages, { role: "assistant", content: assistantText }]);
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
      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
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
                  <p className="text-sm text-foreground font-medium mb-1">
                    Ciao! 👋
                  </p>
                  <p className="text-xs text-foreground/70">
                    Hai domande sui nostri servizi? Sono qui per aiutarti!
                  </p>
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
