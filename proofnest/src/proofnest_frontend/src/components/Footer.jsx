import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black opacity-100 text-white p-8 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      
      {/* Top section with subscription */}
     
      
      {/* Footer links */}
      <div className="mx-auto px-4 container">
        {/* Wave decoration at the top */}
        

        {/* Main Footer Content */}
        <div className="flex flex-wrap mb-0 text-left lg:text-left select-none">
          {/* About Section */}
          <div className="mb-0 lg:mb-0 px-4  w-full lg:w-4/12">
            <div className="group">
              <h4 className="mb-4 font-bold text-3xl group-hover:scale-105 transition-transform duration-300">Proofnest</h4>
              <div className="bg-white mb-4 rounded-full w-12 group-hover:w-24 h-1 transition-all duration-300"></div>
            </div>
            <p className="mb-1 text-gray-100 hover:text-white transition-colors duration-300">
            ProofNest empowers creators to securely register and manage their intellectual property, ensuring ownership and control in the digital age
            </p>
            
            <div className="flex space-x-3 mt-6 mb-3">
              
            </div>
          </div>
          
          {/* Quick Links */}
          <div className=" lg:mb-0 pl-40 w-full lg:w-4/12">
            <div className="group">
              <h5 className="mb-4 font-bold text-xl group-hover:scale-105 transition-transform duration-300">Quick Links</h5>
              <div className="bg-white mb-4 rounded-full w-12 group-hover:w-20 h-1 transition-all duration-300"></div>
            </div>
            <ul className="list-none">
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/App/item-listings"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  Browse Listings
                </Link>
              </li>
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/App/sell"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  List an Item
                </Link>
              </li>
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/App/favorites"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  Favorites
                </Link>
              </li>
             
            </ul>
          </div>
          
          {/* Resources */}
          <div className="pl-40 w-full lg:w-4/12">
            <div className="group">
              <h5 className="mb-4 font-bold text-xl group-hover:scale-105 transition-transform duration-300">Resources</h5>
              <div className="bg-white mb-4 rounded-full w-12 group-hover:w-20 h-1 transition-all duration-300"></div>
            </div>
            <ul className="list-none">
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/about"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  About Us
                </Link>
              </li>
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/contact"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  Contact
                </Link>
              </li>
              <li className="mb-3">
                <Link 
                  className="group flex items-center hover:pl-2 text-gray-100 hover:text-white transition-colors duration-300"
                  to="/feedback"
                >
                  <span className="inline-block mr-0 group-hover:mr-1 w-0 group-hover:w-4 overflow-hidden transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  Feedback
                </Link>
              </li>
             
            </ul>
          </div>
        </div>
        
        
        
        {/* Divider */}
        <hr className="mt-0 mb-2 border-white border-opacity-20" />
        
        {/* Copyright */}
        <div className="flex flex-wrap justify-center md:justify-between items-center">
          <div className="mx-auto md:mx-0 mb-4 md:mb-0 px-4 w-full md:w-4/12 md:text-left text-center">
            <div className="text-gray-100 text-sm">
              © {new Date().getFullYear()} Proofnest. All rights reserved.
            </div>
          </div>
          
          <div className="mx-auto md:mx-0 px-4 w-full md:w-8/12 text-center md:text-right">
            <div className="flex flex-wrap justify-center md:justify-end">
              <Link to="/home" className="px-3 py-1 text-gray-100 hover:text-white text-sm transition-colors duration-300">Terms</Link>
              <Link to="/home" className="px-3 py-1 text-gray-100 hover:text-white text-sm transition-colors duration-300">Privacy</Link>
              <Link to="/home" className="px-3 py-1 text-gray-100 hover:text-white text-sm transition-colors duration-300">Cookies</Link>
              <Link to="/home" className="px-3 py-1 text-gray-100 hover:text-white text-sm transition-colors duration-300">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
