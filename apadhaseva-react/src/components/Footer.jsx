import React from 'react';
import { Phone, Mail, AlertTriangle } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#f8fafc',
      padding: '40px 60px',
      marginTop: '60px',
      borderTop: '4px solid var(--primary-color)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px'
      }}>
        <div>
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚑 APADHA SEVA
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '10px' }}>
            Saving Lives Through Technology
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            National 24×7 Emergency Ambulance booking service. Connected directly with verified hospital responders.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'white' }}>Quick Contacts</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>
            <Phone size={16} className="text-red-500" style={{ color: 'var(--primary-color)' }} /> Emergency Helpline: <strong>108 / 112</strong>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>
            <Mail size={16} style={{ color: 'var(--accent-cyan)' }} /> support@apadhaseva.in
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={18} style={{ color: '#eab308' }} /> Safety Alert
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
            For extreme life-threatening emergencies, call <strong>108</strong> directly while requesting through the app. Our operators coordinate instantly with paramedics.
          </p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        borderTop: '1px solid #334155',
        marginTop: '30px',
        paddingTop: '20px',
        fontSize: '13px',
        color: '#64748b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '30px auto 0 auto'
      }}>
        <p>© 2026 APADHA SEVA | Secure Emergency Portal. All Rights Reserved.</p>
        <p>🇮🇳 Made in Bharat for Global Care</p>
      </div>
    </footer>
  );
};

export default Footer;
