
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Vortex } from '../components/ui/vortex'; // Import the Vortex component
import { FaGoogle, FaGithub } from 'react-icons/fa'; // Import Google and GitHub icons

function Landing() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/auth'); // Replace '/auth' with the route to your authentication page
  };

  return (
    <Vortex
      particleCount={1000} // Increase particle count for a denser effect
      baseSpeed={0.5} // Adjust speed for smoother animation
      rangeSpeed={2}
      baseRadius={1}
      rangeRadius={3}
      backgroundColor="#000000" // Set background color to black
      containerClassName="absolute inset-0 h-full w-full"
    >
      <div className="relative min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 overflow-hidden space-y-8">
        {/* Hero Section */}
        <motion.div
          className="text-center z-10 relative"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4">Welcome to ProofNest</h1>
          <p className="text-lg text-gray-400">
            Securely register and verify your digital assets with ease.
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 1, delayChildren: 0.3, staggerChildren: 0.2 }}
        >
          <motion.div
            className="bg-gray-900 bg-opacity-80 p-4 rounded-xl shadow-md border border-white/10 transform transition-transform duration-300 hover:scale-105 hover:border-white/30 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-200">Fast Registration</h2>
            <p className="text-gray-400 text-sm">
              Quickly register your files and assets with our secure platform.
            </p>
          </motion.div>
          <motion.div
            className="bg-gray-900 bg-opacity-80 p-4 rounded-xl shadow-md border border-white/10 transform transition-transform duration-300 hover:scale-105 hover:border-white/30 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-200">Secure Verification</h2>
            <p className="text-gray-400 text-sm">
              Verify the authenticity of your assets anytime, anywhere.
            </p>
          </motion.div>
          <motion.div
            className="bg-gray-900 bg-opacity-80 p-4 rounded-xl shadow-md border border-white/10 transform transition-transform duration-300 hover:scale-105 hover:border-white/30 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-200">User-Friendly</h2>
            <p className="text-gray-400 text-sm">
              Enjoy a seamless and intuitive user experience.
            </p>
          </motion.div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          className="relative w-full max-w-md bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-md border border-white/10 hover:border-white/30 overflow-hidden z-10 transition-transform duration-300 hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.1)]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-center text-gray-200">
            Ready to Secure Your Assets?
          </h3>
          <motion.button
            onClick={handleNavigate}
            className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <FaGoogle className="text-xl" />
            <span>Let's Get Started</span>
            <FaGithub className="text-xl" />
          </motion.button>
        </motion.div>
      </div>
    </Vortex>
  );
}

export default Landing;
