
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-[90vh] flex flex-col">
        <section className="flex-1 flex flex-col pt-8 md:pt-16 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Ilana Cares
              </h1>
              <p className="text-sm md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                English Speaking Babysitter In <br className="inline sm:hidden" /> 
                <span className="sm:hidden">&nbsp;</span>The Talpiot/Arnona/Baka/Katamon Area
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="image-container w-full max-w-md mb-12 mt-4 overflow-hidden shadow-lg"
            >
              <img 
                src="/lovable-uploads/37091ff6-4633-45c4-850e-5da3224a560c.png" 
                alt="Ilana Cares" 
                className="w-full h-auto rounded-xl object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl"
            >
              <AnimatedButton 
                to="/about" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                About Me
              </AnimatedButton>
              <AnimatedButton 
                to="/rates" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Rates
              </AnimatedButton>
              <AnimatedButton 
                to="/booking" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Book Now
              </AnimatedButton>
              <AnimatedButton 
                to="/payment" 
                className="sm:col-span-2 md:col-span-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Payment Options
              </AnimatedButton>
              <AnimatedButton 
                to="/contact" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Contact
              </AnimatedButton>
            </motion.div>
          </div>
        </section>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-auto py-6 bg-muted/40 backdrop-blur-sm border-t border-border/40"
        >
          <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} Ilana Cares. All rights reserved.</p>
          </div>
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default Index;
