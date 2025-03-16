
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PaymentButtonProps {
  title: string;
  value: string;
  link?: string;
  className?: string;
  icon: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  title, 
  value, 
  link, 
  className,
  icon
}) => {
  const content = (
    <div className="flex flex-col items-center space-y-2 p-4 w-full">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-white rounded-xl shadow-md border border-muted/80 overflow-hidden w-full max-w-xs hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {link ? (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
};

export default PaymentButton;
