import React from 'react';
import { motion } from 'framer-motion';
import { FaFingerprint, FaShieldAlt, FaCode, FaPaintBrush, FaFileAlt, FaLock } from 'react-icons/fa';
import img2 from '../assets/pic2.avif'

export default function AboutUs() {

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Blockchain innovator with 10+ years in digital rights management",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Former Google engineer specializing in distributed systems and security",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Michael Rodriguez",
      role: "Design Lead",
      bio: "Award-winning UI/UX designer passionate about creative communities",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Jasmine Patel",
      role: "Blockchain Architect",
      bio: "Smart contract specialist with background in digital art marketplace",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
    }
  ];

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

  const particles = [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: Math.random() > 0.6 ? "rgba(139, 92, 246, 0.4)" :
      Math.random() > 0.3 ? "rgba(99, 102, 241, 0.3)" :
        "rgba(236, 72, 153, 0.3)"
  }));

  const polygons = [
    { points: "0,0 0,100 100,0", fill: "rgba(99, 102, 241, 0.05)" },
    { points: "100,100 0,100 100,0", fill: "rgba(139, 92, 246, 0.06)" },
    { points: "50,0 100,50 50,100 0,50", fill: "rgba(219, 39, 119, 0.04)" },
    { points: "20,20 80,20 80,80 20,80", fill: "rgba(99, 102, 241, 0.03)" },
  ];

  const blobPaths = [
    "M45.3,-75.3C59.6,-68.5,72.9,-57.9,80.3,-44.1C87.7,-30.3,89.4,-13.4,87.9,3.1C86.5,19.7,82,35.8,72.9,49.1C63.7,62.3,49.9,72.8,34.7,76.3C19.5,79.8,2.9,76.3,-12.8,71.7C-28.5,67,-43.4,61.1,-54.7,51.2C-66.1,41.3,-73.9,27.2,-78,11.6C-82.1,-4.1,-82.5,-21.3,-76.2,-36C-69.9,-50.7,-57,-62.9,-42.7,-69.5C-28.5,-76.2,-12.7,-77.2,2,-80.4C16.7,-83.5,31,-82.1,45.3,-75.3Z",
    "M48.2,-71.2C64.9,-65.1,82.5,-55.2,87.4,-41.2C92.3,-27.2,84.5,-9.1,79,7.9C73.6,24.9,70.4,41,62.1,54.9C53.9,68.8,40.6,80.5,25.7,83.5C10.7,86.5,-5.9,81,-22.4,75.8C-38.9,70.6,-55.3,65.8,-64.7,54.7C-74.1,43.6,-76.5,26.3,-78.3,9.3C-80,-7.8,-81,-24.7,-74.5,-37.9C-68,-51.1,-53.9,-60.6,-39.7,-67.8C-25.5,-75,-12.7,-80,1.9,-83C16.6,-85.9,31.5,-77.3,48.2,-71.2Z"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/50 relative overflow-hidden py-16">
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

      <div className="absolute inset-0 bg-creative-dots"></div>
      <div className="absolute inset-0 bg-creative-lines"></div>
      <div className="absolute inset-0 bg-watercolor opacity-50"></div>
      <div className="absolute inset-0 noise-texture"></div>

      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        {polygons.map((polygon, index) => (
          <svg
            key={`polygon-${index}`}
            className="absolute"
            width="100%"
            height="100%"
            style={{
              transform: `rotate(${index * 30}deg) scale(${1 + index * 0.3})`,
              opacity: 0.3 - index * 0.05
            }}
            preserveAspectRatio="none"
          >
            <motion.polygon
              points={polygon.points}
              fill={polygon.fill}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 10 + index * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        ))}

        {blobPaths.map((path, index) => (
          <svg
            key={`blob-${index}`}
            className="absolute w-full h-full opacity-30"
            viewBox="0 0 200 200"
            style={{
              top: `${-20 + index * 10}%`,
              left: `${-20 + index * 15}%`,
              transform: `rotate(${index * 45}deg) scale(${0.6 + index * 0.2})`,
            }}
          >
            <motion.path
              d={path}
              fill={index % 2 === 0 ? "rgba(139, 92, 246, 0.03)" : "rgba(99, 102, 241, 0.04)"}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 1, 0],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{
                duration: 20 + index * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              transform="translate(100 100)"
            />
          </svg>
        ))}
      </div>

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

          {particles.map((particle, idx) => {
            return particles
              .slice(idx + 1)
              .filter(p => {
                const distance = Math.sqrt(
                  Math.pow(p.x - particle.x, 2) + Math.pow(p.y - particle.y, 2)
                );
                return distance < 20;
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

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden p-8 md:p-12 border border-white/50 shadow-xl max-w-5xl mx-auto"
          >
            <div className="text-center">
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
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md mx-auto p-6 md:p-12 rounded-2xl max-w-5xl border border-white/50 shadow-xl mb-16"
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

        

        <div className="text-center text-gray-500 text-sm mt-8">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>
    </div>
  );
}
