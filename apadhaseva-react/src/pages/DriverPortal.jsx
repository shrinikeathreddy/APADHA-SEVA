import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Phone, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  Power, 
  Award, 
  Activity, 
  Volume2, 
  VolumeX,
  Stethoscope,
  Heart
} from 'lucide-react';

const DriverPortal = () => {
  const navigate = useNavigate();

  // Driver Status: 'ONLINE', 'BUSY', 'OFFLINE'
  const [driverState, setDriverState] = useState('ONLINE');
  const [sirenActive, setSirenActive] = useState(false);

  // Active Dispatches (mocked + synced with localStorage)
  const defaultDispatches = [
    {
      id: 'EMG-9021',
      patientName: 'K. Srinivasa Rao',
      patientAge: '52',
      bloodGroup: 'O+',
      emergencyType: 'Cardiac Chest Pain',
      priority: 'CRITICAL',
      pickupLocation: 'Flat 402, Cyber Towers Lane, Madhapur, Hyderabad',
      destination: 'CARE Hospitals, Gachibowli',
      distance: '3.2 km',
      eta: '6 mins',
      phone: '+91 98490 12345',
      allergies: 'Penicillin',
      conditions: 'Hypertension, Diabetes',
      timestamp: '2 mins ago',
      status: 'PENDING'
    },
    {
      id: 'EMG-9018',
      patientName: 'Priya Sharma',
      patientAge: '28',
      bloodGroup: 'B+',
      emergencyType: 'Accident Fracture',
      priority: 'HIGH',
      pickupLocation: 'Hitec City Metro Station Gate 3',
      destination: 'Apollo Hospitals, Jubilee Hills',
      distance: '5.1 km',
      eta: '11 mins',
      phone: '+91 91234 56789',
      allergies: 'None',
      conditions: 'Asthma',
      timestamp: '12 mins ago',
      status: 'PENDING'
    }
  ];

  const [dispatches, setDispatches] = useState(() => {
    const saved = localStorage.getItem('apadhaseva_driver_dispatches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultDispatches;
  });

  const [activeTrip, setActiveTrip] = useState(() => {
    const savedActive = localStorage.getItem('apadhaseva_active_driver_trip');
    if (savedActive) {
      try { return JSON.parse(savedActive); } catch (e) {}
    }
    return null;
  });

  const [completedTrips, setCompletedTrips] = useState([
    {
      id: 'EMG-8990',
      patientName: 'Venkatesh Naidu',
      type: 'Acute Respiratory Distress',
      time: '10:15 AM',
      destination: 'NIMS Hospital, Panjagutta',
      rating: 5,
      earning: '₹850'
    },
    {
      id: 'EMG-8975',
      patientName: 'Ananya Reddy',
      type: 'Pregnancy Emergency',
      time: '08:30 AM',
      destination: 'Fernandez Hospital, Jubilee Hills',
      rating: 5,
      earning: '₹920'
    }
  ]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('apadhaseva_driver_dispatches', JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    if (activeTrip) {
      localStorage.setItem('apadhaseva_active_driver_trip', JSON.stringify(activeTrip));
    } else {
      localStorage.removeItem('apadhaseva_active_driver_trip');
    }
  }, [activeTrip]);

  const handleAcceptDispatch = (dispatch) => {
    const updatedTrip = { ...dispatch, status: 'ACCEPTED', step: 1 };
    setActiveTrip(updatedTrip);
    setDriverState('BUSY');
    setDispatches(prev => prev.filter(d => d.id !== dispatch.id));
  };

  const handleAdvanceStatus = () => {
    if (!activeTrip) return;
    
    const steps = [
      { status: 'ACCEPTED', step: 1, label: 'En Route to Patient' },
      { status: 'EN_ROUTE_PATIENT', step: 2, label: 'Patient Onboard' },
      { status: 'PATIENT_ONBOARD', step: 3, label: 'En Route to Hospital' },
      { status: 'EN_ROUTE_HOSPITAL', step: 4, label: 'Arrived at ER Hospital' },
      { status: 'COMPLETED', step: 5, label: 'Trip Completed' }
    ];

    const currentIdx = steps.findIndex(s => s.status === activeTrip.status);
    if (currentIdx < steps.length - 1) {
      const nextStep = steps[currentIdx + 1];
      if (nextStep.status === 'COMPLETED') {
        // Complete the trip
        setCompletedTrips(prev => [{
          id: activeTrip.id,
          patientName: activeTrip.patientName,
          type: activeTrip.emergencyType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          destination: activeTrip.destination,
          rating: 5,
          earning: '₹950'
        }, ...prev]);
        setActiveTrip(null);
        setDriverState('ONLINE');
        setSirenActive(false);
      } else {
        setActiveTrip(prev => ({
          ...prev,
          status: nextStep.status,
          step: nextStep.step
        }));
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(220, 38, 38, 0.2)',
              border: '2px solid var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              🚑
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>Driver Console</h1>
                <span className={`badge ${driverState === 'ONLINE' ? 'badge-success' : driverState === 'BUSY' ? 'badge-warning' : 'badge-danger'}`}>
                  {driverState === 'ONLINE' ? '🟢 ONLINE & READY' : driverState === 'BUSY' ? '🚨 IN RESCUE MISSION' : '🔴 OFFLINE'}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>
                Driver: <strong>Rajesh Sharma</strong> | Vehicle: <strong>AP-09-AX-9901 (ALS ICU Ambulance)</strong>
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSirenActive(!sirenActive)}
              style={{
                background: sirenActive ? '#dc2626' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {sirenActive ? <Volume2 className="animate-pulse" size={18} /> : <VolumeX size={18} />}
              {sirenActive ? 'Siren Active' : 'Emergency Siren'}
            </button>

            <button
              onClick={() => setDriverState(prev => prev === 'OFFLINE' ? 'ONLINE' : 'OFFLINE')}
              disabled={!!activeTrip}
              style={{
                background: driverState === 'OFFLINE' ? '#166534' : '#991b1b',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: activeTrip ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: activeTrip ? 0.6 : 1
              }}
            >
              <Power size={18} />
              {driverState === 'OFFLINE' ? 'Go Online' : 'Go Offline'}
            </button>
          </div>

        </div>
      </div>

      {/* Driver Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} color="#16a34a" /> TODAY'S RESCUES
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            8 <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>+2 vs yesterday</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#0284c7" /> AVG RESPONSE TIME
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            4.2 <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>mins</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} color="#eab308" /> DRIVER RATING
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            4.95 ⭐ <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>(140 reviews)</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="#dc2626" /> SHIFT EARNINGS
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--primary-color)' }}>
            ₹3,820
          </div>
        </div>
      </div>

      {/* Main Grid: Active Trip vs Incoming Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTrip ? '1fr' : '2fr 1fr', gap: '28px' }}>
        
        {/* LEFT COLUMN: ACTIVE TRIP OR DISPATCH FEED */}
        <div>
          {activeTrip ? (
            <div className="glass-card" style={{ padding: '28px', border: '2px solid var(--primary-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span className="badge badge-danger" style={{ fontSize: '14px', padding: '6px 14px' }}>
                  🚨 ACTIVE MISSION: {activeTrip.id}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>
                  ETA: {activeTrip.eta} ({activeTrip.distance})
                </span>
              </div>

              {/* Progress Stepper */}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0', position: 'relative' }}>
                {['Accepted', 'En Route Pickup', 'Patient Onboard', 'Hospital ER'].map((stepName, i) => {
                  const stepNum = i + 1;
                  const isDone = (activeTrip.step || 1) >= stepNum;
                  return (
                    <div key={stepName} style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isDone ? 'var(--primary-color)' : '#e2e8f0',
                        color: isDone ? 'white' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        margin: '0 auto 8px auto'
                      }}>
                        {isDone ? '✓' : stepNum}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: isDone ? '700' : '500', color: isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {stepName}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Patient Emergency Card */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="var(--primary-color)" /> {activeTrip.patientName} ({activeTrip.patientAge} yrs)
                  <span className="badge badge-danger">{activeTrip.priority}</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div><strong>Condition:</strong> <span style={{ color: '#dc2626', fontWeight: '600' }}>{activeTrip.emergencyType}</span></div>
                  <div><strong>Blood Group:</strong> {activeTrip.bloodGroup}</div>
                  <div><strong>Allergies:</strong> {activeTrip.allergies}</div>
                  <div><strong>Medical History:</strong> {activeTrip.conditions}</div>
                </div>

                <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#dc2626" />
                    <span><strong>Pickup:</strong> {activeTrip.pickupLocation}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={16} color="#0d9488" />
                    <span><strong>Destination Hospital:</strong> {activeTrip.destination}</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={`tel:${activeTrip.phone}`} className="btn-secondary" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
                  <Phone size={18} color="#16a34a" /> Call Patient ({activeTrip.phone})
                </a>

                <button 
                  onClick={handleAdvanceStatus}
                  className="btn-primary" 
                  style={{ flex: 2, justifyContent: 'center', padding: '14px 24px', fontSize: '16px' }}
                >
                  <Navigation size={20} />
                  {activeTrip.status === 'ACCEPTED' && 'Start Navigation to Patient'}
                  {activeTrip.status === 'EN_ROUTE_PATIENT' && 'Confirm Patient Onboard'}
                  {activeTrip.status === 'PATIENT_ONBOARD' && 'Start Navigation to Hospital'}
                  {activeTrip.status === 'EN_ROUTE_HOSPITAL' && 'Complete Mission'}
                </button>
              </div>

            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={22} color="var(--primary-color)" /> Live Emergency Dispatches
                </h2>
                <span className="badge badge-warning">{dispatches.length} Pending</span>
              </div>

              {driverState === 'OFFLINE' ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Power size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
                  <h3>You are currently Offline</h3>
                  <p style={{ marginTop: '8px' }}>Turn your status to <strong>Online</strong> to receive emergency dispatch notifications.</p>
                </div>
              ) : dispatches.length === 0 ? (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Heart size={48} style={{ margin: '0 auto 16px auto', color: '#0d9488' }} />
                  <h3>No Emergency Calls in Your Sector</h3>
                  <p style={{ marginTop: '8px' }}>Stay alert. Nearby emergency requests will pop up automatically.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dispatches.map(dispatch => (
                    <div key={dispatch.id} className="glass-card" style={{ padding: '24px', borderLeft: '6px solid var(--primary-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{dispatch.patientName}</h3>
                            <span className="badge badge-danger">{dispatch.priority}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dispatch.timestamp}</span>
                          </div>

                          <div style={{ color: 'var(--primary-color)', fontWeight: '600', marginTop: '4px', fontSize: '15px' }}>
                            🚨 {dispatch.emergencyType}
                          </div>

                          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            <div>📍 <strong>Pickup:</strong> {dispatch.pickupLocation}</div>
                            <div>🏥 <strong>Hospital:</strong> {dispatch.destination}</div>
                            <div>📏 <strong>Distance:</strong> {dispatch.distance} ({dispatch.eta} away)</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                          <button
                            onClick={() => handleAcceptDispatch(dispatch)}
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            Accept Dispatch
                          </button>
                          <button
                            onClick={() => setDispatches(prev => prev.filter(d => d.id !== dispatch.id))}
                            className="btn-secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SHIFT HISTORY */}
        {!activeTrip && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--accent-teal)" /> Shift Logs
            </h2>

            <div className="glass-card" style={{ padding: '20px' }}>
              {completedTrips.map((trip, idx) => (
                <div key={trip.id} style={{
                  padding: '12px 0',
                  borderBottom: idx === completedTrips.length - 1 ? 'none' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                    <span>{trip.patientName}</span>
                    <span style={{ color: '#16a34a' }}>{trip.earning}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {trip.type} • {trip.time}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    🏥 {trip.destination}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default DriverPortal;
