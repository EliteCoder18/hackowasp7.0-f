import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaShieldAlt,
  FaPalette,
  FaCopyright,
  FaArrowRight,
  FaChevronDown,
  FaLock,
  FaFingerprint,
  FaRegLightbulb,
  FaCheckCircle,
  FaUsers
} from 'react-icons/fa';
import { MovingGradient, PulsingGradient } from '../ui/MovingGradient';
import img from '../assets/pic1.avif'

const testimonials = [
  {
    content: "ProofNest has revolutionized the way I protect my digital art. It's simple and secure!",
    author: "Jane Doe",
    role: "Digital Artist",
    avatar: "https://via.placeholder.com/150"
  },
  {
    content: "As a musician, ProofNest gives me peace of mind knowing my creations are safe.",
    author: "John Smith",
    role: "Musician",
    avatar: "https://via.placeholder.com/150"
  },
  {
    content: "I love how easy it is to verify my work with ProofNest. Highly recommended!",
    author: "Emily Johnson",
    role: "Writer",
    avatar: "https://via.placeholder.com/150"
  }
]
// Enhanced Gradient Text Component
const GradientText = ({ children, className = "", from = "from-indigo-700", to = "to-purple-600", animate = false }) => {
  return animate ? (
    <motion.span
      className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent inline-block ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: "200% 200%" }}
    >
      {children}
    </motion.span>
  ) : (
    <span className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

// Enhanced Interactive Card Component with 3D tilt effect
const InteractiveCard = ({ icon, title, description, delay = 0 }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;

    // Calculate rotation (limited to a small range for subtle effect)
    setRotateX(-posY * 0.02);
    setRotateY(posX * 0.02);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className="p-8 rounded-2xl shadow-xl border border-gray-50 transform transition-all duration-300 hover:shadow-purple-100 bg-white/90 backdrop-blur-sm overflow-hidden group"
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.3s ease"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>

      <div className="mb-6 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300">{title}</h3>
      </div>

      <p className="text-gray-600 leading-relaxed relative z-10">
        {description}
      </p>

      <motion.div
        className="mt-6 flex items-center text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: -10 }}
        animate={{ x: 0 }}
      >
        <span>Learn more</span>
        <FaArrowRight className="ml-2" />
      </motion.div>
    </motion.div>
  );
};

// Feature Callout Component
const FeatureCallout = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex items-start gap-4"
    >
      <div className="mt-1 p-2 rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Testimonial Component
const Testimonial = ({ content, author, role, avatar, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center mb-4">
        <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <h5 className="font-medium text-gray-900">{author}</h5>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">{content}</p>
      <div className="flex mt-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </motion.div>
  );
};

// Main Function Component
function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const mainRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { value: "99.9%", label: "Verification accuracy" },
    { value: "24/7", label: "Support available" }
  ];

  // Generate particles for background constellation
  const particles = [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: Math.random() > 0.6 ? "rgba(139, 92, 246, 0.6)" : "rgba(99, 102, 241, 0.5)"
  }));

  // Stats counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % stats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = () => {
    navigate('/login');
  };

  const scrollToNext = () => {
    if (mainRef.current) {
      // Scroll to the "How ProofNest Works" section
      const targetSection = document.getElementById("how-proofnest-works");
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative" ref={mainRef}>
      {/* Hero section with enhanced animated background */}
      <div
        id="section-0"
        className="min-h-screen select-none relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-purple-50"
      >
        {/* Advanced background layers */}
        <div className="absolute inset-0 bg-[length:200px_200px]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(99, 102, 241, 0.04) 1px, transparent 1px)`,
            backgroundPosition: "0 0",
            zIndex: 0
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
              transition: {
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 30,
                ease: 'linear'
              }
            }}
          />
        </div>

        {/* Constellation particles */}
        <div className="absolute select-none inset-0 overflow-hidden">
          <svg className="absolute w-full h-full">
            {particles.map((particle, index) => (
              <motion.circle
                key={index}
                cx={`${particle.x}%`}
                cy={`${particle.y}%`}
                r={particle.size}
                fill={particle.color}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  r: [particle.size, particle.size + 1, particle.size]
                }}
                transition={{
                  duration: 3 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 2
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
                ));
            })}
          </svg>
        </div>

        {/* Content */}
        <motion.div
          style={{ scale: scaleHero, opacity: opacityHero }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-32 pb-20"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.5,
              delay: 0.2
            }}
            className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/20 mb-8 border border-white/50 transform-gpu"
          >
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
              <FaFingerprint className="h-9 w-9" />
            </div>
          </motion.div>

          {/* Headline with animated characters */}
          <div className="overflow-hidden select-none">
            <motion.h1
              className="text-6xl md:text-7xl font-serif font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 1,
                type: "spring",
                bounce: 0.3,
                staggerChildren: 0.08
              }}
            >
              <GradientText className='pb-8 select-none' animate={true}>Protect Your Creative Legacy</GradientText>
            </motion.h1>
          </div>

          <div className="relative">
            <MovingGradient
              baseColor="bg-indigo-500"
              highlightColor="bg-purple-500"
              direction="rtl"
              duration={10}
              className="absolute inset-0 z-0"
            />

            <motion.p
              className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-light mb-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              ProofNest empowers creators with elegant blockchain verification for your unique digital masterpieces.
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="my-10"
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1"
                animate={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {stats[currentStat].value}
              </motion.div>
              <div className="text-gray-600">{stats[currentStat].label}</div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="w-28 h-1 mx-auto my-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
          >
            <motion.button
              onClick={scrollToNext}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-200/50 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Scroll Down to see how ProofNest works</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <motion.div
                className="relative z-10"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
              >
                <FaChevronDown />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="section-1" className="bg-white py-24 relative select-none overflow-hidden">
        {/* Decorative elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-50 to-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />

        {/* Background diagonal lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #6366f1, #6366f1 1px, transparent 1px, transparent 10px)',
            backgroundSize: '20px 20px'
          }}
        ></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center mb-20"
          >
            <motion.span
              className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-3"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Powerful Protection
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl mt-0 font-serif font-bold mb-6 text-gray-900"
            >
              Crafted for <GradientText from="from-pink-500" to="to-orange-400">Creators</GradientText>,
              By <GradientText>Creators</GradientText>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600"
            >
              Our platform combines unmatched security with beautiful simplicity,
              ensuring your creative work remains protected while you focus on what matters most.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <InteractiveCard
              icon={<FaPalette className="text-pink-500 text-3xl" />}
              title="Instantly Register Your Creativity"
              description="Capture your designs in a click, with blockchain-backed security from day one. Your work deserves instant protection that grows with your portfolio."
              delay={0.1}
            />

            <InteractiveCard
              icon={<FaShieldAlt className="text-indigo-500 text-3xl" />}
              title="Secure Your Artistic Identity"
              description="Protect your digital masterpieces against misuse with tamper-proof verification that preserves your creative legacy for generations to come."
              delay={0.2}
            />

            <InteractiveCard
              icon={<FaUsers className="text-blue-500 text-3xl" />}
              title="Join the Creator Community"
              description="Connect with fellow artists in a platform crafted for dreamers and visionaries. Express yourself with confidence in a community that values authentic creation."
              delay={0.3}
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-proofnest-works" className="bg-gradient-to-b from-white to-indigo-50/50 py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
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
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}>
        </div>

        <div className="container select-none mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center mb-20"
          >
            <motion.span
              className="inline-block px-4 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-3"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Simple Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold mb-6"
            >
              <span className='bg-black bg-clip-text text-transparent'>How</span>  <span className="bg-gradient-to-r from-pink-500 to bg-orange-400 bg-clip-text text-transparent">ProofNest</span> <span className='bg-black bg-clip-text text-transparent'>Works</span>
            </motion.h2>
          </motion.div>

          {/* Improved process cards with connecting line */}
          <div className="relative">
            {/* Horizontal connecting line */}
            <motion.div
              className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-indigo-100 via-purple-200 to-indigo-100 z-0"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Step 1 Card */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)" }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-50 h-full flex flex-col items-center text-center relative overflow-hidden">
                  {/* Number indicator */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mb-8 relative z-10"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.1)"
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      1
                    </motion.span>
                  </motion.div>

                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-30" />

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Creation</h3>
                  <p className="text-gray-600 mb-8">
                    Simply upload your digital artwork, writing, music, or any creative asset to our secure platform.
                  </p>

                  {/* Enhanced animated icon */}
                  <motion.div
                    className="mt-auto"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileInView={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 1 },
                      scale: { duration: 0.2 }
                    }}
                    viewport={{ once: true }}
                  >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.rect
                        x="15" y="15" width="50" height="50" rx="8"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        animate={{ strokeDashoffset: [0, 20] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      />
                      <motion.path
                        d="M40 30V50M40 50L33 43M40 50L47 43"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 2 Card */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)" }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-50 h-full flex flex-col items-center text-center relative overflow-hidden">
                  {/* Number indicator */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mb-8 relative z-10"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.1)"
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    >
                      2
                    </motion.span>
                  </motion.div>

                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-30" />

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Verification</h3>
                  <p className="text-gray-600 mb-8">
                    We generate a unique cryptographic signature and securely record it on the blockchain.
                  </p>

                  {/* Enhanced animated icon */}
                  <motion.div
                    className="mt-auto"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileInView={{
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                    viewport={{ once: true }}
                  >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.rect
                        x="15" y="20" width="50" height="40" rx="4"
                        stroke="#8B5CF6" strokeWidth="2"
                        fill="transparent"
                        animate={{ stroke: ["#8B5CF6", "#6366F1", "#8B5CF6"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.path
                        d="M15 32H65"
                        stroke="#8B5CF6" strokeWidth="2"
                        animate={{ strokeDasharray: [0, 50], strokeDashoffset: [0, -100] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.path
                        d="M15 48H65"
                        stroke="#8B5CF6" strokeWidth="2"
                        animate={{ strokeDasharray: [0, 50], strokeDashoffset: [0, 100] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.g
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <circle cx="25" cy="40" r="3" fill="#8B5CF6" />
                        <circle cx="40" cy="40" r="3" fill="#8B5CF6" />
                        <circle cx="55" cy="40" r="3" fill="#8B5CF6" />
                      </motion.g>
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3 Card */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)" }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-50 h-full flex flex-col items-center text-center relative overflow-hidden">
                  {/* Number indicator */}
                  <motion.div
                    className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mb-8 relative z-10"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.1)"
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    >
                      3
                    </motion.span>
                  </motion.div>

                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-30" />

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Permanent Protection</h3>
                  <p className="text-gray-600 mb-8">
                    Receive your ownership certificate with timestamped proof that's indisputable and permanent.
                  </p>

                  {/* Enhanced animated icon */}
                  <motion.div
                    className="mt-auto"
                    whileHover={{ scale: 1.1 }}
                    whileInView={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      scale: { repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 0.5 },
                      hover: { duration: 0.2 }
                    }}
                    viewport={{ once: true }}
                  >
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M25 35H55V55C55 56.1046 54.1046 57 53 57H27C25.8954 57 25 56.1046 25 55V35Z"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        animate={{ fill: ["rgba(139, 92, 246, 0)", "rgba(139, 92, 246, 0.05)", "rgba(139, 92, 246, 0)"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.path
                        d="M25 35V29C25 26.2386 27.2386 24 30 24H50C52.7614 24 55 26.2386 55 29V35"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                      />
                      <motion.path
                        d="M33 44L37 48L47 38"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ pathLength: [0, 1], pathOffset: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="22"
                        stroke="#8B5CF6"
                        strokeOpacity="0.2"
                        strokeWidth="1"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action button */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-200 relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Start Protecting My Work</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <FaArrowRight className="relative z-10" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Visual Showcase Section */}
      <div id="section-2" className="select-none relative bg-gradient-to-b from-indigo-50/50 to-purple-50/50 py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-50/50 to-transparent"></div>


        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Why Choose ProofNest
              </motion.span>

              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-900">
                Protect your imagination, <GradientText>forever</GradientText>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Your creative work is an extension of yourself. ProofNest provides a secure, elegant way to protect your intellectual property with blockchain verification that can never be altered or disputed.
              </p>

              <div className="space-y-6 mb-10">
                <FeatureCallout
                  icon={<FaLock />}
                  title="Military-Grade Security"
                  description="Your works are protected by the same blockchain technology trusted by major financial institutions."
                  index={0}
                />
                <FeatureCallout
                  icon={<FaFingerprint />}
                  title="Unique Digital Fingerprint"
                  description="Each creation receives a unique cryptographic signature that cannot be duplicated."
                  index={1}
                />
                <FeatureCallout
                  icon={<FaRegLightbulb />}
                  title="Simple Verification Process"
                  description="Anyone can easily verify the authenticity and ownership of your work in seconds."
                  index={2}
                />
                <FeatureCallout
                  icon={<FaCheckCircle />}
                  title="Permanent Record"
                  description="Your proof of creation exists forever on the blockchain, immune to tampering."
                  index={3}
                />
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                onClick={handleNavigate}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-200 relative overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start Protecting My Work</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <FaArrowRight className="relative z-10" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Enhanced card showcase with multiple layers for depth */}
              <motion.div
                className="absolute top-8 -left-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 w-full h-full transform -rotate-6 z-0"
                animate={{ rotate: [-6, -5, -6], y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              ></motion.div>

              <motion.div
                className="absolute top-4 -right-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 w-full h-full transform rotate-3 z-0"
                animate={{ rotate: [3, 4, 3], y: [0, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              ></motion.div>

              <motion.div
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 z-10"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <img
                    src={img}
                    alt="Digital artwork verification"
                    className="w-full h-auto"
                  />

                  <motion.div
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-indigo-600 border border-indigo-100 flex items-center gap-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    Blockchain Secured
                  </motion.div>
                </div>

                <div className="p-8">
                  <div className="flex items-center">
                    <motion.div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      A
                    </motion.div>
                    <div className="ml-4">
                      <div className="text-sm text-gray-500">Verified Artist</div>
                      <div className="font-medium text-gray-900">Alexandra Gallagher</div>
                    </div>
                    <motion.div
                      className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                      Verified
                    </motion.div>
                  </div>

                  {/* Certificate mockup */}
                  <motion.div
                    className="mt-6 pt-6 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-gray-500">Verification Hash</div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">8a721cf...9e42b</div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-gray-500">Created & Verified</div>
                      <div className="text-xs font-medium">June 12, 2023 at 14:32 GMT</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Blockchain</div>
                      <div className="text-xs font-medium">Internet Computer</div>
                    </div>

                    {/* QR Code*/}
                    <div className="mt-4 flex items-center justify-center">
                      <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-70">
                        <rect x="10" y="10" width="20" height="20" fill="#000" />
                        <rect x="50" y="10" width="20" height="20" fill="#000" />
                        <rect x="10" y="50" width="20" height="20" fill="#000" />
                        <rect x="40" y="40" width="30" height="5" fill="#000" />
                        <rect x="40" y="50" width="5" height="20" fill="#000" />
                        <rect x="50" y="55" width="15" height="5" fill="#000" />
                        <rect x="65" y="50" width="5" height="20" fill="#000" />
                        <rect x="50" y="65" width="15" height="5" fill="#000" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div id="call-to-action" className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <PulsingGradient
            baseColor="bg-indigo-400"
            highlightColor="bg-white"
            className="h-full"
          />
        </div>

        {/* Animated circles */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"
            style={{ top: '-10%', right: '-5%' }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
            style={{ bottom: '-10%', left: '10%' }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </div>

        <div className="container select-none mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(255,255,255,0.3)",
                  "0 0 0 20px rgba(255,255,255,0)",
                  "0 0 0 0 rgba(255,255,255,0)"
                ],
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <FaFingerprint className="text-white text-4xl" />
            </motion.div>

            <motion.h2
              className="text-3xl md:text-5xl font-serif font-bold mb-6 text-white"
              animate={{
                textShadow: [
                  "0 0 5px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 5px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Your Art Deserves Proof
            </motion.h2>

            <motion.p
              className="text-indigo-100 mb-10 text-xl leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
            >
              Join thousands of creators who trust ProofNest to protect their digital legacy.
              Start safeguarding your creative assets today with our powerful blockchain verification.
            </motion.p>

            <motion.button
              onClick={handleNavigate}
              className="relative px-10 py-5 rounded-xl bg-white text-indigo-700 font-medium text-lg flex items-center justify-center gap-2 mx-auto shadow-xl hover:shadow-2xl transition-all overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.25)" }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white via-indigo-100 to-white w-[200%]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <span className="relative z-10 font-bold">Start Protecting My Work</span>
              <FaArrowRight className="relative z-10" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
