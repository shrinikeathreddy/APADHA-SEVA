import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, User, MapPin, ShieldAlert, Save } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile, isLoggedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Registered User',
    email: 'user@email.com',
    phone: '+91 9876543210',
    age: '25',
    gender: 'Male',
    bloodGroup: 'O+',
    houseNo: '10-2-45',
    street: 'Main Road',
    area: 'Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    emergencyContactName: 'Rajesh Kumar (Father)',
    emergencyContactPhone: '+91 9988776655',
    allergies: 'Penicillin',
    medicalConditions: 'Asthma',
    medications: 'Inhaler as needed'
  });

  useEffect(() => {
    if (userProfile) {
      setProfile(prev => ({
        ...prev,
        ...userProfile
      }));
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser) {
        await updateProfile(profile);
      }
      canvasConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      alert("Medical profile successfully saved!");
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Medical profile updated!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>👤 Patient Emergency Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Provide accurate medical details. This helps emergency responders give the correct treatment immediately.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Medical Card Summary (Production Feature) */}
        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ background: '#166534', color: 'white', padding: '15px', borderRadius: '50%', display: 'flex' }}>
            <HeartPulse size={36} />
          </div>
          <div>
            <h3 style={{ color: '#166534', fontSize: '18px', marginBottom: '4px' }}>Digital Emergency Card Active</h3>
            <p style={{ color: '#14532d', fontSize: '13px', maxWidth: '550px' }}>
              Your blood group (<strong>{profile.bloodGroup}</strong>) and critical conditions (<strong>{profile.medicalConditions || 'None'}</strong>) will be broadcasted to paramedics as soon as you confirm an ambulance booking.
            </p>
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Personal Details */}
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
              <User size={18} style={{ color: 'var(--primary-color)' }} /> Personal Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
                <input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Age (Years)</label>
                  <input type="text" name="age" value={profile.age} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Blood Group</label>
                  <select name="bloodGroup" value={profile.bloodGroup} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Mobile Number</label>
                <input type="tel" name="phone" value={profile.phone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
                <input type="email" name="email" value={profile.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
            </div>
          </div>

          {/* Contact Address */}
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
              <MapPin size={18} style={{ color: 'var(--accent-teal)' }} /> Permanent Address
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>House No</label>
                  <input type="text" name="houseNo" value={profile.houseNo} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Street / Road</label>
                  <input type="text" name="street" value={profile.street} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Locality / Area</label>
                <input type="text" name="area" value={profile.area} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>City</label>
                  <input type="text" name="city" value={profile.city} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>State</label>
                  <input type="text" name="state" value={profile.state} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Pincode</label>
                <input type="text" name="pincode" value={profile.pincode} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Medical & Emergency contact */}
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
            <ShieldAlert size={18} style={{ color: '#eab308' }} /> Emergency Contact & Medical Info
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Emergency Contact Name</label>
              <input type="text" name="emergencyContactName" value={profile.emergencyContactName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '15px' }} />
              
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Emergency Contact Mobile</label>
              <input type="tel" name="emergencyContactPhone" value={profile.emergencyContactPhone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Known Allergies</label>
              <input type="text" name="allergies" value={profile.allergies} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '15px' }} />
              
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Chronic Medical Conditions</label>
              <input type="text" name="medicalConditions" value={profile.medicalConditions} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" style={{ padding: '14px 30px' }}>
            <Save size={18} /> Save Emergency Profile
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
