import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Core Components
import Header from './components/Header';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Tracking from './pages/Tracking';
import History from './pages/History';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import FirstAid from './pages/FirstAid';
import DriverPortal from './pages/DriverPortal';
import AdminPortal from './pages/AdminPortal';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-clinical)' }}>
          
          {/* Sticky Header */}
          <Header />

          {/* Scroll Reset & Page Transition Wrapper */}
          <main style={{ flexGrow: 1 }}>
            <SmoothScroll>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/book" element={<Booking />} />
                <Route path="/track" element={<Tracking />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/first-aid" element={<FirstAid />} />
                <Route path="/driver" element={<DriverPortal />} />
                <Route path="/admin" element={<AdminPortal />} />
              </Routes>
            </SmoothScroll>
          </main>

          {/* Footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
