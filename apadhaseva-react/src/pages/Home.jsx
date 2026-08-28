import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, HeartHandshake, ArrowRight, Ambulance, Activity, Zap, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

const Home = () => {
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    // GSAP landing animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2
      });

      gsap.from('.stat-card', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        stagger: 0.1,
        delay: 0.4
      });

      gsap.from('.service-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.15,
        delay: 0.2
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '100px 20px 60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fee2e2',
            color: 'var(--primary-color)',
            padding: '6px 16px',
            borderRadius: '30px',
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '20px',
            border: '1px solid #fca5a5'
          }} className="hero-title">
            <Zap size={14} fill="currentColor" /> FASTEST RESPONSE TIMES IN BHARAT
          </div>
          
          <h1 className="hero-title" style={{
            fontSize: '48px',
            lineHeight: '1.15',
            color: 'var(--secondary-color)',
            marginBottom: '20px'
          }}>
            Every Second Counts.<br/>
            <span style={{ color: 'var(--primary-color)' }}>Save Lives</span> in Clicks.
          </h1>
          
          <p className="hero-title" style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            marginBottom: '30px',
            maxWidth: '500px'
          }}>
            APADHA SEVA provides instant, reliable online booking to locate nearest ICU, Oxygen, and Neonatal Ambulances in real-time.
          </p>

          <div className="hero-title" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/book" className="btn-primary" style={{ textDecoration: 'none' }}>
              Book Ambulance Now <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Emergency Helpline
            </Link>
          </div>
        </div>

        {/* Live Status Cards / Mock Interface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card stat-card" style={{ padding: '24px', background: 'white', borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '10px' }}><Ambulance size={32} /></div>
            <h3 style={{ fontSize: '32px', fontWeight: '800' }}>8 Min</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Average response time</p>
          </div>

          <div className="glass-card stat-card" style={{ padding: '24px', background: 'white', borderLeft: '4px solid var(--accent-teal)' }}>
            <div style={{ color: 'var(--accent-teal)', marginBottom: '10px' }}><Clock size={32} /></div>
            <h3 style={{ fontSize: '32px', fontWeight: '800' }}>24/7</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Support coverage</p>
          </div>

          <div className="glass-card stat-card" style={{ padding: '24px', background: 'white', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '10px' }}><Shield size={32} /></div>
            <h3 style={{ fontSize: '32px', fontWeight: '800' }}>100%</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Verified responder crew</p>
          </div>

          <div className="glass-card stat-card" style={{ padding: '24px', background: 'white', borderLeft: '4px solid var(--text-main)' }}>
            <div style={{ color: 'var(--text-main)', marginBottom: '10px' }}><HeartHandshake size={32} /></div>
            <h3 style={{ fontSize: '32px', fontWeight: '800' }}>250+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hospital partnerships</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', textAlign: 'center', color: 'var(--secondary-color)', marginBottom: '10px' }}>
          Ambulance Fleets Available
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '50px' }}>
          Equipped with advanced diagnostics, medical devices, and fully-trained technicians.
        </p>

        <div className="services-grid" ref={cardsRef}>
          <div className="glass-card service-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚑</div>
            <h3 style={{ marginBottom: '10px', fontSize: '20px' }}>Basic Ambulance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Best suited for non-emergency medical checkups, minor injuries, or recovering patient transfers. Equipped with first-aid kits and standard oxygen tanks.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-success"><CheckCircle size={12} /> Oxygen support</span>
              <span className="badge badge-success"><CheckCircle size={12} /> First aid</span>
            </div>
          </div>

          <div className="glass-card service-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>❤️</div>
            <h3 style={{ marginBottom: '10px', fontSize: '20px' }}>ICU Life-Support Ambulance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              For severe conditions including cardiac arrest or breathing failures. Houses standard ventilator units, defibrillators, heart monitors, and critical care paramedics.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-danger"><CheckCircle size={12} /> Ventilator</span>
              <span className="badge badge-danger"><CheckCircle size={12} /> Defibrillator</span>
              <span className="badge badge-danger"><CheckCircle size={12} /> Doctor onboard</span>
            </div>
          </div>

          <div className="glass-card service-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🫁</div>
            <h3 style={{ marginBottom: '10px', fontSize: '20px' }}>Oxygen/Cardiac Ambulance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Designed for high-flow breathing assistance needs. Features continuous multi-cylinder gas storage and vital status monitoring grids for chronic pulmonary transfers.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-warning"><CheckCircle size={12} /> High-flow O2</span>
              <span className="badge badge-warning"><CheckCircle size={12} /> ECG system</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{
        background: '#0f172a',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', color: 'white' }}>Why APADHA SEVA?</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '30px' }}>
            Medical transport coordination should be instant, clear, and trustworthy. APADHA SEVA bridges the technology gap to ensure nearby ambulance response teams arrive within critical windows, saving patients during gold periods. By sharing accurate user GPS details and custom emergency briefs, we assure response crews reach you equipped with exactly what is needed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '24px', color: 'var(--primary-color)' }}>GPS Tracking</h4>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Real-time coordination map</p>
            </div>
            <div>
              <h4 style={{ fontSize: '24px', color: 'var(--accent-teal)' }}>Smart Geocode</h4>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Address search auto-resolver</p>
            </div>
            <div>
              <h4 style={{ fontSize: '24px', color: 'var(--accent-cyan)' }}>Paramedic Broadcast</h4>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Direct connection with hospitals</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
