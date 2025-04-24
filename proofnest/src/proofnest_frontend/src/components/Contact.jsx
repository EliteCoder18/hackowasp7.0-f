import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset submission status after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  // Generate particles for background
  const particles = [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: Math.random() > 0.6 ? "rgba(139, 92, 246, 0.4)" : "rgba(99, 102, 241, 0.3)"
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/50 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
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

      {/* Background patterns */}
      <div className="absolute inset-0 bg-creative-dots"></div>
      <div className="absolute inset-0 bg-creative-lines"></div>
      <div className="absolute inset-0 bg-watercolor opacity-50"></div>

      {/* Constellation particles */}
      <div className="absolute select-none inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full">
          {particles.map((particle, index) => (
            <motion.circle
              key={`particle-${index}`}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size}
              fill={particle.color}
              animate={{
                opacity: [0.4, 1, 0.4],
                r: [particle.size, particle.size + 1.5, particle.size],
                y: [`${particle.y}%`, `${particle.y - 1}%`, `${particle.y}%`]
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Connecting lines between nearby particles */}
          {particles.map((particle, idx) => {
            return particles
              .slice(idx + 1)
              .filter(p => {
                const distance = Math.sqrt(
                  Math.pow(p.x - particle.x, 2) + Math.pow(p.y - particle.y, 2)
                );
                return distance < 20; // Only connect nearby particles
              })
              .map((p, lineIdx) => (
                <motion.line
                  key={`line-${idx}-${lineIdx}`}
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${p.x}%`}
                  y2={`${p.y}%`}
                  strokeWidth="0.5"
                  stroke="rgba(139, 92, 246, 0.2)"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    strokeWidth: ["0.5px", "1px", "0.5px"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))
          })}
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.5,
              delay: 0.2
            }}
            className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/30 mb-4 border border-white/50"
          >
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
              <FaEnvelope className="h-6 w-6" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Get in Touch</h1>
          <motion.div
            className="w-24 h-1 mx-auto my-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          ></motion.div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about ProofNest? We're here to help and would love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1">
            <motion.div
              className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Contact Information
                </h2>

                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Office Location</h3>
                    <p className="text-gray-600">
                      123 Blockchain Avenue<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                    <FaEnvelope className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Email Us</h3>
                    <a href="mailto:hello@proofnest.com" className="text-indigo-600 hover:text-indigo-800 transition">
                      hello@proofnest.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                    <FaPhone className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Call Us</h3>
                    <a href="tel:+1-555-123-4567" className="text-indigo-600 hover:text-indigo-800 transition">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Operating Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9AM - 6PM PST</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>
              </div>

              <div className="h-48 relative mt-4">
                <div className="absolute inset-0 bg-indigo-100 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-indigo-600 font-medium px-6 py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                    Map Integration Coming Soon
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Send Us a Message
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-indigo-300/30 relative overflow-hidden group flex items-center"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 20px 30px -10px rgba(79, 70, 229, 0.4)"
                      }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isSubmitting}
                    >
                      <span className="relative z-10 flex items-center">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <FaPaperPlane className="ml-2" />
                          </>
                        )}
                      </span>

                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                      />
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          &copy; {new Date().getFullYear()} ProofNest • Blockchain Content Verification
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
