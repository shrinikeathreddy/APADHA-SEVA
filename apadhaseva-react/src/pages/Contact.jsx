import React, { useState } from 'react';
import { Phone, Mail, Clock, Send, ShieldCheck, HeartPulse } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all feedback form fields.");
      return;
    }
    
    // Confetti on query submission
    canvasConfetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.8 }
    });

    alert("Feedback received! Our medical coordination department will reach out shortly.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', minHeight: '85vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '36px', color: 'var(--secondary-color)', marginBottom: '10px' }}>☎ Emergency Support Directories</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Connect with national medical networks, local trauma responders, or our digital application operators instantly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* Helpline List */}
        <div>
          <h2 style={{ fontSize: '22px', color: 'var(--secondary-color)', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
            National Helplines
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px', background: 'white', borderLeft: '5px solid var(--primary-color)' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Phone size={18} /> Medical Ambulance: 108
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Primary national medical dispatch helpline. Coordination across federal hospitals and disaster responder vehicles.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', background: 'white', borderLeft: '5px solid var(--accent-teal)' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Phone size={18} /> National Emergency: 112
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Unified single-response rescue channel. Connects to ambulance, fire department, and city safety dispatchers.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', background: 'white', borderLeft: '5px solid var(--accent-cyan)' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Phone size={18} /> Health Helpline: 104
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Free professional remote health consultations, medical advice directories, and basic health inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback / Inquiry Form */}
        <div className="glass-card" style={{ padding: '35px', background: 'white' }}>
          <h2 style={{ fontSize: '22px', color: 'var(--secondary-color)', marginBottom: '10px' }}>Contact Application Support</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>
            Have a question about booking registrations or hospital partnerships? Send us a message.
          </p>

          <form onSubmit={handleMessageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Your Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                placeholder="Enter Full Name" 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                placeholder="Enter email address" 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600' }}>Your Message / Report</label>
              <textarea 
                rows="4" 
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                placeholder="Briefly state your concern..."
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>

      </div>

      {/* Safety Verification Footer Box */}
      <div className="glass-card" style={{
        marginTop: '60px',
        padding: '24px',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ color: 'var(--accent-teal)' }}><ShieldCheck size={36} /></div>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '4px' }}>Secure Encrypted Communication</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            APADHA SEVA uses secure transmission channels. Patient records and medical information coordinates are encrypted before transmitting to emergency paramedics.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Contact;
