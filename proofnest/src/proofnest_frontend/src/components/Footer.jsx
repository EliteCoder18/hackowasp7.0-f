import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTwitter,
  FaGithub,
  FaLinkedinIn,
  FaDiscord,
  FaShieldAlt,
  FaFingerprint,
  FaLock,
  FaHeart,
  FaArrowUp,
  FaEnvelope,
  FaCheck
} from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation variants
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const bubbleVariants = {
    initial: { y: 0, opacity: 0.7 },
    animate: {
      y: -700,
      x: index => Math.sin(index * 0.5) * 40,
      opacity: [0.7, 0.9, 0],
      transition: {
        duration: index => 15 + index * 5,
        repeat: Infinity,
        delay: index => index * 2,
        ease: "linear"
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={bubbleVariants}
            initial="initial"
            animate="animate"
            className="absolute bottom-0 rounded-full bg-gradient-to-tr from-indigo-300/10 to-purple-300/20"
            style={{
              left: `${10 + i * 12}%`,
              width: `${30 + Math.random() * 30}px`,
              height: `${30 + Math.random() * 30}px`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Glossy Top Border */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-300/40 via-purple-600/40 to-pink-300/40 backdrop-blur-sm"></div>

      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={footerVariants}
        className="relative bg-gradient-to-b from-purple-50/90 to-white/90 backdrop-blur-sm"
      >
        {/* Wave Divider */}
        <div className="relative w-full h-24 -mt-1">
          <svg
            className="absolute bottom-0 w-full h-full text-purple-50/90 fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,179.09,96.18,321.39,56.44Z"></path>
          </svg>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 container mx-auto px-6 pt-4 pb-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-16">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="md:col-span-5">
              <div className="flex items-center mb-6 group">
                <motion.div
                  className="mr-4 p-3 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg border border-indigo-100 shadow-md group-hover:shadow-lg group-hover:border-indigo-200 transition-all duration-300"
                  whileHover={{
                    rotate: [0, -10, 10, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <FaFingerprint className="text-indigo-600 text-3xl" />
                </motion.div>
                <h3 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ProofNest
                  </span>
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                We empower creators to securely register and protect their digital masterpieces with elegant blockchain verification, providing immutable proof of ownership and timestamp verification.
              </p>

              {/* Newsletter */}
              <motion.div variants={itemVariants} className="mb-8">
                <h4 className="text-gray-800 font-medium mb-4 text-lg">Subscribe to our newsletter</h4>
                <form onSubmit={handleSubscribe} className="flex">
                  <div className="relative flex-grow">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full pl-10 pr-4 py-3 rounded-l-lg border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-r-lg transform transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <AnimatePresence mode="wait">
                      {isSubscribed ? (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center"
                        >
                          <FaCheck className="mr-2" /> Subscribed
                        </motion.span>
                      ) : (
                        <motion.span
                          key="subscribe"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Subscribe
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </form>
              </motion.div>

              {/* Status Indicator */}
              <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-10">
                <motion.div
                  className="h-3 w-3 rounded-full bg-green-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-sm text-gray-500">All systems operational</span>
              </motion.div>

              {/* Social Icons */}
              <motion.div variants={itemVariants} className="flex space-x-3">
                {[
                  { icon: <FaTwitter className="text-lg" />, href: "https://twitter.com", label: "Twitter", color: "hover:bg-blue-400", hoverColor: "bg-blue-400" },
                  { icon: <FaGithub className="text-lg" />, href: "https://github.com", label: "Github", color: "hover:bg-gray-800", hoverColor: "bg-gray-800" },
                  { icon: <FaLinkedinIn className="text-lg" />, href: "https://linkedin.com", label: "LinkedIn", color: "hover:bg-blue-700", hoverColor: "bg-blue-700" },
                  { icon: <FaDiscord className="text-lg" />, href: "https://discord.com", label: "Discord", color: "hover:bg-indigo-600", hoverColor: "bg-indigo-600" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-gray-600 ${social.color} hover:text-white transition-all duration-300 overflow-hidden`}
                    onHoverStart={() => setHoverIndex(index)}
                    onHoverEnd={() => setHoverIndex(null)}
                    whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)" }}
                  >
                    <AnimatePresence>
                      {hoverIndex === index && (
                        <motion.div
                          className={`absolute inset-0 ${social.hoverColor}`}
                          initial={{ y: 40 }}
                          animate={{ y: 0 }}
                          exit={{ y: 40 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{social.icon}</span>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Links Section */}
            <motion.div variants={itemVariants} className="md:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="inline-block text-indigo-700 font-medium mb-5 text-lg pb-1 border-b-2 border-indigo-200">
                  Product
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "Features", path: "/features" },
                    { name: "Verify", path: "/verify" },
                    { name: "Register", path: "/register" },
                    { name: "Files", path: "/files" },
                    { name: "Pricing", path: "/pricing" }
                  ].map((link, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link
                        to={link.path}
                        className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 transition-all duration-300 inline-block overflow-hidden mr-0 group-hover:mr-2">
                          <span className="text-indigo-600">›</span>
                        </span>
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="inline-block text-indigo-700 font-medium mb-5 text-lg pb-1 border-b-2 border-indigo-200">
                  Company
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: "About Us", path: "/about" },
                    { name: "Contact", path: "/contact" },
                    { name: "Blog", path: "/blog" },
                    { name: "Careers", path: "/careers" },
                    { name: "Partners", path: "/partners" }
                  ].map((link, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link
                        to={link.path}
                        className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 transition-all duration-300 inline-block overflow-hidden mr-0 group-hover:mr-2">
                          <span className="text-indigo-600">›</span>
                        </span>
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Resources & Security Badge */}
              <div>
                <h4 className="inline-block text-indigo-700 font-medium mb-5 text-lg pb-1 border-b-2 border-indigo-200">
                  Resources
                </h4>
                <ul className="space-y-3 mb-8">
                  {[
                    { name: "Documentation", path: "/docs" },
                    { name: "Help Center", path: "/help" },
                    { name: "Feedback", path: "/feedback" },
                    { name: "Status", path: "/status" }
                  ].map((link, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link
                        to={link.path}
                        className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 transition-all duration-300 inline-block overflow-hidden mr-0 group-hover:mr-2">
                          <span className="text-indigo-600">›</span>
                        </span>
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Badge */}
                <motion.div
                  className="bg-gradient-to-br from-white to-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-lg relative overflow-hidden"
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px -10px rgba(99, 102, 241, 0.25)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="absolute right-0 bottom-0 w-20 h-20 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full opacity-50 -mr-6 -mb-6 blur-xl"></div>

                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3 shadow-sm">
                      <FaShieldAlt className="text-indigo-600" />
                    </div>
                    <h5 className="font-medium text-gray-800">Blockchain Secured</h5>
                  </div>

                  <div className="flex items-center text-xs text-indigo-600 mb-1">
                    <FaLock className="mr-2 text-indigo-500" />
                    <span className="font-medium">End-to-end encryption</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    ISO 27001 certified
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Animated divider */}
          <motion.div
            variants={itemVariants}
            className="my-12 relative h-px"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-75"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-600 text-sm mb-4 md:mb-0 flex items-center">
              © {new Date().getFullYear()} ProofNest. Made with <FaHeart className="mx-1 text-pink-500 animate-pulse" /> for creators
            </p>

            <div className="flex flex-wrap justify-center gap-x-8 text-sm text-gray-600">
              {["Privacy Policy", "Terms of Service", "Legal"].map((item, index) => (
                <motion.div key={index} whileHover={{ y: -2 }}>
                  <Link
                    to="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll to top button */}
        <motion.button
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 z-20"
          whileHover={{
            y: -5,
            boxShadow: "0 15px 30px -5px rgba(99, 102, 241, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <FaArrowUp />
        </motion.button>
      </motion.footer>
    </div>
  );
};

export default Footer;
