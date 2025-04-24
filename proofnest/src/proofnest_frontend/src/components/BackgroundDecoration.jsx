import React from 'react';
import { motion } from 'framer-motion';

const BackgroundDecoration = () => (
  <>
    {/* Animated blobs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full bg-indigo-100/30 blur-3xl"
        style={{ top: '20%', left: '-20%' }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 20, 0],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-purple-100/20 blur-3xl"
        style={{ bottom: '-10%', right: '-10%' }}
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -30, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
    {/* Dots pattern */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none z-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}
    />
  </>
);

export default BackgroundDecoration;
