import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, PlusCircle, FileText, User, Phone, LogOut, Truck, Shield } from 'lucide-react';
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <NavLink to="/" style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
            fontWeight: isActive ? '700' : '500',
            fontSize: '14px'
          })}>Home</NavLink>

          <NavLink to="/first-aid" style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
            fontWeight: isActive ? '700' : '500',
            fontSize: '14px'
          })}>First Aid</NavLink>

          <NavLink to="/driver" style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? 'var(--primary-color)' : '#0f172a',
            fontWeight: isActive ? '700' : '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            background: '#fef2f2',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #fee2e2'
          })}>
            <Truck size={15} color="var(--primary-color)" /> Driver Console
          </NavLink>

          <NavLink to="/admin" style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? 'var(--accent-teal)' : '#0f172a',
            fontWeight: isActive ? '700' : '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            background: '#f0fdf4',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid #dcfce7'
          })}>
            <Shield size={15} color="var(--accent-teal)" /> Admin Desk
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <Activity size={15} /> Dashboard
              </NavLink>
              
              <NavLink to="/book" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <PlusCircle size={15} /> Book
              </NavLink>

              <NavLink to="/history" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <FileText size={15} /> History
              </NavLink>

              <NavLink to="/profile" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <User size={15} /> Profile
              </NavLink>

              <NavLink to="/contact" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <Phone size={15} /> Emergency
              </NavLink>

              <button onClick={handleLogout} style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px'
              })}>Login</NavLink>

              <NavLink to="/register" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px'
              })}>Register</NavLink>

              <NavLink to="/contact" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              })}>
                <Phone size={15} /> Emergency Contact
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
