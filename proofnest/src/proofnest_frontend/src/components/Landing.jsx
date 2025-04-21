import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaRocket, FaUserFriends } from 'react-icons/fa';

function Landing() {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Hero Section */}
      <div className="w-full py-20 px-4 bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            ProofNest
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The ultimate platform for securing and verifying your digital assets with blockchain technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/login"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20"
            >
              Get Started
            </Link>
            <Link 
              to="/verify"
              className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 border border-gray-700 transition-all duration-200 transform hover:-translate-y-1"
            >
              Verify Content
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose ProofNest?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <FaRocket className="text-2xl text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Fast Registration</h3>
              </div>
              <p className="text-gray-300">
                Register your digital assets in seconds with our streamlined verification process.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <FaShieldAlt className="text-2xl text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Secure Verification</h3>
              </div>
              <p className="text-gray-300">
                Blockchain-backed verification ensures tamper-proof security for your assets.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <FaUserFriends className="text-2xl text-cyan-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">User-Friendly</h3>
              </div>
              <p className="text-gray-300">
                Intuitive interface designed for both beginners and experts in asset management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-white">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-900/50 border border-blue-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-blue-400">1</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Register Your Content</h3>
              <p className="text-gray-400">Upload your files and register them securely on the blockchain with a unique fingerprint.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-purple-900/50 border border-purple-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-purple-400">2</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Get Blockchain Proof</h3>
              <p className="text-gray-400">Receive immutable proof of ownership and timestamps secured by blockchain technology.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-cyan-900/50 border border-cyan-500 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-cyan-400">3</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Verify Anytime</h3>
              <p className="text-gray-400">Check authenticity and ownership of any content using our secure verification system.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-br from-blue-900/50 via-gray-900 to-indigo-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Secure Your Digital Assets?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of creators protecting their work with blockchain technology.
          </p>
          <Link 
            to="/login"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 transform hover:-translate-y-1 inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;