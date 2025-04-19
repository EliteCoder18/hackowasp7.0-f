import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        setMessage('Please upload a file.');
        return;
      }

      const response = await axios.post('http://localhost:8080/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`Hash registered successfully: ${response.data.hash}`);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Register Hash</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Register
      </button>
      <p className="mt-4">{message}</p>
    </div>
  );
};

const Verify = () => {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    try {
      const response = await axios.post('http://localhost:8000/verify', { hash });

      setResult(response.data);
    } catch (error) {
      setResult({ error: error.response?.data?.error || 'Unknown error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Verify Hash</h2>
      <input
        type="text"
        placeholder="Hash"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleVerify}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Verify
      </button>
      {result && (
        <div className="mt-4">
          {result.error ? (
            <p className="text-red-500">Error: {result.error}</p>
          ) : (
            <div>
              <p>User: {result.user}</p>
              <p>Timestamp: {result.timestamp}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">ProofNest</h1>
      <div className="tabs mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'verify' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('verify')}
        >
          Verify
        </button>
      </div>
      {activeTab === 'register' ? <Register /> : <Verify />}
    </div>
  );
};

export default App;
