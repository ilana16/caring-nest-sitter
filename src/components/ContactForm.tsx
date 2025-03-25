import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ZAPIER_WEBHOOKS, sendToZapier } from '@/utils/webhooks';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare form data
    const formData = {
      type: 'contact',
      name,
      email,
      message,
      date: new Date().toISOString(),
      recipientEmail: 'ilana.cunningham16@gmail.com',
      subject: `Contact Form Submission from ${name}`,
    };

    try {
      // Send to Zapier webhook using the helper function
      const success = await sendToZapier(ZAPIER_WEBHOOKS.contact, formData);
      
      if (success) {
        toast.success("Message sent successfully! Ilana will get back to you soon.");
        setName('');
        setEmail('');
        setMessage('');
      } else {
        toast.error("There was an error sending your message. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error sending your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/90 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/60 transition-all duration-200"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/60 transition-all duration-200"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground/90 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/60 transition-all duration-200"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
