
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';
import BookingForm from '@/components/booking/BookingForm';
import SuccessMessage from '@/components/booking/SuccessMessage';
import AvailabilityCalendarDialog from '@/components/booking/AvailabilityCalendarDialog';
import { generateMockAvailability } from '@/utils/availability';

const Booking = () => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availability, setAvailability] = useState(() => generateMockAvailability());

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
  };

  const handleReset = () => {
    setBookingSuccess(false);
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
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Availability & Booking</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Fill out the form below to book a time slot for babysitting services
            </p>
            
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card p-6 md:p-8 mb-8"
              >
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <h2 className="text-xl font-semibold">Book A Session</h2>
                </div>
                
                {bookingSuccess ? (
                  <SuccessMessage onReset={handleReset} />
                ) : (
                  <BookingForm 
                    availableDays={availability.availableDays}
                    availabilityByDate={availability.availabilityByDate}
                    onSubmitSuccess={handleBookingSuccess}
                  />
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-lg mb-6 text-foreground/80">
                  After submitting your booking request, Ilana will contact you to confirm the details
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <AvailabilityCalendarDialog />
                  <AnimatedButton 
                    to="/contact" 
                    className="bg-muted hover:bg-muted/90 text-muted-foreground"
                  >
                    Have Questions? Contact Ilana
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
