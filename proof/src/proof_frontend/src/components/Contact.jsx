import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaComments } from 'react-icons/fa';

function Contact() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          Connect with <span className="text-blue-400">Us</span>
        </h1>
        <div className="w-24 h-1 bg-blue-400 mx-auto mb-6"></div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          We're Here to Help You
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <FaEnvelope className="text-blue-400 mr-3" /> Email Support
            </h2>
            <p className="text-gray-300">
              Reach out to us at{' '}
              <a href="mailto:support@proofnest.com" className="text-blue-400 hover:underline">
                support@proofnest.com
              </a>
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              We respond to email inquiries within 24 hours.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <FaPhone className="text-purple-400 mr-3" /> Call Us
            </h2>
            <p className="text-gray-300">
              Technical Support: <span className="text-purple-400">+1 (555) 123-4567</span>
            </p>
            <p className="text-gray-300 mt-2">
              Business Inquiries: <span className="text-purple-400">+1 (555) 987-6543</span>
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Available Monday-Friday, 9 AM - 5 PM EST
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <FaComments className="text-green-400 mr-3" /> Live Chat
            </h2>
            <p className="text-gray-300">
              Use the live chat feature on our website for instant support
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Chat support is available 24/7 for all registered users
            </p>
            <button className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Start Chat
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <FaMapMarkerAlt className="text-yellow-400 mr-3" /> Visit Us
            </h2>
            <p className="text-gray-300">
              ProofNest Headquarters<br />
              123 Blockchain Avenue<br />
              Tech District, CA 94107<br />
              United States
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Please schedule an appointment before visiting
            </p>
          </div>
        </div>

        <div className="text-center mt-16 p-8 bg-gray-800 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            WE'RE HERE FOR YOU!
          </h2>
          <p className="text-gray-300">
            Our team is dedicated to ensuring a smooth and hassle-free experience for all users. Don't hesitate to get in touch!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;