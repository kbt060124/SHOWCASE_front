import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CompanyProfile from './components/CompanyProfile';
import S3Image from './components/S3Image';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company" element={<CompanyProfile />} />
        <Route path="/s3-image" element={<S3Image imageUrl="https://test-fbx-upload.s3.ap-southeast-2.amazonaws.com/25073936.png" alt="S3の画像" />} />
      </Routes>
    </Router>
  )
}

export default App
