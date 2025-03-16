
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Info } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';

const Booking = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Availability & Booking</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Check my availability and book a time slot directly through my calendar
            </p>
            
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card p-6 md:p-8 mb-8"
              >
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Calendar className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold">My Calendar</h2>
                </div>
                
                <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg border border-border">
                  <iframe 
                    src="https://calendar.google.com/calendar/embed?src=65dc0af788aa48f5a2acdd219617f11f02f3b80a242461d49182cc68b3f98a09%40group.calendar.google.com&ctz=Asia%2FJerusalem" 
                    className="w-full h-full"
                    frameBorder="0"
                    scrolling="no"
                    title="Ilana's Availability Calendar"
                  ></iframe>
                </div>
                
                <div className="flex items-start p-4 bg-primary/20 rounded-lg mt-6">
                  <Info className="h-5 w-5 text-primary-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/80">
                    This calendar shows my current availability. The highlighted areas are times when I'm already booked. 
                    To book a session, please contact me with your preferred date and time.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-lg mb-6 text-foreground/80">
                  After checking my availability, feel free to contact me to finalize your booking
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <AnimatedButton 
                    to="/contact" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Contact to Book
                  </AnimatedButton>
                  <AnimatedButton 
                    to="/payment" 
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Payment Options
                  </AnimatedButton>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Booking;
