import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaTags, FaClock, FaArrowRight, FaBook } from 'react-icons/fa';
import img4 from '../assets/photo-1639322537504-6427a16b0a28.jpeg'
import img5 from '../assets/photo-1568952433726-3896e3881c65.jpeg'
import img6 from '../assets/img66.jpeg'
import img7 from '../assets/img77.jpeg'
const Blog = () => {
    // Sample blog posts data - in a real app, this would come from an API
    const blogPosts = [
        {
            id: 1,
            title: "How Blockchain Protects Creative Work",
            excerpt: "Learn how blockchain technology provides tamper-proof verification for digital creations and protects artists' rights in the digital age.",
            author: "Alex Johnson",
            date: "May 12, 2023",
            readTime: "5 min read",
            category: "Technology",
            image: img4 // Fix: removed the object wrapping
        },
        {
            id: 2,
            title: "Copyright Protection in the Digital Era",
            excerpt: "Navigating the complexities of copyright laws and how ProofNest simplifies protecting your creative assets.",
            author: "Mira Patel",
            date: "April 28, 2023",
            readTime: "8 min read",
            category: "Legal",
            image: img5 // Fix: removed the object wrapping
        },
        {
            id: 3,
            title: "NFTs and Creative Ownership",
            excerpt: "Understanding the relationship between NFTs, blockchain verification, and establishing provenance for digital artwork.",
            author: "Chris Lee",
            date: "June 5, 2023",
            readTime: "6 min read",
            category: "Digital Art",
            image: img6 // Fix: removed the object wrapping
        },
        {
            id: 4,
            title: "Royalty Management for Independent Artists",
            excerpt: "How to track and manage royalties for your creative work using blockchain-based verification systems.",
            author: "Jordan Smith",
            date: "May 30, 2023",
            readTime: "7 min read",
            category: "Business",
            image: img7 // Fix: removed the object wrapping
        }
    ];

    // Generate particles for background
    const particles = [...Array(30)].map(() => ({
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
                </svg>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
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
                            <FaBook className="h-6 w-6" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">ProofNest Blog</h1>
                    <motion.div
                        className="w-24 h-1 mx-auto my-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    ></motion.div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">Insights on blockchain verification, digital ownership, and protecting your creative assets</p>
                </motion.div>

                {/* Featured post */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="h-64 md:h-auto overflow-hidden relative">
                                <img
                                    src= {img4}
                                    alt="Featured post"
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Featured
                                </div>
                            </div>
                            <div className="p-8 md:p-10 flex flex-col justify-center">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <span className="flex items-center"><FaCalendarAlt className="mr-2" /> June 15, 2023</span>
                                    <span className="mx-3">•</span>
                                    <span className="flex items-center"><FaClock className="mr-2" /> 10 min read</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Future of Creative Ownership: Blockchain Verification</h2>
                                <p className="text-gray-600 mb-6">Discover how the blockchain is revolutionizing the way creators protect, monetize, and establish provenance for their digital works in an increasingly online world.</p>
                                <motion.button
                                    whileHover={{ scale: 1.05, x: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="self-start flex items-center text-indigo-600 font-medium group"
                                >
                                    Read Article
                                    <FaArrowRight className="ml-2 group-hover:ml-3 transition-all" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 ml-1">Latest Articles</h2>

                {/* Blog post grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (index * 0.1), duration: 0.6 }}
                            whileHover={{ y: -8, boxShadow: "0 20px 30px -10px rgba(99, 102, 241, 0.15)" }}
                            className="bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/50 group"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{post.category}</span>
                                    <span className="flex items-center"><FaCalendarAlt className="mr-1" /> {post.date}</span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{post.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                                    <span className="flex items-center text-sm text-gray-500">
                                        <FaUser className="mr-1" /> {post.author}
                                    </span>
                                    <span className="flex items-center text-sm text-gray-500">
                                        <FaClock className="mr-1" /> {post.readTime}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter signup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="my-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100/50 p-8 md:p-10"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-6 md:mb-0 md:mr-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to our newsletter</h3>
                            <p className="text-gray-600">Get the latest articles and updates delivered to your inbox.</p>
                        </div>
                        <div className="w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition duration-200"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md shadow-indigo-500/20"
                                >
                                    Subscribe
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-8 text-center text-gray-600 text-sm border-t border-gray-200/50 pt-8"
                >
                    &copy; {new Date().getFullYear()} ProofNest • Blockchain Content Verification
                </motion.div>
            </div>
        </div>
    );
};

export default Blog;
