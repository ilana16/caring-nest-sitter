
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Info, Copy, Check } from 'lucide-react';
import { PaypalLogo } from '@/components/ui/paypal-logo';
import PageTransition from '@/components/PageTransition';
import PaymentButton from '@/components/PaymentButton';
import { toast } from 'sonner';

const BitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#FFDEE2" fillOpacity="0.6" />
    <path d="M6.5 12.5H10.5M17.5 12.5H13.5M12 7V17" stroke="#FF7E9D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Payment = () => {
  const [copiedBit, setCopiedBit] = useState(false);
  const [copiedPaybox, setCopiedPaybox] = useState(false);
  
  const copyToClipboard = (text: string, type: 'bit' | 'paybox') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'bit') {
          setCopiedBit(true);
          setTimeout(() => setCopiedBit(false), 2000);
        } else {
          setCopiedPaybox(true);
          setTimeout(() => setCopiedPaybox(false), 2000);
        }
        toast.success('Phone number copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-12 md:py-16 bg-gradient-to-br from-background to-primary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-foreground">Online Payment Options</h1>
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
                <div className="relative">
                  <PaymentButton
                    title="Bit"
                    value="050-529-8803"
                    icon={<BitIcon />}
                    className="border-accent/40 bg-accent/20 hover:bg-accent/30"
                  />
                  <button 
                    onClick={() => copyToClipboard('0505298803', 'bit')}
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    aria-label="Copy Bit number"
                  >
                    {copiedBit ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-foreground/70" />}
                  </button>
                </div>
                
                <div className="relative">
                  <PaymentButton
                    title="Paybox"
                    value="050-529-8803"
                    icon={<CreditCard className="text-primary-foreground" />}
                    className="border-primary/40 bg-primary/20 hover:bg-primary/30"
                  />
                  <button 
                    onClick={() => copyToClipboard('0505298803', 'paybox')}
                    className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    aria-label="Copy Paybox number"
                  >
                    {copiedPaybox ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-foreground/70" />}
                  </button>
                </div>
                
                <PaymentButton
                  title="PayPal"
                  value="Click to Pay"
                  link="https://paypal.me/ilana2527?country.x=IL&locale.x=en_US"
                  icon={<PaypalLogo className="text-muted-foreground" />}
                  className="border-muted/40 bg-muted/20 hover:bg-muted/30"
                />
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center"
            >
              <div className="glass-card p-6 mb-8 max-w-2xl mx-auto bg-secondary/20 border-secondary/30">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-secondary-foreground mr-3 mt-0.5 flex-shrink-0" />
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
