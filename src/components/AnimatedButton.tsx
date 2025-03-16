
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ to, children, className, external = false }) => {
  const baseClasses = 
    "relative px-6 py-3 overflow-hidden rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg active:shadow-sm";
  
  if (external) {
    return (
      <a 
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          baseClasses,
          "bg-accent text-accent-foreground hover:bg-accent/90",
          className
        )}
      >
        <span className="relative z-10">{children}</span>
      </a>
    );
  }
  
  return (
    <Link 
      to={to}
      className={cn(
        baseClasses,
        "bg-accent text-accent-foreground hover:bg-accent/90",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
};

export default AnimatedButton;
