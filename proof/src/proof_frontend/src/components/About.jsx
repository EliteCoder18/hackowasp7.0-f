import React from 'react';

function About() {
  const sections = [
    {
      title: "Our Mission",
      content: "ProofNest is a platform that empowers creators—artists, developers, and innovators—to securely register, manage, and monetize their intellectual property. By providing a seamless and user-friendly interface, ProofNest ensures that your original works are protected, giving you peace of mind and control over your creations."
    },
    {
      title: "How It Works",
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
      content: "Empowering creators to protect, manage, and monetize their intellectual property with ease and confidence."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">ProofNest</span>
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-600 mx-auto mb-6"></div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Secure your artwork and showcase your talent with confidence.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700">
        {sections.map((section, index) => (
          <div key={index} className="mb-12 last:mb-0 hover:bg-gray-700 p-6 rounded-lg transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-white">{section.title}</h2>
            
            {section.isList ? (
              <ul className="list-disc list-inside space-y-3 text-gray-300">
                {section.content.map((item, i) => (
                  <li key={i} className="transition-colors duration-300">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300 leading-relaxed transition-colors duration-300">
                {section.content}
              </p>
            )}
            
            {index !== sections.length - 1 && <div className="border-b border-gray-700 mt-12"></div>}
          </div>
        ))}

        {/* Contact Section */}
        <div className="text-center mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Get in Touch</h2>
          <p className="text-gray-300">
            For inquiries, collaborations, or support, contact us at{' '}
            <a
              href="mailto:contact@proofnest.com"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              contact@proofnest.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;