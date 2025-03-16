
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "@/components/AnimatedButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 md:p-12 max-w-md w-full text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-foreground/80 mb-8">Oops! Page not found</p>
        <AnimatedButton 
          to="/" 
          className="mx-auto inline-block bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Return to Home
        </AnimatedButton>
      </motion.div>
    </div>
  );
};

export default NotFound;
