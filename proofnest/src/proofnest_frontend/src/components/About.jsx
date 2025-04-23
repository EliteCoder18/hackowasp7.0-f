import React from 'react';
import { motion } from 'framer-motion';
import { FaFingerprint, FaShieldAlt, FaCode, FaPaintBrush, FaFileAlt, FaLock } from 'react-icons/fa';
import img2 from '../assets/pic2.avif'

export default function AboutUs() {
  const sections = [
    {
      title: "Our Mission",
      icon: <FaShieldAlt className="text-indigo-600" />,
      content: "ProofNest is a platform that empowers creators—artists, developers, and innovators—to securely register, manage, and monetize their intellectual property. By providing a seamless and user-friendly interface, ProofNest ensures that your original works are protected, giving you peace of mind and control over your creations."
    },
    {
      title: "How It Works",
      icon: <FaCode className="text-purple-600" />,
      isList: true,
      content: [
        "Sign up on the ProofNest platform to access your personal dashboard.",
        "Submit your creative content—be it artwork, code, designs, or other original materials—through a secure upload process.",
        "Upon upload, your work is automatically timestamped, establishing a verifiable record of creation.",
        "Your submissions are stored securely, ensuring that your intellectual property remains protected and accessible only to you.",
        "Organize your works within your dashboard, and choose to share them with others or keep them private, depending on your preferences."
      ]
    },
    {
      title: "Our Values",
      icon: <FaLock className="text-pink-600" />,
      content: "Empowering creators to protect, manage, and monetize their intellectual property with ease and confidence."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 relative overflow-hidden">
      {/* Decorative elements similar to landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Connecting dots pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}>
      </div>
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[50vh] md:h-[60vh] overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img
              src={img2}
              alt="Creative workspace"
              className="w-full h-full object-cover filter brightness-100 opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-purple-50/70 to-slate-50"></div>
          </motion.div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center z-10 bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl border border-white/50 max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                bounce: 0.5,
                delay: 0.3
              }}
              className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/20 mb-6 border border-white/50"
            >
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
                <FaFingerprint className="h-8 w-8" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              About ProofNest
            </motion.h1>
            
            <motion.div 
              className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            ></motion.div>
            
            <motion.p 
              className="text-lg text-gray-800 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Secure your artwork and showcase your talent with confidence.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative mx-auto px-4 md:px-6 py-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md mx-auto p-6 md:p-12 rounded-2xl max-w-5xl border border-white/50 shadow-xl"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="mb-12 last:mb-0 group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 p-6 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {section.title}
                </h2>
              </div>
              
              {section.isList ? (
                <ul className="list-disc list-inside space-y-3 text-gray-700 ml-2">
                  {section.content.map((item, i) => (
                    <motion.li 
                      key={i} 
                      className="group-hover:text-gray-900 transition-colors duration-300 pl-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                  {section.content}
                </p>
              )}
              
              {index !== sections.length - 1 && (
                <div className="border-b border-gray-200 mt-12"></div>
              )}
            </motion.div>
          ))}

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 pt-8 border-t border-gray-200"
          >
            <h2 className="text-2xl font-serif font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200/40">
                  <FaShieldAlt className="text-white h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Security</h3>
                <p className="text-gray-600">Your work is protected with immutable blockchain timestamps that cannot be altered.</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-200/40">
                  <FaPaintBrush className="text-white h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Creator Control</h3>
                <p className="text-gray-600">Maintain full ownership and control over who can access your creative works.</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-pink-200/40">
                  <FaFileAlt className="text-white h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Royalty Management</h3>
                <p className="text-gray-600">Set up royalty requirements for your work and manage licensing with built-in tools.</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-16 pt-8 border-t border-gray-200"
          >
            <h2 className="text-2xl font-serif font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            
            <p className="text-gray-700 mb-8">
              For inquiries, collaborations, or support, contact us at{' '}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hostelhustle77@gmail.com&su=Inquiry&body=Hello,%20I%20would%20like%20to%20enquire%20about..."
                className="text-indigo-600 hover:text-purple-600 font-medium transition-colors duration-300"
              >
                team@proofnest.com
              </a>
            </p>
            
            <motion.button
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>
    </div>
  );
}
