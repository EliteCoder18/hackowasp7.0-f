import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const Vortex = ({ children, className = "" }) => {
  // Generate random bubbles
  const bubbles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 120 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 20 + 20,
    }));
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black flex items-center justify-center ${className}`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient bubbles */}
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full opacity-10"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              background: `radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, rgba(67, 56, 202, 0.1) 70%, transparent 100%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{
              duration: bubble.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.delay,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(90deg, #8b5cf6 1px, transparent 1px), linear-gradient(#8b5cf6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
