import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Key } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all credentials.");
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);

      // Trigger celebration on successful login
      canvasConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Invalid credentials or login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail('responder@apadhaseva.com');
    setPassword('password123');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        background: 'white',
        borderTop: '5px solid var(--primary-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '32px' }}>🚑</span>
          <h2 style={{ fontSize: '28px', color: 'var(--secondary-color)', marginTop: '10px' }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Access your Emergency Booking Panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: 'var(--secondary-color)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="enter user@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: 'var(--secondary-color)' }}>
              Secret Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={handleQuickLogin} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '13px' }}>
            <Key size={14} /> Auto-fill Demo User
          </button>
        </div>

        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have a medical responder profile?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
