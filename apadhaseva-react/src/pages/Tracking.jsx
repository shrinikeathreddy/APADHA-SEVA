import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Phone, ShieldAlert, Award, Compass, MessageSquare } from 'lucide-react';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icons for Patient and Ambulance
const patientIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="10" fill="%23dc2626" opacity="0.2"/><circle cx="12" cy="12" r="6" fill="%23dc2626"/><circle cx="12" cy="12" r="2" fill="white"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"><rect x="2" y="6" width="20" height="12" rx="2" fill="%23dc2626"/><path d="M16 6h4l2 4v4h-6V6z" fill="%23dc2626"/><circle cx="7" cy="18" r="3" fill="%231e293b"/><circle cx="17" cy="18" r="3" fill="%231e293b"/><text x="6" y="14" fill="white" font-size="7" font-weight="bold">AMB</text></svg>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Component to dynamically adjust map boundaries
const RecenterMap = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};



const Tracking = () => {
  const navigate = useNavigate();
  
  // Hyderabad core coordinate centers
  const patientCoords = [17.4483, 78.3741]; // Madhapur
  const [ambCoords, setAmbCoords] = useState([17.4246, 78.4298]); // Starting near NIMS Hospital
  const [eta, setEta] = useState(8);
  const [statusStep, setStatusStep] = useState(2); // 0: confirmed, 1: assigned, 2: dispatched, 3: on the way, 4: reached

  useEffect(() => {
    // 1. Subscribe to Firestore real-time live_tracking document
    const trackingDocRef = doc(db, 'live_tracking', 'active_rescue');
    const unsubscribeSnapshot = onSnapshot(trackingDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.lat && data.lng) {
          setAmbCoords([data.lat, data.lng]);
        }
        if (data.eta !== undefined) setEta(data.eta);
        if (data.statusStep !== undefined) setStatusStep(data.statusStep);
      }
    }, (err) => {
      console.warn("Firestore tracking listener error:", err);
    });

    // 2. Stream simulated driver GPS movement into Firestore so all listeners update live
    const startLat = 17.4246;
    const startLng = 78.4298;
    const destLat = 17.4483;
    const destLng = 78.3741;
    
    let stepCount = 0;
    const totalSteps = 20;

    const interval = setInterval(async () => {
      stepCount += 1;
      
      const ratio = stepCount / totalSteps;
      const currentLat = startLat + (destLat - startLat) * ratio;
      const currentLng = startLng + (destLng - startLng) * ratio;
      const remainingMinutes = Math.max(1, Math.round(8 - (8 * ratio)));
      
      let step = 2;
      if (ratio > 0.8) step = 4;
      else if (ratio > 0.5) step = 3;

      // Publish to Firestore
      try {
        await setDoc(trackingDocRef, {
          lat: currentLat,
          lng: currentLng,
          eta: remainingMinutes,
          statusStep: step,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        // Fallback local update if offline
        setAmbCoords([currentLat, currentLng]);
        setEta(remainingMinutes);
        setStatusStep(step);
      }

      if (stepCount >= totalSteps) {
        clearInterval(interval);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      unsubscribeSnapshot();
    };
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', minHeight: '85vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>🚑 Live Ambulance Tracking</h1>
          <p style={{ color: 'var(--text-muted)' }}>Emergency rescue in progress. The responder crew is currently routing to your location.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          <ArrowLeft size={16} /> Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Map Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ height: '420px', zIndex: 10 }}>
            <MapContainer center={patientCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              {/* Patient Pin */}
              <Marker position={patientCoords} icon={patientIcon}>
                <Popup>📍 Your Location (Emergency Dispatch Point)</Popup>
              </Marker>
              
              {/* Ambulance Pin */}
              <Marker position={ambCoords} icon={ambulanceIcon}>
                <Popup>🚑 Assigned ICU Ambulance AP09AB1234 (Moving)</Popup>
              </Marker>

              <RecenterMap points={[patientCoords, ambCoords]} />
            </MapContainer>
          </div>

          {/* Map Compass detail widget */}
          <div className="glass-card" style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: 'var(--accent-teal)' }}><Compass size={24} className="animate-spin" style={{ animationDuration: '4s' }} /></div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              GPS connection active. Signal telemetry shows responder vehicle driving at <strong>58 km/h</strong>. Route calculations updated dynamically.
            </p>
          </div>
        </div>

        {/* Milestone and Details Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Paramedic Profile */}
          <div className="glass-card" style={{ padding: '24px', background: 'white', borderTop: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Assigned Responders</h4>
                <h3 style={{ fontSize: '20px', color: 'var(--secondary-color)', fontWeight: '800' }}>Rajesh Kumar</h3>
              </div>
              <span className="badge badge-danger" style={{ fontSize: '12px' }}>
                ETA: {eta} MIN
              </span>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>
              <strong>Ambulance Fleet:</strong> Advanced Cardiac ICU (AP-09-AB-1234)
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '20px' }}>
              <strong>Hospital responders:</strong> NIMS Emergency Department
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="tel:+919876543210" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', textDecoration: 'none', flexGrow: 1, justifyContent: 'center' }}>
                <Phone size={16} /> Call Paramedic
              </a>
              <button onClick={() => alert("Simulation: Telemedicine text bridge launched with responder team.")} className="btn-secondary" style={{ padding: '10px', flexShrink: 0 }}>
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Journey Milestones */}
          <div className="glass-card" style={{ padding: '24px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px' }}>Journey Milestones</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', paddingLeft: '24px' }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                background: '#cbd5e1',
                zIndex: 1
              }}></div>

              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusStep >= 0 ? '#166534' : '#cbd5e1', border: '3px solid white', boxShadow: '0 0 0 2px #cbd5e1' }}></div>
                <span style={{ fontSize: '14px', fontWeight: statusStep >= 0 ? '700' : '500', color: statusStep >= 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  ✅ Emergency Dispatch Confirmed
                </span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusStep >= 1 ? '#166534' : '#cbd5e1', border: '3px solid white', boxShadow: '0 0 0 2px #cbd5e1' }}></div>
                <span style={{ fontSize: '14px', fontWeight: statusStep >= 1 ? '700' : '500', color: statusStep >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  ✅ Paramedic Crew Assigned (Rajesh Kumar)
                </span>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusStep >= 2 ? '#166534' : '#cbd5e1', border: '3px solid white', boxShadow: '0 0 0 2px #cbd5e1' }}></div>
                <span style={{ fontSize: '14px', fontWeight: statusStep >= 2 ? '700' : '500', color: statusStep >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  🚑 Ambulance Dispatched from NIMS Hospital
                </span>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusStep >= 3 ? '#166534' : '#cbd5e1', border: '3px solid white', boxShadow: '0 0 0 2px #cbd5e1' }}></div>
                <span style={{ fontSize: '14px', fontWeight: statusStep >= 3 ? '700' : '500', color: statusStep >= 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  🚦 Navigating through Traffic
                </span>
              </div>

              {/* Step 5 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusStep >= 4 ? '#166534' : '#cbd5e1', border: '3px solid white', boxShadow: '0 0 0 2px #cbd5e1' }}></div>
                <span style={{ fontSize: '14px', fontWeight: statusStep >= 4 ? '700' : '500', color: statusStep >= 4 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  🏥 Ambulance Arrived at Patient Location
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Tracking;
