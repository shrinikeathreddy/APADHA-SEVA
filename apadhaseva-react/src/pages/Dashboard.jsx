import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, User, Phone, ShieldAlert, Heart, Siren, CheckCircle, AlertTriangle } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isLoggedIn } = useAuth();
  const cardContainerRef = useRef(null);
  const [sosStatus, setSosStatus] = useState('idle'); // idle, locating, broadcasting, active
  const [sosCoordinates, setSosCoordinates] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // GSAP animations for cards
    let ctx;
    if (cardContainerRef.current) {
      ctx = gsap.context(() => {
        gsap.from('.dash-card', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.15
        });
        gsap.from('.banner-alert', {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.3
        });
      }, cardContainerRef);
    }

    return () => {
      if (ctx) ctx.revert();
    };
  }, [isLoggedIn, navigate]);

  const handleQuickSOS = () => {
    if (sosStatus !== 'idle') return;

    setSosStatus('locating');
    
    // Geolocation API check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSosCoordinates({ lat, lng });
          setSosStatus('broadcasting');

          // Trigger confetti or warning noise simulation
          canvasConfetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          canvasConfetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });

          // Write SOS alert to Firestore
          const sosBooking = {
            userId: currentUser ? currentUser.uid : 'anonymous',
            id: 'SOS-' + Math.floor(Math.random() * 10000),
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            patient: userProfile?.fullName ? `${userProfile.fullName} (SOS Emergency)` : 'Emergency User (Self)',
            pickup: `GPS Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            hospital: 'Nearest Trauma Center (Assigned)',
            status: 'Dispatched 🚑',
            type: 'SOS Critical Call',
            timestamp: serverTimestamp()
          };

          try {
            await addDoc(collection(db, 'bookings'), sosBooking);
          } catch (e) {
            console.warn("Firestore SOS record fail:", e);
          }

          // Cache locally
          const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          localStorage.setItem('bookings', JSON.stringify([sosBooking, ...bookings]));

          setTimeout(() => {
            setSosStatus('active');
            alert(`🚨 SOS ALERT BROADCASTED!\nEmergency services dispatched to coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}.\nRedirecting you to live tracking...`);
            navigate('/track');
          }, 2000);
        },
        (error) => {
          setSosStatus('idle');
          alert("Could not retrieve geolocation. Please check browser location permissions or type location manually on the booking page.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setSosStatus('idle');
      alert("Geolocation is not supported by your browser. Please search manually on the Booking page.");
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '85vh' }} ref={cardContainerRef}>
      
      {/* Alert Banner */}
      <div className="banner-alert" style={{
        background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <Siren size={32} className="animate-pulse" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
              One-Click Instant SOS Broadcast
            </h2>
            <p style={{ color: '#fca5a5', fontSize: '14px', maxWidth: '600px' }}>
              Instantly sends your exact GPS coordinates to the nearest available ambulance response crew and partner hospital emergency department.
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleQuickSOS} 
          disabled={sosStatus !== 'idle'}
          style={{
            background: 'white',
            color: 'var(--primary-color)',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            cursor: sosStatus === 'idle' ? 'pointer' : 'not-allowed',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { if (sosStatus === 'idle') e.target.style.transform = 'scale(1.05)'; }}
          onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; }}
        >
          {sosStatus === 'idle' && <>🚨 Trigger Quick SOS</>}
          {sosStatus === 'locating' && <>📍 Locating GPS...</>}
          {sosStatus === 'broadcasting' && <>📡 Broadcasting SOS...</>}
          {sosStatus === 'active' && <>🟢 Responders Dispatched</>}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="dash-card">
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>Medical Responder Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back. Manage emergency bookings, check patient files, and guide responders.</p>
        </div>
      </div>

      {/* Dashboard Quick Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '50px' }}>
        <div className="glass-card dash-card" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ color: 'var(--primary-color)', marginBottom: '15px' }}><PlusCircle size={40} /></div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--secondary-color)' }}>Book Ambulance</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flexGrow: 1 }}>
            Launch our live booking map to find available ICU, Cardiac, or basic ambulance teams near your location.
          </p>
          <Link to="/book" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            Book Ambulance
          </Link>
        </div>

        <div className="glass-card dash-card" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ color: 'var(--accent-teal)', marginBottom: '15px' }}><FileText size={40} /></div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--secondary-color)' }}>Booking History</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flexGrow: 1 }}>
            View completed rescues, trace journey distances, download receipts, and manage historical emergency reports.
          </p>
          <Link to="/history" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            View History
          </Link>
        </div>

        <div className="glass-card dash-card" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ color: 'var(--accent-cyan)', marginBottom: '15px' }}><User size={40} /></div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--secondary-color)' }}>Patient Profile</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flexGrow: 1 }}>
            Update blood groups, emergency contacts, medical history details, and allergies for automatic crew reports.
          </p>
          <Link to="/profile" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            Manage Profile
          </Link>
        </div>

        <div className="glass-card dash-card" style={{ padding: '30px', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ color: '#eab308', marginBottom: '15px' }}><Phone size={40} /></div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--secondary-color)' }}>Emergency Contact</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flexGrow: 1 }}>
            Connect with state emergency operators, police dispatch, fire responders, and cardiac care departments instantly.
          </p>
          <Link to="/contact" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
            Emergency Numbers
          </Link>
        </div>
      </div>

      {/* Safety instructions dashboard quick link */}
      <div className="glass-card dash-card" style={{
        padding: '30px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h3 style={{ color: '#166534', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldAlert size={22} /> First Aid Interactive Guidelines
          </h3>
          <p style={{ color: '#166534', opacity: 0.8, fontSize: '14px' }}>
            Need step-by-step CPR guidance, bleeding control info, or choking rescue maneuvers? Open our quick guideline portal to check visual safety animations.
          </p>
        </div>
        <Link to="/first-aid" className="btn-secondary" style={{
          textDecoration: 'none',
          borderColor: '#86efac',
          background: 'white',
          color: '#166534'
        }}>
          Open Safety Guide
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;
