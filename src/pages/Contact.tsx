
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ContactForm from '@/components/ContactForm';

const ContactInfo = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-border/60"
  >
    <div className="rounded-full bg-accent/10 p-3 mb-4">
      {icon}
    </div>
    <h3 className="font-medium mb-2">{title}</h3>
    {children}
  </motion.div>
);

const Contact = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Contact Me</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Reach out with any questions or to schedule a babysitting session
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <ContactInfo 
                icon={<Phone className="h-6 w-6 text-accent" />} 
                title="Phone"
              >
                <a 
                  href="tel:+972505298803" 
                  className="text-foreground/80 hover:text-accent transition-colors"
                >
                  050-529-8803
                </a>
              </ContactInfo>
              
              <ContactInfo 
                icon={<Mail className="h-6 w-6 text-accent" />} 
                title="Email"
              >
                <span className="text-foreground/80">
                  Use the form below
                </span>
              </ContactInfo>
              
              <ContactInfo 
                icon={<MapPin className="h-6 w-6 text-accent" />} 
                title="Service Areas"
              >
                <p className="text-center text-foreground/80">
                  Talpiot, Arnona, Baka, Katamon
                </p>
              </ContactInfo>
            </div>
            
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Send a Message</h2>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
