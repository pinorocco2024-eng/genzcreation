import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Globe, Smartphone, ShoppingCart, Palette, Code2, Rocket } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
const services = [{
  icon: Globe,
  title: "Siti Web Corporate",
  description: "Sviluppiamo piattaforme digitali che trasformano la tua azienda in un brand leader di mercato. ROI garantito dal primo mese.",
  color: "text-primary",
  features: ["Design Premium", "Architettura Scalabile", "Conversioni +300%"]
}, {
  icon: ShoppingCart,
  title: "E-Commerce Avanzato",
  description: "Creiamo ecosistemi di vendita che generano fatturati milionari. Integrazione completa con sistemi ERP e CRM enterprise.",
  color: "text-secondary",
  features: ["Checkout Ottimizzato", "AI Recommendations", "Analytics Avanzate"]
}, {
  icon: Smartphone,
  title: "Mobile-First Design",
  description: "Esperienza utente fluida su ogni device. Il 78% dei tuoi clienti naviga da mobile: non perdere neanche una conversione.",
  color: "text-accent",
  features: ["Performance 99%", "UX Ottimizzata", "PWA Ready"]
}, {
  icon: Palette,
  title: "Brand Experience Design",
  description: "Creiamo identità digitali memorabili che si distinguono dalla concorrenza. Design che converte visitatori in clienti fedeli.",
  color: "text-primary",
  features: ["UI Luxury", "Design System", "Prototipazione 3D"]
}, {
  icon: Code2,
  title: "Sviluppo Enterprise",
  description: "Architetture software robuste per aziende in crescita. Integriamo tecnologie all'avanguardia per automatizzare il tuo business.",
  color: "text-secondary",
  features: ["Microservices", "API Custom", "Cloud Native"]
}, {
  icon: Rocket,
  title: "Growth & Performance",
  description: "Acceleriamo la tua crescita online con strategie data-driven. SEO tecnico, Core Web Vitals perfetti e conversioni massimizzate.",
  color: "text-accent",
  features: ["SEO Tecnico", "Speed 100/100", "Growth Hacking"]
}];
export const Services = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  
  return <section ref={ref} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Servizi <span className="brand-gradient font-extrabold text-4xl sm:text-5xl lg:text-6xl">Premium</span>
          </motion.h2>
          <motion.p 
            className="text-base sm:text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto font-medium px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Sviluppiamo soluzioni digitali di <strong>alto valore</strong> che trasformano il tuo business in un'azienda leader di mercato
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => <motion.div 
            key={service.title} 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
            transition={{ 
              duration: 0.7, 
              delay: index * 0.15,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
              <Card className="group p-6 sm:p-8 lg:p-12 h-full hover:shadow-glow transition-all duration-500 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 relative overflow-hidden hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
                </div>
                <div className="relative space-y-4 sm:space-y-6">
                  <motion.div 
                    className={`inline-flex p-3 sm:p-4 rounded-2xl bg-background/50 ${service.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                  >
                    <service.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-4 font-medium">
                      {service.description}
                    </p>
                    
                    <div className="space-y-2">
                      {service.features?.map((feature, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-center gap-2 sm:gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.15 + idx * 0.1 }}
                        >
                          <motion.div 
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full shrink-0"
                            whileHover={{ scale: 1.5 }}
                          />
                          <span className="text-xs sm:text-sm text-foreground/70 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
};