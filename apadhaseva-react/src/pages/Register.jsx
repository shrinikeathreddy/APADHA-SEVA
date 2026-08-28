import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, HeartPulse } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    gender: 'Male'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill in the required fields.");
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        fullName: formData.fullName,
        phone: formData.phone,
        age: formData.age || '25',
        gender: formData.gender,
        houseNo: '10-2-45',
        street: 'Main Road',
        area: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        bloodGroup: 'O+',
        emergencyContactName: '',
        emergencyContactPhone: '',
        allergies: '',
        medicalConditions: '',
        medications: ''
      };

      await register(formData.email, formData.password, profileData);

      // Trigger celebration
      canvasConfetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 }
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
      minHeight: '95vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="glass-card" style={{
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderTop: '5px solid var(--primary-color)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ fontSize: '32px' }}>🚑</span>
          <h2 style={{ fontSize: '28px', color: 'var(--secondary-color)', marginTop: '10px' }}>Join APADHA SEVA</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Register to book ambulances instantly</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                name="fullName"
                placeholder="Enter Full Name" 
                value={formData.fullName}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                name="email"
                placeholder="Enter email address" 
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
              Mobile Number *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="tel" 
                name="phone"
                placeholder="Enter mobile number" 
                value={formData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
                Age
              </label>
              <input 
                type="number" 
                name="age"
                placeholder="e.g. 25" 
                value={formData.age}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
                Gender
              </label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', background: 'white' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '13px' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                name="password"
                placeholder="Create Password" 
                value={formData.password}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 10px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '15px' }}>
            <HeartPulse size={18} /> Register Now
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
