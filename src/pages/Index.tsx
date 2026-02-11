import { Navigation } from "@/components/layout/Navigation";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Portfolio } from "@/components/sections/Portfolio";
import { Contact } from "@/components/sections/Contact";
import { Toaster } from "@/components/ui/toaster";
import Globe from "@/components/ui/Globe";
import { Scene3D } from "@/components/3d/Scene3D";
import { AIChatbot } from "@/components/chat/AIChatbot";
import { ContactFormProvider } from "@/contexts/ContactFormContext";
import { Playground3D } from "@/components/3d/Playground3D";

const Index = () => {
  return (
    <ContactFormProvider>
      <main className="min-h-screen bg-background text-foreground relative">
        {/* Global 3D Background (non blocca click) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Scene3D />
          <div className="absolute inset-0 gradient-glow opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Navigation />

          <section id="home">
            <Hero />
          </section>
          <section id="play" className="scroll-mt-28">
            <Playground3D />
          </section>
          <section id="services">
            <Services />
          </section>

          <section id="portfolio">
            <Portfolio />
          </section>

          {/* ✅ PLAYGROUND (ora esiste davvero) */}
         

          <section id="contact">
            <Contact />
          </section>

          {/* Footer */}
          <footer className="py-12 px-6 border-t border-border/50 bg-card/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <Globe />

              <div className="text-center">
                <div className="mb-6">
                  <span className="font-black text-2xl brand-gradient">GenZ</span>
                  <span className="text-2xl font-black text-accent">Creation</span>
                </div>

                <p className="text-foreground/60 mb-4">
                  Creiamo esperienze digitali straordinarie per il futuro del web
                </p>

                <p className="text-sm text-foreground/40">
                  © 2024 GenZ Creation Site. Tutti i diritti riservati.
                </p>
              </div>
            </div>
          </footer>
        </div>

        <Toaster />
        <AIChatbot />
      </main>
    </ContactFormProvider>
  );
};

export default Index;
