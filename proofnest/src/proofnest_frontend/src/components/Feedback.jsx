import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFingerprint, FaStar, FaShieldAlt, FaCommentAlt, FaPaperPlane } from 'react-icons/fa';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Feedback = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: 5,
    category: 'general',
    contact_back: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const setRating = (rating) => {
    setFormData({
      ...formData,
      rating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);

    setError('');
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

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
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
            className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/30 mb-4 border border-white/50 transform-gpu animate-pulse-glow"
          >
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
              <FaCommentAlt className="h-6 w-6" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Your Feedback</h1>
          <motion.div
            className="w-24 h-1 mx-auto my-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          ></motion.div>
          <p className="text-gray-600 text-lg">We'd love to hear your thoughts about the platform!</p>
        </motion.div>

        {/* Anonymous Badge */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg p-4 mb-8 flex items-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ y: -5, boxShadow: "0 20px 30px -10px rgba(99, 102, 241, 0.15)" }}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg text-white mr-4">
            <FaShieldAlt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-indigo-700 font-medium">100% Anonymous Feedback</p>
            <p className="text-gray-600 text-sm">Your feedback is completely anonymous. We don't collect any personal information.</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {success ? (
            <motion.div
              className="p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-20 w-20 flex items-center justify-center text-white mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-8">
                Your feedback has been successfully submitted. We appreciate your input!
              </p>

              <motion.button
                onClick={() => setSuccess(false)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg shadow-purple-200/50 font-medium hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit Another Feedback
              </motion.button>
            </motion.div>
          ) : (
            <div className="p-8">
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subject">
                    Subject <span className="text-pink-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's your feedback about?"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                    Category <span className="text-pink-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-pink-500">*</span>
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none mr-1"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {star <= formData.rating ? (
                          <FaStar className="h-8 w-8 text-amber-400" />
                        ) : (
                          <FaStar className="h-8 w-8 text-gray-300" />
                        )}
                      </motion.button>
                    ))}
                    <span className="ml-2 text-gray-700">{formData.rating}/5</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
                    Message <span className="text-pink-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200 min-h-[150px]"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide details about your feedback..."
                    required
                  ></textarea>
                </motion.div>

                <motion.div
                  className="flex items-center justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg shadow-lg shadow-purple-200/50 relative overflow-hidden group"
                    whileHover={{ scale: 1.05, boxShadow: "0 15px 30px -5px rgba(139, 92, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                  >
                    {/* Glow overlay */}
                    <motion.div
                      className="absolute inset-0 -z-10"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'mirror'
                      }}
                      style={{
                        background: 'linear-gradient(45deg, rgba(139, 92, 246, 0), rgba(255, 255, 255, 0.3), rgba(139, 92, 246, 0))',
                        backgroundSize: '200% 200%'
                      }}
                    />

                    <span className="relative z-10 flex items-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Submit Anonymous Feedback
                          <FaPaperPlane className="ml-2" />
                        </>
                      )}
                    </span>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-5"
                    />
                  </motion.button>
                </motion.div>
              </form>
            </div>
          )}

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              We value your feedback and will use it to improve our platform
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-gray-600 text-sm"
        >
          &copy; {new Date().getFullYear()} ProofNest • Blockchain Content Verification
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
