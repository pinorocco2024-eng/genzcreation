import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
const navItems = [{
  label: 'Home',
  href: '#home'
}, {
  label: 'Servizi',
  href: '#services'
}, {
  label: 'Portfolio',
  href: '#portfolio'
}, {
  label: 'Contatti',
  href: '#contact'
}];
export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <motion.nav initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6
  }} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="text-xl sm:text-2xl font-black cursor-pointer" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="brand-gradient font-extrabold text-xl sm:text-2xl">
              GenZ
            </span>
            <span className="text-accent">Creation</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, index) => <motion.a 
              key={item.label} 
              href={item.href} 
              className="relative text-foreground/70 hover:text-primary transition-colors duration-300 font-medium text-sm lg:text-base group" 
              whileHover={{ scale: 1.05 }} 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {item.label}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>)}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="hero" 
                size="sm" 
                className="shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Inizia Progetto
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-primary/10 transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }} 
          className="md:hidden mt-4 pb-4 border-t border-border/50"
        >
          <div className="flex flex-col space-y-4 pt-4">
            {navItems.map((item, index) => (
              <motion.a 
                key={item.label} 
                href={item.href} 
                className="text-foreground/70 hover:text-primary transition-colors duration-300 font-medium py-2 px-2 rounded-lg hover:bg-primary/5" 
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                variant="hero" 
                size="sm" 
                className="w-full" 
                onClick={() => {
                  setIsOpen(false);
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Inizia Progetto
              </Button>
            </motion.div>
          </div>
        </motion.div>}
      </div>
    </motion.nav>;
};