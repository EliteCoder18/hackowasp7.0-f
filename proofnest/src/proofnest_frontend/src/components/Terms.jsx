import React from 'react';
import { motion } from 'framer-motion';
import { FaFileContract } from 'react-icons/fa';

const Terms = () => {
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
                            <FaFileContract className="h-6 w-6" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Terms of Service</h1>
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
                            Welcome to ProofNest. These Terms of Service govern your use of our website and services. By accessing or using ProofNest, you agree to be bound by these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">2. Definitions</h2>
                        <p className="text-gray-600">
                            <strong>"Service"</strong> refers to the ProofNest website and blockchain verification platform.
                        </p>
                        <p className="text-gray-600">
                            <strong>"User"</strong> refers to any individual who accesses or uses the Service.
                        </p>
                        <p className="text-gray-600">
                            <strong>"Content"</strong> refers to any digital assets, creative works, or files uploaded to our Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">3. Account Registration</h2>
                        <p className="text-gray-600">
                            To use certain features of our Service, you may need to register for an account. You agree to provide accurate information and keep your account credentials secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">4. Content Ownership & Rights</h2>
                        <p className="text-gray-600">
                            Users retain all ownership rights to their Content. By uploading Content to our Service, you grant us a limited license to store, process, and verify your Content on the blockchain.
                        </p>
                        <p className="text-gray-600">
                            You represent and warrant that you own or have the necessary rights to the Content you upload, and that your Content does not violate any third-party rights or applicable laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">5. Prohibited Activities</h2>
                        <p className="text-gray-600">
                            You agree not to use our Service to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600">
                            <li>Upload Content that infringes on intellectual property rights</li>
                            <li>Engage in illegal activities or violate applicable laws</li>
                            <li>Attempt to interfere with or disrupt the Service</li>
                            <li>Impersonate other users or entities</li>
                            <li>Distribute malware or harmful code</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
                        <p className="text-gray-600">
                            The Service is provided "as is" and "as available" without warranties of any kind. To the maximum extent permitted by law, we disclaim all implied warranties and shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">7. Changes to Terms</h2>
                        <p className="text-gray-600">
                            We may modify these Terms at any time. We will provide notice of significant changes. Your continued use of the Service constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900">8. Contact Information</h2>
                        <p className="text-gray-600">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p className="text-indigo-600 font-medium">support@proofnest.com</p>
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

export default Terms;
