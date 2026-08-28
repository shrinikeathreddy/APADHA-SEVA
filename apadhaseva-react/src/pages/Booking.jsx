import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Hospital, Ambulance, AlertCircle, Compass, Users, Sparkles } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Fix Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icons
const currentLocIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="10" fill="%23dc2626" opacity="0.2"/><circle cx="12" cy="12" r="6" fill="%23dc2626"/><circle cx="12" cy="12" r="2" fill="white"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const hospitalPinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><rect x="3" y="3" width="18" height="18" rx="4" fill="%230d9488"/><path d="M12 7v10M7 12h10" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to recenter map view on coordinate updates
const MapRefresher = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 14, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const Booking = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([17.4483, 78.3741]); // default Madhapur Hyderabad coordinates
  const [locationName, setLocationName] = useState('Cyber Towers, Madhapur, Hyderabad');
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle, loading, success
  const [searchLoading, setSearchLoading] = useState(false);

  // Form selections
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [bookingFor, setBookingFor] = useState('myself'); // myself, other

  // Base hospital data with relative offset targets
  const baseHospitals = [
    { id: 'h1', name: 'NIMS Trauma Emergency Center', offset: [0.005, -0.003], beds: 8, phone: '040-23489000', icuStatus: 'Green 🟢' },
    { id: 'h2', name: 'Gandhi General Hospital & ICU', offset: [0.012, 0.008], beds: 14, phone: '040-27505566', icuStatus: 'Green 🟢' },
    { id: 'h3', name: 'Apollo Critical Trauma Care', offset: [-0.009, 0.011], beds: 3, phone: '040-23607777', icuStatus: 'Warning 🟡' },
    { id: 'h4', name: 'Care Emergency Multispecialty', offset: [0.018, -0.015], beds: 5, phone: '040-30418888', icuStatus: 'Green 🟢' },
    { id: 'h5', name: 'Osmania General Emergency Unit', offset: [-0.015, -0.012], beds: 12, phone: '040-24600121', icuStatus: 'Green 🟢' }
  ];

  // Dynamically calculate nearby hospitals ordered by distance from user location
  const [hospitalsList, setHospitalsList] = useState([]);

  // 100% Free Emergency Ambulance Deck (Govt 108 / APADHA SEVA)
  const ambulances = [
    { id: 'a1', name: 'Basic Life-Support Ambulance', distance: 1.2, eta: 4, price: 'FREE (₹0)', badge: '100% Govt Funded', status: 'Available 🟢' },
    { id: 'a2', name: 'Advanced Cardiac ICU Unit', distance: 1.8, eta: 6, price: 'FREE (₹0)', badge: '100% Govt Funded', status: 'Available 🟢' },
    { id: 'a3', name: 'Emergency Oxygen Fleet', distance: 2.4, eta: 8, price: 'FREE (₹0)', badge: '100% Govt Funded', status: 'Available 🟢' },
    { id: 'a4', name: 'Neonatal Pediatric Transport', distance: 3.5, eta: 11, price: 'FREE (₹0)', badge: '100% Govt Funded', status: 'Available 🟢' }
  ];

  // Calculate Haversine proximity distance in km
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Recalculate hospital list sorted by closest proximity whenever mapCenter changes
  useEffect(() => {
    const [uLat, uLng] = mapCenter;
    const updated = baseHospitals.map(h => {
      const hLat = uLat + h.offset[0];
      const hLng = uLng + h.offset[1];
      const dist = calcDistance(uLat, uLng, hLat, hLng);
      return { ...h, distance: dist, lat: hLat, lng: hLng };
    }).sort((a, b) => a.distance - b.distance);

    setHospitalsList(updated);
    if (updated.length > 0 && !selectedHospital) {
      setSelectedHospital(updated[0]); // Auto-select #1 closest hospital
    }
  }, [mapCenter]);

  // Set default selected ambulance
  useEffect(() => {
    if (!selectedAmbulance && ambulances.length > 0) {
      setSelectedAmbulance(ambulances[0]);
    }
  }, []);

  // Geocoding suggestions lookup from Nominatim OSM API
  useEffect(() => {
    if (addressInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=5&countrycodes=in`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setSearchLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [addressInput]);

  const selectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    const coords = [lat, lon];
    setMapCenter(coords);
    setLocationName(s.display_name);
    setAddressInput(s.display_name);
    setSuggestions([]);
  };

  // HTML5 Live GPS Geolocation lookup
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation is not supported by this browser.");
      return;
    }

    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coords = [lat, lng];
        setMapCenter(coords);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setLocationName(data.display_name);
            setAddressInput(data.display_name);
          } else {
            const formatted = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setLocationName(formatted);
            setAddressInput(formatted);
          }
        } catch (e) {
          const formatted = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocationName(formatted);
          setAddressInput(formatted);
        }

        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('idle');
        alert("Unable to fetch your coordinates. Please verify your system or browser location permissions.");
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleBookingSubmit = async () => {
    if (!selectedHospital) {
      alert("Please select a target hospital for emergency delivery.");
      return;
    }
    if (!selectedAmbulance) {
      alert("Please select an ambulance type.");
      return;
    }

    const userId = currentUser ? currentUser.uid : 'anonymous';
    const bookingId = 'APS-' + Math.floor(100000 + Math.random() * 900000);
    const patientLabel = bookingFor === 'myself' 
      ? (userProfile?.fullName ? `${userProfile.fullName} (Self)` : 'Registered User (Self)')
      : 'Emergency Patient (Relative)';

    const newBooking = {
      userId: userId,
      id: bookingId,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      patient: patientLabel,
      pickup: locationName,
      hospital: selectedHospital.name,
      status: 'Ambulance Assigned 🚑',
      type: selectedAmbulance.name,
      price: 'FREE (₹0)',
      timestamp: serverTimestamp()
    };

    // 1. Attempt writing to Firestore (swallow connection errors silently if offline)
    try {
      await addDoc(collection(db, 'bookings'), newBooking);
    } catch (dbErr) {
      console.warn("Firestore sync offline, saving locally:", dbErr);
    }

    // 2. Cache locally in localStorage for offline availability
    const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([newBooking, ...localBookings]));

    // Trigger celebration
    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    alert(`🎉 Emergency Ambulance booked 100% FREE OF COST!\nBooking ID: ${newBooking.id}\nAmbulance: ${selectedAmbulance.name}\nTarget Hospital: ${selectedHospital.name} (${selectedHospital.distance} km away)\nETA: ${selectedAmbulance.eta} minutes.\nNavigating to Live Ambulance tracking...`);
    navigate('/track');
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', color: 'var(--secondary-color)', marginBottom: '10px' }}>🚑 Request Ambulance Dispatch</h1>
        <p style={{ color: 'var(--text-muted)' }}>Provide emergency accident details, lock coordinates, and assign nearest fleets.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        
        {/* Booking parameters column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Location Form */}
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--primary-color)' }} /> 1. Set Pickup Location
            </h3>

            {/* Address input */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text"
                placeholder="Search pickup coordinates (e.g. Madhapur)"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
              {searchLoading && <span style={{ position: 'absolute', right: '12px', top: '35%', fontSize: '12px', color: 'var(--text-muted)' }}>Searching...</span>}
              
              {/* Autocomplete Suggestions Panel */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  marginTop: '5px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => selectSuggestion(s)}
                      style={{
                        padding: '10px 15px',
                        fontSize: '13px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        color: 'var(--text-main)'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      📍 {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleLiveLocation}
              disabled={gpsStatus === 'loading'}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {gpsStatus === 'loading' ? <>📍 Fetching GPS location...</> : <>📍 Use Current Live Location</>}
            </button>
            
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>Current Coordinate Hub:</strong> {locationName}
            </p>
          </div>

          {/* Booking recipient radio buttons */}
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--accent-teal)' }} /> 2. Patient Recipient
            </h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="radio" name="bookingFor" checked={bookingFor === 'myself'} onChange={() => setBookingFor('myself')} style={{ accentColor: 'var(--primary-color)' }} />
                Myself
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="radio" name="bookingFor" checked={bookingFor === 'other'} onChange={() => setBookingFor('other')} style={{ accentColor: 'var(--primary-color)' }} />
                Someone Else
              </label>
            </div>
          </div>

          {/* Live Map Display */}
          <div className="glass-card" style={{ padding: '16px', background: 'white', minHeight: '380px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--secondary-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass className="animate-spin" style={{ animationDuration: '6s' }} size={16} /> Live Radar Dispatch Grid
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={mapCenter} icon={currentLocIcon}>
                  <Popup>🚑 Target Emergency Pickup Point</Popup>
                </Marker>

                {/* Dynamically render pins for nearby hospitals sorted by proximity */}
                {hospitalsList.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalPinIcon}>
                    <Popup>🏥 {h.name}<br/>Proximity: <strong>{h.distance} km</strong></Popup>
                  </Marker>
                ))}

                <MapRefresher coords={mapCenter} />
              </MapContainer>
            </div>
          </div>

        </div>

        {/* Responders Selection column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Hospital Selection */}
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hospital size={20} style={{ color: 'var(--accent-teal)' }} /> 3. Select Target Emergency Hospital
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
              Hospitals automatically sorted by calculated driving proximity to patient location.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hospitalsList.map((h, idx) => (
                <div 
                  key={h.id} 
                  onClick={() => setSelectedHospital(h)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: selectedHospital?.id === h.id ? '2px solid var(--accent-teal)' : '1px solid #e2e8f0',
                    background: selectedHospital?.id === h.id ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>{h.name}</h4>
                      {idx === 0 && (
                        <span style={{ background: '#166534', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          📍 NEAREST (Closest)
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Distance: <strong>{h.distance} km</strong> | Emergency Contact: {h.phone}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${h.beds > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                      ICU Beds: {h.beds}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Ambulance Fleet Selection */}
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ambulance size={20} style={{ color: 'var(--primary-color)' }} /> 4. Select Emergency Ambulance Fleet
          </h3>
          
          {/* Free Ambulance Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', color: '#166534', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎉 All Ambulance Dispatches are 100% FREE OF COST (Govt Emergency Service / APADHA SEVA)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ambulances.map((a) => (
              <div 
                key={a.id}
                onClick={() => setSelectedAmbulance(a)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: selectedAmbulance?.id === a.id ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                  background: selectedAmbulance?.id === a.id ? '#fef2f2' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--secondary-color)' }}>{a.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ETA: <strong>{a.eta} minutes</strong> | Proximity: {a.distance} km
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', fontSize: '13px', color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>
                    FREE (₹0)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Booking Summary Section */}
          <div className="glass-card" style={{
            padding: '30px',
            background: '#f8fafc',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '15px' }}>📋 Dispatch Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '20px' }}>
              <p><strong>Emergency Location:</strong> <span style={{ color: 'var(--text-muted)' }}>{locationName.substring(0, 50)}...</span></p>
              <p><strong>Target Hospital:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedHospital ? selectedHospital.name : 'Not selected'}</span></p>
              <p><strong>Ambulance Fleet:</strong> <span style={{ color: 'var(--text-muted)' }}>{selectedAmbulance ? selectedAmbulance.name : 'Not selected'}</span></p>
              <p><strong>Estimated ETA:</strong> <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{selectedAmbulance ? `${selectedAmbulance.eta} Minutes` : '--'}</span></p>
            </div>

            <button 
              onClick={handleBookingSubmit}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              <Sparkles size={16} /> Confirm Booking & Dispatch
            </button>
          </div>

        </div>

      </div>

      {/* Visual Emergency Instructions - Featuring Generated PNG Images */}
      <div style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '26px', color: 'var(--secondary-color)', marginBottom: '30px', textAlign: 'center' }}>
          🚨 Critical First Responder Instructions
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          
          <div className="glass-card" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img 
              src="/stay_calm.png" 
              alt="Stay Calm" 
              style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '15px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h4 style={{ fontSize: '15px', color: 'var(--secondary-color)', marginBottom: '6px' }}>1. Stay Calm</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Ensure your own personal safety first. Deep breaths help restore clear decision coordination.</p>
          </div>

          <div className="glass-card" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img 
              src="/do_not_move.png" 
              alt="Do Not Move Injured" 
              style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '15px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h4 style={{ fontSize: '15px', color: 'var(--secondary-color)', marginBottom: '6px' }}>2. Stabilize Position</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Do not move the injured patient unless immediate environmental danger (fire, slide) forces it.</p>
          </div>

          <div className="glass-card" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img 
              src="/first_aid.png" 
              alt="First Aid Kit" 
              style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '15px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h4 style={{ fontSize: '15px', color: 'var(--secondary-color)', marginBottom: '6px' }}>3. Apply First Aid</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Provide basic dressing or CPR support if certified. Otherwise, wait for approaching crews.</p>
          </div>

          <div className="glass-card" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img 
              src="/clear_road.png" 
              alt="Clear Road" 
              style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '15px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h4 style={{ fontSize: '15px', color: 'var(--secondary-color)', marginBottom: '6px' }}>4. Clear Response Path</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Coordinate with neighborhood bystanders to clear roadside parking for quick access.</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Booking;
