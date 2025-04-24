import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt } from 'react-icons/fa';

const Privacy = () => {
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

            <div className="max-w-4xl mx-auto px-6 relative z-10">
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
                        className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/30 mb-4 border border-white/50 transform-gpu"
                    >
                        <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
                            <FaShieldAlt className="h-6 w-6" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <motion.div
                        className="w-24 h-1 mx-auto my-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    ></motion.div>
                    <p className="text-gray-600 text-lg">Last updated: May 1, 2023</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/50 p-8 md:p-10 prose prose-lg max-w-none"
                >
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
                        <p className="text-gray-600">
                            This Privacy Policy describes how ProofNest ("we", "our", or "us") collects, uses, and shares information about you in connection with our services. By using ProofNest, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mt-4">2.1 Information You Provide</h3>
                        <p className="text-gray-600">
                            We collect information you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Account information (e.g., username, email address)</li>
                            <li>Content you upload for verification</li>
                            <li>Payment information for processing transactions</li>
                            <li>Communications you send to us</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mt-4">2.2 Information We Collect Automatically</h3>
                        <p className="text-gray-600">
                            When you use our Service, we automatically collect certain information, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Device information (e.g., IP address, browser type)</li>
                            <li>Usage data (e.g., pages visited, time spent on pages)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
                        <p className="text-gray-600">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and manage your account</li>
                            <li>Verify content ownership through blockchain technology</li>
                            <li>Respond to your comments and questions</li>
                            <li>Send you technical notices and updates</li>
                            <li>Protect against fraud and unauthorized activity</li>
                            <li>Analyze usage patterns and trends</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">4. Information Sharing</h2>
                        <p className="text-gray-600">
                            We may share your information with:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Service providers who perform services on our behalf</li>
                            <li>Public blockchain networks (only cryptographic hashes, not your personal data)</li>
                            <li>Legal authorities when required by law</li>
                            <li>Other parties in connection with a business transaction</li>
                        </ul>
                        <p className="text-gray-600 mt-4">
                            We will never sell your personal information to third parties.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">5. Your Rights and Choices</h2>
                        <p className="text-gray-600">
                            You have several rights regarding your personal information:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Access and update your account information</li>
                            <li>Request deletion of your account</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">6. Data Security</h2>
                        <p className="text-gray-600">
                            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">7. Changes to This Privacy Policy</h2>
                        <p className="text-gray-600">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900">8. Contact Us</h2>
                        <p className="text-gray-600">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-indigo-600 font-medium">privacy@proofnest.com</p>
                    </section>
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

export default Privacy;
