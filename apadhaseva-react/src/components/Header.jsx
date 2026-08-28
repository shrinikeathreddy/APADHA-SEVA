import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, PlusCircle, FileText, User, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="glass-nav sticky top-0 z-[2000] px-6 py-4 flex items-center justify-between" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 40px',
      position: 'sticky',
      top: 0,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🚑 APADHA SEVA
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          background: '#f1f5f9',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid #e2e8f0'
        }}>
          🇮🇳 Made in Bharat
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                transition: 'color 0.2s'
              })}>
                <Activity size={16} /> Dashboard
              </NavLink>
              
              <NavLink to="/book" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                transition: 'color 0.2s'
              })}>
                <PlusCircle size={16} /> Book Ambulance
              </NavLink>

              <NavLink to="/history" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                transition: 'color 0.2s'
              })}>
                <FileText size={16} /> History
              </NavLink>

              <NavLink to="/profile" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                transition: 'color 0.2s'
              })}>
                <User size={16} /> {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Profile'}
              </NavLink>

              <NavLink to="/contact" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                transition: 'color 0.2s'
              })}>
                <Phone size={16} /> Emergency
              </NavLink>

              <button onClick={handleLogout} style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }} onMouseOver={(e) => e.target.style.color = 'var(--primary-color)'} onMouseOut={(e) => e.target.style.color = '#64748b'}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '15px'
              })}>Home</NavLink>
              
              <NavLink to="/login" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '15px'
              })}>Login</NavLink>

              <NavLink to="/register" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '15px'
              })}>Register</NavLink>

              <NavLink to="/contact" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px'
              })}>
                <Phone size={16} /> Emergency
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
