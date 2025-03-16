
import React from 'react';
import { motion } from 'framer-motion';
import { PaypalLogo, CreditCard, Info } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import PaymentButton from '@/components/PaymentButton';

const BitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#FF7E20" fillOpacity="0.1" />
    <path d="M6.5 12.5H10.5M17.5 12.5H13.5M12 7V17" stroke="#FF7E20" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Payment = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Payment Options</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Multiple convenient payment methods available
            </p>
            
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <PaymentButton
                  title="Bit"
                  value="050-529-8803"
                  icon={<BitIcon />}
                  className="border-orange-200 bg-orange-50/50"
                />
                
                <PaymentButton
                  title="Paybox"
                  value="050-529-8803"
                  icon={<CreditCard className="text-blue-500" />}
                  className="border-blue-200 bg-blue-50/50"
                />
                
                <PaymentButton
                  title="PayPal"
                  value="Click to Pay"
                  link="https://paypal.me/ilana2527?country.x=IL&locale.x=en_US"
                  icon={<PaypalLogo className="text-indigo-600" />}
                  className="border-indigo-200 bg-indigo-50/50"
                />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center"
            >
              <div className="glass-card p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/80 text-left">
                    Payment is typically expected at the end of each session. For regular bookings, we can discuss
                    weekly or monthly payment arrangements. Please contact me if you have any questions about
                    payment options.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Payment;
