
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';

const Rates = () => {
  const bulletPoints = [
    "2 hour minimum",
    "Base rate for 1 child - ₪50/hour",
    "Overnights, multiple children, special needs children, housework or any other dynamic situations are priced upon request."
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Rates</h1>
            
            <div className="glass-card p-8 md:p-10 mb-12">
              <motion.ul
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {bulletPoints.map((point, index) => (
                  <motion.li 
                    key={index} 
                    variants={item}
                    className="flex items-start"
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center mr-3 mt-0.5">
                      <Check size={14} className="text-accent-foreground" />
                    </span>
                    <span className="text-lg text-foreground/90">{point}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-lg mb-6 text-foreground/80">
                Ready to book a session or have questions about rates for your specific needs?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <AnimatedButton 
                  to="/booking" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Book Now
                </AnimatedButton>
                <AnimatedButton 
                  to="/contact" 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Contact Me
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Rates;
