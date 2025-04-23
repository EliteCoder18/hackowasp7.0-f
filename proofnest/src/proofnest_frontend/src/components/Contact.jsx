import React from 'react';
import { motion } from 'framer-motion';
import { FaFingerprint, FaEnvelope, FaPhoneAlt, FaCommentAlt, FaMapMarkerAlt } from 'react-icons/fa';
import img3 from '../assets/pic3.avif'

function ContactSupport() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };


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
        className="relative h-[50vh] overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img
              src={img3}
              alt="Support Banner"
              className="w-full h-full object-cover filter opacity-15 brightness-90"
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
              Connect with Us
            </motion.h1>
            
            <motion.div 
              className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            ></motion.div>
            
            <motion.p 
              className="text-xl text-gray-800 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              We're Here to Help You
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative mx-auto px-4 md:px-6 pt-6 pb-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md mx-auto p-6 md:p-12 rounded-2xl max-w-4xl border border-white/50 shadow-xl"
        >
          <motion.p {...fadeIn} className="text-gray-700 text-lg mb-12 text-center">
            At <span className="font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ProofNest</span>, we value our community and strive to provide the best support possible. If you have any questions, issues, or need assistance, feel free to reach out to us.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              {...fadeIn} 
              className="group bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl transition-all duration-300 border border-indigo-100 hover:shadow-lg hover:border-indigo-200"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200/40 text-white">
                <FaEnvelope className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Email Support</h2>
              <p className="text-gray-600">
                Reach out to us at{' '}
                <a href="mailto:hostelhustle77@gmail.com" className="text-indigo-600 hover:text-purple-600 transition-colors font-medium">
                  team@proofnest.com
                </a>
              </p>
            </motion.div>

            <motion.div 
              {...fadeIn} 
              className="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl transition-all duration-300 border border-purple-100 hover:shadow-lg hover:border-purple-200"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-200/40 text-white">
                <FaPhoneAlt className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Call Us</h2>
              <p className="text-gray-600">
                Our support team is available at{' '}
                <span className="text-indigo-600 font-medium">+91 XXXXXXXXXX</span>
              </p>
            </motion.div>

            <motion.div 
              {...fadeIn} 
              className="group bg-gradient-to-br from-pink-50 to-white p-6 rounded-xl transition-all duration-300 border border-pink-100 hover:shadow-lg hover:border-pink-200"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-200/40 text-white">
                <FaCommentAlt className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Live Chat</h2>
              <p className="text-gray-600">
                Use the live chat feature on our website for instant support
              </p>
            </motion.div>

            <motion.div 
              {...fadeIn} 
              className="group bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl transition-all duration-300 border border-amber-100 hover:shadow-lg hover:border-amber-200"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/40 text-white">
                <FaMapMarkerAlt className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Visit Us</h2>
              <p className="text-gray-600">
                Find us at <span className="text-indigo-600 font-medium">Hostel Block A, Room 102</span>
              </p>
            </motion.div>
          </div>

          <motion.div {...fadeIn} className="text-center mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-serif font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WE'RE HERE FOR YOU!
            </h2>
            <p className="text-gray-700 mb-8">
              Our team is dedicated to ensuring a smooth and hassle-free experience for all users. Don't hesitate to get in touch!
            </p>
            
            <motion.form 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Your Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                  placeholder="What's this about?"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Your Message</label>
                <textarea 
                  className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none min-h-[150px]"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <motion.button
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg shadow-lg shadow-purple-200/50 relative overflow-hidden group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
              >
                <span className="relative z-10">Send Message</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>
        
        <div className="mt-16 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;
