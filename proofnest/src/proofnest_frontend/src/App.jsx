import React from 'react';
import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import {Navigate} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import FilesList from './components/FilesList';
import Landing from './components/Landing';
import About from './components/About';
import Contact from './components/Contact';
import Feedback from './components/Feedback';
import NotFound from './components/NotFound';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop/>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="register" element={
          <ProtectedRoute>
            <Register />
          </ProtectedRoute>
        } />
        <Route path="verify" element={<Verify />} />
        <Route path="files" element={
          <ProtectedRoute>
            <FilesList />
          </ProtectedRoute>
        } />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
    </Router>
  );
}

export default App;
