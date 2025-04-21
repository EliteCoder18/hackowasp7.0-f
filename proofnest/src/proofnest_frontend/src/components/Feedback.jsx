import React, { useState } from 'react';
import { FaStar, FaShieldAlt } from 'react-icons/fa';

function Feedback() {
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
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      
      // Reset form after submission
      setFormData({
        subject: '',
        message: '',
        rating: 5,
        category: 'general',
        contact_back: false
      });
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Feedback</h1>
          <p className="text-gray-300">We'd love to hear your thoughts about the platform!</p>
        </div>
        
        {/* Anonymous Badge */}
        <div className="bg-gray-800 border border-blue-900 rounded-lg p-4 mb-8 flex items-center">
          <FaShieldAlt className="h-6 w-6 text-blue-400 mr-3" />
          <div>
            <p className="text-blue-300 font-medium">100% Anonymous Feedback</p>
            <p className="text-blue-400 text-sm">Your feedback is completely anonymous. We don't collect any personal information.</p>
          </div>
        </div>
        
        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-gray-300 mb-6">
                Your feedback has been successfully submitted. We appreciate your input!
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-white hover:bg-gray-200 text-black font-medium px-6 py-3 rounded transition duration-200"
              >
                Submit Another Feedback
              </button>
            </div>
          ) : (
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-900 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2" htmlFor="subject">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's your feedback about?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2" htmlFor="category">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Rating <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none mr-1"
                      >
                        {star <= formData.rating ? (
                          <FaStar className="h-8 w-8 text-yellow-400" />
                        ) : (
                          <FaStar className="h-8 w-8 text-gray-700" />
                        )}
                      </button>
                    ))}
                    <span className="ml-2 text-gray-300">{formData.rating}/5</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2" htmlFor="message">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 min-h-[150px]"
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide details about your feedback..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="contact_back"
                    name="contact_back"
                    type="checkbox"
                    checked={formData.contact_back}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                  <label htmlFor="contact_back" className="ml-2 block text-sm text-gray-300">
                    I'd like to be contacted about this feedback (requires login)
                  </label>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium px-6 py-3 rounded transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⟳</span>
                        Sending...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="bg-gray-900 px-8 py-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              We value your feedback and will use it to improve our platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;