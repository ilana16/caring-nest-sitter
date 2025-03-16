
import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pb-16">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">About Ilana</h1>
            
            <div className="mb-12 flex flex-col md:flex-row gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full md:w-1/3 flex-shrink-0"
              >
                <div className="image-container rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="/lovable-uploads/7d1ff306-ee56-4167-bf66-e8ab4f8ef591.png" 
                    alt="Ilana" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full md:w-2/3"
              >
                <div className="glass-card p-6 md:p-8">
                  <p className="text-lg leading-relaxed mb-6">
                    Hi, I am Ilana.
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                    I am a patient, responsible, 23-year-old with 10+ years of childcare experience. 
                    My Hebrew needs work, but I can communicate. I completed a Hatzalah course which 
                    certified me as an EMT (חובשת) in both Israel and America. I can cook meals, and 
                    I keep Kosher and Shabbat. I am great at finding creative ways to keep kids engaged, 
                    happy and safe. I have experience caring for high functioning special needs children, 
                    and children and babies of all ages. I am also willing to do some light housework, 
                    and have experience in basic home maintenance.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Certifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 overflow-hidden">
                  <div className="image-container mb-4">
                    <img 
                      src="/lovable-uploads/96a07fce-c5fa-415a-b705-96f4f8a78255.png" 
                      alt="EMT Certificate" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-medium text-center">U.S. EMT Certification</h3>
                </div>
                
                <div className="glass-card p-6 overflow-hidden">
                  <div className="image-container mb-4">
                    <img 
                      src="/lovable-uploads/07983bf8-a837-4657-8e4f-1e23dbfc62dc.png" 
                      alt="Hatzalah Certificate" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-medium text-center">Israeli Hatzalah Certification</h3>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
