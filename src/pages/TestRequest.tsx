
import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import TestRequest from '@/components/TestRequest';

const TestRequestPage = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Zapier Webhook Test</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Use this tool to test your Zapier webhook integrations
            </p>
            
            <div className="mb-8">
              <TestRequest />
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TestRequestPage;
