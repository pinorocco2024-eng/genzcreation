import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight, Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
const portfolioProjects = [{
  title: "FlashLearn Igloo Edition",
  category: "E-Learning Platform",
  description: "Piattaforma e-learning completa con sistema di flashcard interattive, autenticazione Google integrata e gestione intelligente dello studio. Design moderno con focus sull'esperienza utente e gamificazione dell'apprendimento",
  url: "https://flashlearniglooedition.base44.app",
  tech: ["React", "Supabase", "Google Auth", "Stripe"],
  metrics: {
    performance: "95/100",
    conversions: "+220%",
    loadTime: "0.8s"
  },
  features: ["Autenticazione Multi-provider", "Sistema Flashcard Intelligente", "Tracking Progressi"]
},{
  title: "Sfratto Morosi",
  category: "Lawyer Services Platform",
  description: "È una piattaforma per sfratto per morosità: analisi gratuita, procedura legale completa, preventivo chiaro e ordinanza in 90 giorni. Richiedi consulenza ora!",
  url: "https://sfrattomorosi.it",
  tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  metrics: {
    performance: "93/100",
    conversions: "+190%",
    loadTime: "1.1s"
  },
  features: ["Chatbot integrato", "Prenotazione Online", "Automazione Prenotazioni"]
},{
  title: "La dolce sosta",
  category: "Apartment Rental",
  description: "Piattaforma di prenotazione diretta di una luxury private residence a Venezia (quartiere San Marco). Offre informazioni sulla proprietà, foto, tariffe e un modulo per richiedere la disponibilità, rivolgendosi a viaggiatori che cercano un soggiorno esclusivo e tranquillo nel centro storico della città",
  url: "https://ladolcesosta.it",
  tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  metrics: {
    performance: "91/100",
    conversions: "+90%",
    loadTime: "2.3s"
  },
  features: ["Chatbot integrato", "Blog Personale", "Automazione Prenotazioni"]
}, {
  title: "La Bulle Legnano",
  category: "Restaurant Platform",
  description: "È una piattaforma enologica a Legnano: selezione premium di vini, cucina stagionale, degustazioni guidate e location per eventi privati. Prenota subito la tua esperienza enogastronomica unica nel cuore di Legnano",
  url: "https://labullelegnano.netlify.app/",
  tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  metrics: {
    performance: "92/100",
    conversions: "+250%",
    loadTime: "1.6s"
  },
  features: ["Prenotazioni tavoli", "Chatbot integrato", "Automazioni richieste"]
}, {
  title: "Glacier",
  category: "SaaS Platform",
  description: "È una piattaforma di automazione next‑gen: engine sub‑millisecondo, AI‑driven workflow, sicurezza quantistica e 5 000+ integrazioni. Prova il demo ora!",
  url: "https://glacierautomation.vercel.app/",
  tech: ["React", "VITE", "Supabase", "Stripe"],
  metrics: {
    performance: "96/100",
    conversions: "+210%",
    loadTime: "0.7s"
  },
  features: ["Google OAuth Integration", "Design Minimalista", "Pagamenti Sicuri"]
}, {
  title: "ImmobilTarget",
  category: "Real Estate Platform",
  description: "Piattaforma immobiliare completa per agenzia di Legnano con ricerca immobili avanzata, AI Assistant integrato per assistenza clienti, sistema di valutazione automatica e dashboard area utente. Design moderno dark theme con focus su conversioni",
  url: "https://immobiltarget.base44.app",
  tech: ["React", "TypeScript", "AI Integration", "Supabase"],
  metrics: {
    performance: "94/100",
    conversions: "+185%",
    loadTime: "1.0s"
  },
  features: ["AI Assistant Integrato", "Valutazioni Automatiche", "Ricerca Avanzata Immobili"]
}, {
  title: "Adam Brilla Green",
  category: "Sustainability & Green Tech",
  description: "Landing page per consulente ambientale specializzato in sostenibilità aziendale. Design pulito e moderno con focus su credibilità professionale e call-to-action efficaci per acquisizione contatti",
  url: "https://adam-brilla.base44.app",
  tech: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  metrics: {
    performance: "94/100",
    conversions: "+168%",
    loadTime: "0.9s"
  },
  features: ["Design Minimalista", "Form Contatti Ottimizzato", "Sezione Servizi Chiara"]
}, {
  title: "NEXUS Prime – Wealth Reimagined",
  category: "FinTech / Investment Platform",
  description: "Piattaforma he offre infrastruttura istituzionale, feed di mercato in tempo reale (BTC, ETH, indici, oro…) e sei moduli chiave: Trading quantitativo, Wealth Management, Sicurezza biometrica, Crypto Gateway, Liquidità globale, AI Forecasting",
  url: "https://nexuspr1me.vercel.app/",
  tech: ["React", "Node.js", "Tailwind CSS", "Chart/Recharts per i ticker di mercato"],
  metrics: {
    performance: "92/100",
    conversions: "+150%",
    loadTime: "0.9s"
  },
  features: ["Live Nexus Feed con prezzi aggiornati in tempo reale", "AI Advisor ", "Autenticazione biometrica a più fattori"]
}, {
  title: "Studio Legale Grillo",
  category: "Legal Services Premium",
  description: "Sito web professionale per studio legale di Milano con sistema di prenotazione consulenze online, area clienti protetta per gestione documenti e blog giuridico per SEO e acquisizione lead qualificati",
  url: "https://studiolegalegrillo.base44.app",
  tech: ["Next.js", "TypeScript", "Supabase", "Stripe"],
  metrics: {
    performance: "95/100",
    conversions: "+185%",
    loadTime: "1.0s"
  },
  features: ["Prenotazioni Online", "Area Clienti Sicura", "Blog Ottimizzato SEO"]
}, {
  title: "Nexus Architect",
  category: "Architecture & Design",
  description: "Portfolio digitale per studio di architettura contemporanea con galleria progetti ad alta risoluzione, filtri per categoria, configuratore 3D per visualizzazione progetti e form contatto integrato",
  url: "https://nexusarchitect.base44.app",
  tech: ["Vue.js", "Nuxt", "Sanity CMS", "Cloudinary"],
  metrics: {
    performance: "93/100",
    conversions: "+152%",
    loadTime: "1.3s"
  },
  features: ["Galleria HD Ottimizzata", "Filtri Progetti Dinamici", "Viewer 3D Interattivo"]
}, {
  title: "Daclè SA",
  category: "Pharmaceutical Corporate",
  description: "Sito web aziendale per società farmaceutica svizzera con oltre 100 anni di storia. Focus su comunicazione istituzionale, sostenibilità e valori familiari tramite storytelling interattivo e design moderno",
  url: "https://daclenextgen.base44.app",
  tech: ["React", "Three.js", "WebGL", "GSAP"],
  metrics: {
    performance: "96/100",
    conversions: "+145%",
    loadTime: "1.2s"
  },
  features: ["Animazioni 3D Interattive", "Storytelling Visivo", "Design Responsive"]
}];
const testimonials = [{
  name: "Marco Daclé",
  company: "Daclè SA",
  text: "Il nuovo sito web ha rafforzato la nostra identità di marca e migliorato significativamente l'engagement dei visitatori. Le conversioni da lead a clienti sono aumentate del 145% in 8 mesi.",
  rating: 5
}, {
  name: "Avv. Giuseppe Grillo",
  company: "Studio Legale Grillo",
  text: "Abbiamo finalmente una presenza online professionale che genera contatti qualificati ogni settimana. Il sistema di prenotazioni ha semplificato enormemente il nostro lavoro amministrativo.",
  rating: 5
}, {
  name: "Arch. Elena Rossi",
  company: "Nexus Architect",
  text: "Il portfolio digitale è diventato il nostro migliore strumento di vendita. I clienti apprezzano molto la possibilità di esplorare i progetti in 3D prima ancora del primo incontro.",
  rating: 5
}];
export const Portfolio = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  
  return <section ref={ref} className="py-32 px-8 relative overflow-hidden bg-card/20 backdrop-blur-sm">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <Star className="w-5 h-5 text-primary fill-current" />
            <span className="text-sm font-semibold text-primary">Portfolio Certificato</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Progetti <span className="brand-gradient text-6xl">Realizzati</span>
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto font-medium">
            Scopri come abbiamo <strong>trasformato il business</strong> di aziende leader con soluzioni digitali innovative
          </p>
        </motion.div>

        {/* Projects Carousel */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-16"
        >
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {portfolioProjects.map((project, index) => <CarouselItem key={project.title} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="group h-full overflow-hidden bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-elegant">
                    {/* Project Preview */}
                    <div className="h-80 relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8">
                          <h3 className="text-3xl font-bold mb-4 text-foreground">
                            {project.title}
                          </h3>
                          <span className="text-sm text-primary font-medium bg-primary/10 px-4 py-2 rounded-full">
                            {project.category}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={() => window.open(project.url, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Metrics Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-primary font-bold text-sm">{project.metrics.performance}</div>
                              <div className="text-white/70 text-xs">Performance</div>
                            </div>
                            <div>
                              <div className="text-accent font-bold text-sm">{project.metrics.conversions}</div>
                              <div className="text-white/70 text-xs">Conversioni</div>
                            </div>
                            <div>
                              <div className="text-secondary font-bold text-sm">{project.metrics.loadTime}</div>
                              <div className="text-white/70 text-xs">Load Time</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="p-10 space-y-6">
                      <p className="text-foreground/80 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2">
                        {project.features.map((feature, idx) => <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-sm text-foreground/70 font-medium">{feature}</span>
                          </div>)}
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tech.map(tech => <span key={tech} className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground font-medium">
                            {tech}
                          </span>)}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" onClick={() => window.open(project.url, '_blank')}>
                          Visita il Progetto
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </motion.div>


        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-center"
        >
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-12">
            <h3 className="text-2xl font-bold mb-4">Pronto a Trasformare il Tuo Business?</h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Unisciti alle aziende leader che hanno scelto GenZ Creation per la loro trasformazione digitale
            </p>
            <Button variant="hero" size="lg" onClick={() => document.getElementById('contact')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              Inizia il Tuo Progetto
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>;
};