import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Vortex } from '../components/ui/vortex';
import { FaGoogle, FaGithub, FaShieldAlt, FaRocket, FaUserFriends } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Landing() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/auth');
  };

  return (
    <Vortex
      particleCount={800}
      baseSpeed={0.4}
      rangeSpeed={1.5}
      baseRadius={1}
      rangeRadius={2}
      backgroundColor="#000000"
    >
      <Navbar />
      <div className="relative min-h-screen bg-transparent text-white flex flex-col items-center justify-center px-4 py-20 md:px-8 overflow-hidden space-y-16">
        {/* Hero Section */}
        <motion.div
          className="text-center z-10 relative max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="bg-white text-transparent bg-clip-text">ProofNest</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            The ultimate platform for securing and verifying your digital assets with blockchain technology.
          </motion.p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 relative w-full max-w-6xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          transition={{ duration: 0.6, delayChildren: 0.3, staggerChildren: 0.2 }}
        >
          <motion.div
            className="backdrop-blur-md bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-105 hover:border-purple-500/30 hover:shadow-purple-500/20 hover:shadow-lg"
            whileHover={{ y: -5 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <div className="flex items-center mb-4">
              <FaRocket className="text-2xl text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Fast Registration</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Register your digital assets in seconds with our streamlined verification process.
            </p>
          </motion.div>
          
          <motion.div
            className="backdrop-blur-md bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-105 hover:border-blue-500/30 hover:shadow-blue-500/20 hover:shadow-lg"
            whileHover={{ y: -5 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <div className="flex items-center mb-4">
              <FaShieldAlt className="text-2xl text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Secure Verification</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Blockchain-backed verification ensures tamper-proof security for your assets.
            </p>
          </motion.div>
          
          <motion.div
            className="backdrop-blur-md bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 transform transition-all duration-300 hover:scale-105 hover:border-cyan-500/30 hover:shadow-cyan-500/20 hover:shadow-lg"
            whileHover={{ y: -5 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <div className="flex items-center mb-4">
              <FaUserFriends className="text-2xl text-cyan-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">User-Friendly</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Intuitive interface designed for both beginners and experts in asset management.
            </p>
          </motion.div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          className="relative w-full max-w-md backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-xl border border-white/10 overflow-hidden z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-semibold mb-6 text-center text-white">
            Ready to Secure Your Assets?
          </h3>
          <motion.button
            onClick={handleNavigate}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-500 hover:to-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
            whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">Get Started Now</span>
          </motion.button>
          <div className="flex justify-center mt-6 space-x-4">
            <motion.div whileHover={{ scale: 1.2, color: '#4285F4' }}>
              <FaGoogle className="text-2xl text-gray-300 cursor-pointer" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.2, color: '#ffffff' }}>
              <FaGithub className="text-2xl text-gray-300 cursor-pointer" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </Vortex>
  );
}

export default Landing;
