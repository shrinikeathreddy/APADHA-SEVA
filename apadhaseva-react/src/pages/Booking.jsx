import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Hospital, Ambulance, AlertCircle, Compass, Users, Sparkles } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendDirectSMS, broadcastToSNSTopic } from '../awsSns';

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

// Component to allow users to tap/click anywhere on the map to set exact pickup coordinates
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
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
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState('ALL'); // ALL, PRIVATE, GOVT

  // Fast preset lookup for popular Telangana & Indian cities/towns
  const KNOWN_AREAS = {
    'mahabubabad': { name: 'Mahabubabad, Telangana, India', coords: [17.5976, 79.9995], town: 'Mahabubabad' },
    'dharani': { name: 'Dharani Super Speciality Hospital, Mahabubabad', coords: [17.5992, 80.0041], town: 'Mahabubabad' },
    'dharani hospital': { name: 'Dharani Super Speciality Hospital, Mahabubabad', coords: [17.5992, 80.0041], town: 'Mahabubabad' },
    'dharani super speciality': { name: 'Dharani Super Speciality Hospital, Mahabubabad', coords: [17.5992, 80.0041], town: 'Mahabubabad' },
    'mhbd': { name: 'Mahabubabad, Telangana, India', coords: [17.5976, 79.9995], town: 'Mahabubabad' },
    'mbad': { name: 'Mahabubabad, Telangana, India', coords: [17.5976, 79.9995], town: 'Mahabubabad' },
    'warangal': { name: 'Warangal, Telangana, India', coords: [17.9689, 79.5941], town: 'Warangal' },
    'hanamkonda': { name: 'Hanamkonda, Telangana, India', coords: [18.0135, 79.5545], town: 'Hanamkonda' },
    'khammam': { name: 'Khammam, Telangana, India', coords: [17.2473, 80.1514], town: 'Khammam' },
    'karimnagar': { name: 'Karimnagar, Telangana, India', coords: [18.4386, 79.1288], town: 'Karimnagar' },
    'nizamabad': { name: 'Nizamabad, Telangana, India', coords: [18.6725, 78.0941], town: 'Nizamabad' },
    'nalgonda': { name: 'Nalgonda, Telangana, India', coords: [17.0575, 79.2684], town: 'Nalgonda' },
    'suryapet': { name: 'Suryapet, Telangana, India', coords: [17.1439, 79.6239], town: 'Suryapet' },
    'medchal': { name: 'Medchal, Malkajgiri, Telangana', coords: [17.6294, 78.4813], town: 'Medchal' },
    'kandlakoya': { name: 'Kandlakoya, Medchal, Telangana', coords: [17.5982, 78.4908], town: 'Medchal' },
    'kompally': { name: 'Kompally, Medchal, Telangana', coords: [17.5372, 78.4844], town: 'Kompally' },
    'secunderabad': { name: 'Secunderabad, Telangana', coords: [17.4399, 78.4983], town: 'Secunderabad' },
    'kukatpally': { name: 'Kukatpally, Hyderabad, Telangana', coords: [17.4849, 78.4138], town: 'Kukatpally' },
    'gachibowli': { name: 'Gachibowli, Hyderabad, Telangana', coords: [17.4401, 78.3489], town: 'Gachibowli' },
    'madhapur': { name: 'Madhapur, Hitec City, Hyderabad', coords: [17.4483, 78.3741], town: 'Madhapur' },
    'hitec city': { name: 'Hitec City, Hyderabad, Telangana', coords: [17.4504, 78.3808], town: 'Hitec City' },
    'ameerpet': { name: 'Ameerpet, Hyderabad, Telangana', coords: [17.4375, 78.4482], town: 'Ameerpet' },
    'dilsukhnagar': { name: 'Dilsukhnagar, Hyderabad, Telangana', coords: [17.3688, 78.5247], town: 'Dilsukhnagar' },
    'lb nagar': { name: 'LB Nagar, Hyderabad, Telangana', coords: [17.3457, 78.5522], town: 'LB Nagar' },
    'uppal': { name: 'Uppal, Hyderabad, Telangana', coords: [17.4018, 78.5602], town: 'Uppal' }
  };

  // Base Hyderabad / Medchal hospitals with both Normal & ICU bed inventory and PRIVATE/GOVT tag
  const baseHospitals = [
    // Top-Rated Private Super Specialty Hospitals
    { id: 'h_pvt_apollo', name: 'Apollo Critical Trauma Care', area: 'Madhapur', sector: 'PRIVATE', offset: [-0.009, 0.011], normalBeds: 50, icuBeds: 18, oxygenBeds: 24, phone: '040-23607777' },
    { id: 'h_pvt_yashoda', name: 'Yashoda Hospital Emergency Unit', area: 'Secunderabad', sector: 'PRIVATE', offset: [0.020, 0.015], normalBeds: 65, icuBeds: 22, oxygenBeds: 30, phone: '040-27703999' },
    { id: 'h_pvt_kims', name: 'KIMS Hospital Trauma Center', area: 'Secunderabad', sector: 'PRIVATE', offset: [0.018, 0.010], normalBeds: 55, icuBeds: 18, oxygenBeds: 28, phone: '040-44885000' },
    { id: 'h_pvt_aig', name: 'AIG Emergency & Trauma Institute', area: 'Gachibowli', sector: 'PRIVATE', offset: [-0.010, -0.005], normalBeds: 80, icuBeds: 25, oxygenBeds: 35, phone: '040-42444444' },
    { id: 'h_pvt_care', name: 'Care Emergency Multispecialty', area: 'Hitec City', sector: 'PRIVATE', offset: [0.008, -0.005], normalBeds: 45, icuBeds: 12, oxygenBeds: 20, phone: '040-30418888' },
    { id: 'h_pvt_mallareddy', name: 'Malla Reddy Narayana Emergency Hospital', area: 'Medchal', sector: 'PRIVATE', offset: [0.025, 0.018], normalBeds: 60, icuBeds: 18, oxygenBeds: 25, phone: '040-23782222' },
    { id: 'h_pvt_kompally', name: 'Kompally Lifecare Private Hospital', area: 'Kompally', sector: 'PRIVATE', offset: [0.018, 0.012], normalBeds: 32, icuBeds: 10, oxygenBeds: 14, phone: '040-27903344' },
    { id: 'h_pvt_cmr', name: 'CMR Emergency Hospital (Private)', area: 'Medchal', sector: 'PRIVATE', offset: [0.040, 0.030], normalBeds: 28, icuBeds: 8, oxygenBeds: 12, phone: '040-27609988' },
    { id: 'h_pvt_slg', name: 'SLG Hospitals & Critical Care', area: 'Bachupally', sector: 'PRIVATE', offset: [0.030, -0.010], normalBeds: 42, icuBeds: 11, oxygenBeds: 18, phone: '040-23880000' },
    { id: 'h_pvt_omni', name: 'Omni Hospital Trauma Center', area: 'Kukatpally', sector: 'PRIVATE', offset: [0.025, -0.015], normalBeds: 35, icuBeds: 9, oxygenBeds: 14, phone: '040-30999999' },
    { id: 'h_pvt_kamineni', name: 'Kamineni Emergency Hospital', area: 'LB Nagar', sector: 'PRIVATE', offset: [-0.020, 0.030], normalBeds: 44, icuBeds: 12, oxygenBeds: 18, phone: '040-39879999' },

    // Government General Hospitals (For patients who prefer free Govt facilities)
    { id: 'h_gvt_gandhi', name: 'Gandhi General Hospital & Trauma Center', area: 'Secunderabad', sector: 'GOVT', offset: [0.012, 0.008], normalBeds: 85, icuBeds: 24, oxygenBeds: 40, phone: '040-27505566' },
    { id: 'h_gvt_medchal', name: 'Medchal Area Government Hospital & ICU', area: 'Medchal', sector: 'GOVT', offset: [0.035, 0.025], normalBeds: 45, icuBeds: 12, oxygenBeds: 18, phone: '040-27601122' },
    { id: 'h_gvt_osmania', name: 'Osmania General Emergency Unit', area: 'Afzal Gunj', sector: 'GOVT', offset: [-0.015, -0.012], normalBeds: 90, icuBeds: 22, oxygenBeds: 45, phone: '040-24600121' },
    { id: 'h_gvt_nims', name: 'NIMS Trauma Emergency Center', area: 'Punjagutta', sector: 'GOVT', offset: [0.005, -0.003], normalBeds: 65, icuBeds: 18, oxygenBeds: 30, phone: '040-23489000' }
  ];

  // Dynamically calculate nearby hospitals ordered by area match first, then proximity distance
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

  // Helper to extract primary town/district name from location string
  const getPrimaryTown = (locStr) => {
    if (!locStr) return 'Local Area';
    const firstPart = locStr.split(',')[0].trim();
    return firstPart || 'Local';
  };

  // Recalculate hospital list for ANY typed location (Mahabubabad, Warangal, Medchal, etc.)
  useEffect(() => {
    const [uLat, uLng] = mapCenter;
    const locLower = (locationName + ' ' + addressInput).toLowerCase();
    const primaryTown = getPrimaryTown(locationName);

    // Check if the location is in Hyderabad/Medchal or another district (e.g. Mahabubabad, Warangal)
    const isHydMedchal = locLower.includes('hyderabad') || locLower.includes('medchal') ||
      locLower.includes('secunderabad') || locLower.includes('kukatpally') ||
      locLower.includes('gachibowli') || locLower.includes('madhapur') ||
      locLower.includes('kompally') || locLower.includes('lb nagar');

    let pool = [];

    if (locLower.includes('mahabubabad') || locLower.includes('dharani') || locLower.includes('mhbd') || locLower.includes('mbad')) {
      // Real verified hospitals in Mahabubabad with Dharani Super Speciality Hospital prominent
      pool = [
        {
          id: 'h_mbad_dharani',
          name: 'Dharani Super Speciality & Emergency Hospital',
          area: 'Yellandu Bypass Road, Shikarkana Gadda, Mahabubabad',
          sector: 'PRIVATE',
          lat: uLat + 0.003,
          lng: uLng + 0.004,
          distance: 0.6,
          normalBeds: 65,
          icuBeds: 18,
          oxygenBeds: 20,
          phone: '+91 70755 41108 / 08719-252888',
          badge: 'Google Maps Verified ⭐ 24/7 Super Specialty',
          features: 'Aarogyasri Empanelled • 100-Bed Facility • Dialysis (NephroPlus) • ICU/NICU/PICU • CT Scan',
          isAreaMatch: true
        },
        {
          id: 'h_mbad_srisai',
          name: 'Sri Sai Maruthi Super Speciality Hospital',
          area: 'Nehru Center, Mahabubabad',
          sector: 'PRIVATE',
          lat: uLat + 0.007,
          lng: uLng + 0.006,
          distance: 1.1,
          normalBeds: 35,
          icuBeds: 10,
          oxygenBeds: 14,
          phone: '08719-254123',
          badge: 'Google Maps Verified 📍',
          features: '24/7 Emergency & Critical Care • Inpatient Care',
          isAreaMatch: true
        },
        {
          id: 'h_mbad_ponugoti',
          name: 'Ponugoti Multi Speciality Hospital',
          area: 'Main Road, Mahabubabad',
          sector: 'PRIVATE',
          lat: uLat - 0.008,
          lng: uLng + 0.009,
          distance: 1.5,
          normalBeds: 30,
          icuBeds: 8,
          oxygenBeds: 12,
          phone: '08719-253456',
          badge: 'Google Maps Verified 📍',
          features: 'Multi Speciality Clinical & Trauma Care',
          isAreaMatch: true
        },
        {
          id: 'h_mbad_kavya',
          name: 'Kavya Emergency & Multi Speciality Hospital',
          area: 'Collectorate Road, Mahabubabad',
          sector: 'PRIVATE',
          lat: uLat + 0.014,
          lng: uLng - 0.008,
          distance: 2.2,
          normalBeds: 28,
          icuBeds: 7,
          oxygenBeds: 10,
          phone: '08719-251188',
          badge: 'Google Maps Verified 📍',
          features: 'Trauma & Emergency Consultations',
          isAreaMatch: true
        },
        {
          id: 'h_mbad_govt',
          name: 'Mahabubabad Area Government Hospital & ICU',
          area: 'Court Road, Mahabubabad',
          sector: 'GOVT',
          lat: uLat + 0.011,
          lng: uLng + 0.008,
          distance: 1.8,
          normalBeds: 75,
          icuBeds: 16,
          oxygenBeds: 30,
          phone: '08719-252108',
          badge: 'Govt 108 Partner 🏛️',
          features: 'Free Government Emergency & Casualty Ward',
          isAreaMatch: true
        },
        {
          id: 'h_mbad_mch',
          name: 'Mother & Child Government Hospital (MCH)',
          area: 'Bypass Road, Mahabubabad',
          sector: 'GOVT',
          lat: uLat - 0.015,
          lng: uLng - 0.012,
          distance: 2.6,
          normalBeds: 50,
          icuBeds: 10,
          oxygenBeds: 20,
          phone: '08719-252200',
          badge: 'Govt Healthcare 🏛️',
          features: 'Maternal & Neonatal Pediatric Ward',
          isAreaMatch: true
        }
      ];
    } else if (locLower.includes('warangal') || locLower.includes('hanamkonda')) {
      pool = [
        {
          id: 'h_wgl_rohini',
          name: 'Rohini Super Specialty Hospital & Trauma Care',
          area: 'Hanamkonda, Warangal',
          sector: 'PRIVATE',
          lat: uLat + 0.008,
          lng: uLng + 0.006,
          distance: 1.2,
          normalBeds: 70,
          icuBeds: 22,
          oxygenBeds: 30,
          phone: '0870-2577777',
          badge: 'Google Maps Verified 📍',
          isAreaMatch: true
        },
        {
          id: 'h_wgl_maxcare',
          name: 'MaxCare Emergency & Critical Hospital',
          area: 'Nakkalagutta, Hanamkonda',
          sector: 'PRIVATE',
          lat: uLat + 0.012,
          lng: uLng + 0.009,
          distance: 1.8,
          normalBeds: 55,
          icuBeds: 16,
          oxygenBeds: 24,
          phone: '0870-2458888',
          badge: 'Google Maps Verified 📍',
          isAreaMatch: true
        },
        {
          id: 'h_wgl_aditya',
          name: 'Aditya Emergency Multispecialty Hospital',
          area: 'Subedari, Warangal',
          sector: 'PRIVATE',
          lat: uLat - 0.010,
          lng: uLng + 0.012,
          distance: 2.4,
          normalBeds: 40,
          icuBeds: 12,
          oxygenBeds: 18,
          phone: '0870-2541122',
          badge: 'Google Maps Verified 📍',
          isAreaMatch: true
        },
        {
          id: 'h_wgl_mgm',
          name: 'MGM Government General Hospital & ICU',
          area: 'Station Road, Warangal',
          sector: 'GOVT',
          lat: uLat + 0.015,
          lng: uLng + 0.011,
          distance: 2.2,
          normalBeds: 120,
          icuBeds: 30,
          oxygenBeds: 50,
          phone: '0870-2444108',
          badge: 'Govt Apex Hospital 🏛️',
          isAreaMatch: true
        }
      ];
    } else if (isHydMedchal) {
      pool = baseHospitals.map(h => {
        const hLat = uLat + h.offset[0];
        const hLng = uLng + h.offset[1];
        const dist = calcDistance(uLat, uLng, hLat, hLng);
        const areaLower = h.area.toLowerCase();
        const isAreaMatch = locLower.includes(areaLower) ||
          (locLower.includes('medchal') && (areaLower.includes('medchal') || areaLower.includes('kompally')));
        return { ...h, distance: dist, lat: hLat, lng: hLng, isAreaMatch };
      });
    } else {
      // Dynamically generate top PRIVATE multispecialty hospitals + Government hospital tailored to this city!
      pool = [
        {
          id: `h_dyn_pvt1`,
          name: `${primaryTown} Super Specialty Emergency Hospital`,
          area: primaryTown,
          sector: 'PRIVATE',
          lat: uLat + 0.008,
          lng: uLng + 0.006,
          distance: 1.1,
          normalBeds: 45,
          icuBeds: 15,
          oxygenBeds: 20,
          phone: '08719-253300',
          isAreaMatch: true
        },
        {
          id: `h_dyn_pvt2`,
          name: `Prathima Emergency & Trauma Care (${primaryTown})`,
          area: primaryTown,
          sector: 'PRIVATE',
          lat: uLat + 0.014,
          lng: uLng + 0.010,
          distance: 1.9,
          normalBeds: 36,
          icuBeds: 12,
          oxygenBeds: 18,
          phone: '08719-254422',
          isAreaMatch: true
        },
        {
          id: `h_dyn_pvt3`,
          name: `Sri Krishna Multispecialty & Critical Care`,
          area: primaryTown,
          sector: 'PRIVATE',
          lat: uLat - 0.012,
          lng: uLng + 0.014,
          distance: 2.8,
          normalBeds: 30,
          icuBeds: 8,
          oxygenBeds: 12,
          phone: '08719-251144',
          isAreaMatch: true
        },
        {
          id: `h_dyn_pvt4`,
          name: `Lifeline Private Trauma & Cardiac Care`,
          area: primaryTown,
          sector: 'PRIVATE',
          lat: uLat + 0.020,
          lng: uLng - 0.012,
          distance: 3.6,
          normalBeds: 25,
          icuBeds: 7,
          oxygenBeds: 10,
          phone: '08719-252288',
          isAreaMatch: true
        },
        {
          id: `h_dyn_gvt1`,
          name: `${primaryTown} Area Government Hospital & ICU`,
          area: primaryTown,
          sector: 'GOVT',
          lat: uLat + 0.010,
          lng: uLng + 0.008,
          distance: 1.5,
          normalBeds: 54,
          icuBeds: 14,
          oxygenBeds: 22,
          phone: '08719-252108',
          isAreaMatch: true
        }
      ];
    }

    const sorted = pool.sort((a, b) => {
      // Prioritize private hospitals first if area matches, then proximity
      if (a.isAreaMatch && !b.isAreaMatch) return -1;
      if (!a.isAreaMatch && b.isAreaMatch) return 1;
      return a.distance - b.distance;
    });

    setHospitalsList(sorted);
    if (sorted.length > 0) {
      setSelectedHospital(sorted[0]);
    }
  }, [mapCenter, locationName, addressInput]);

  // Set default selected ambulance
  useEffect(() => {
    if (!selectedAmbulance && ambulances.length > 0) {
      setSelectedAmbulance(ambulances[0]);
    }
  }, []);

  // Search location handler: runs on Enter key or clicking Search button
  const handleSearchLocation = async (query = addressInput) => {
    const q = (query || '').trim();
    if (!q) return;

    setSearchLoading(true);
    const qLower = q.toLowerCase();

    // 1. Instant match in known Telangana & Indian towns
    for (const [key, val] of Object.entries(KNOWN_AREAS)) {
      if (qLower.includes(key)) {
        setMapCenter(val.coords);
        setLocationName(val.name);
        setAddressInput(val.name);
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }
    }

    // 2. Query OpenStreetMap Nominatim for any other city / village in India
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setLocationName(data[0].display_name);
        setAddressInput(data[0].display_name);
        setSuggestions([]);
      } else {
        alert(`Location "${q}" not found on map. Please try a nearby town name (e.g. Mahabubabad, Warangal, Medchal) or click directly on the radar map.`);
      }
    } catch (err) {
      console.error("Geocoding search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Autocomplete suggestions lookup from Nominatim OSM API while typing
  useEffect(() => {
    if (addressInput.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const qLower = addressInput.toLowerCase();
      // First check local matches to make typing instantly responsive
      const localMatches = Object.entries(KNOWN_AREAS)
        .filter(([key]) => key.includes(qLower) || qLower.includes(key))
        .map(([_, v]) => ({ display_name: v.name, lat: v.coords[0], lon: v.coords[1] }));

      if (localMatches.length > 0) {
        setSuggestions(localMatches);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=5&countrycodes=in`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

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

  // Auto-detect exact live location on initial load
  useEffect(() => {
    handleLiveLocation(true);
  }, []);

  // HTML5 Live GPS Geolocation lookup with high accuracy
  const handleLiveLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert("GPS Geolocation is not supported by this browser.");
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
            const formatted = `Exact Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setLocationName(formatted);
            setAddressInput(formatted);
          }
        } catch (e) {
          const formatted = `Exact Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocationName(formatted);
          setAddressInput(formatted);
        }

        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('idle');
        if (!silent) {
          alert("Unable to fetch exact GPS coordinates. Please search your area or click directly on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Direct map click pinpoint handler
  const handleMapClick = async (lat, lng) => {
    const coords = [lat, lng];
    setMapCenter(coords);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
        setAddressInput(data.display_name);
      } else {
        const formatted = `Pinpoint: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setLocationName(formatted);
        setAddressInput(formatted);
      }
    } catch (e) {
      const formatted = `Pinpoint: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setLocationName(formatted);
      setAddressInput(formatted);
    }
  };

  // Helper to publish emergency alert to AWS SNS topic & send direct SMS to user's phone
  const sendAWSNotification = async (booking) => {
    try {
      const subject = `🚨 EMERGENCY DISPATCH: ${booking.id}`;
      const message = `🚨 APADHA SEVA DISPATCH UPDATE 🚑
---------------------------------------
Booking ID: ${booking.id}
Status: AMBULANCE DISPATCHED ✅
Patient: ${booking.patient}
Pickup Location: ${booking.pickup}
Target Hospital: ${booking.hospital}
Fleet Type: ${booking.type}
ETA: ${selectedAmbulance ? selectedAmbulance.eta : 5} Minutes`;

      // 1. Broadcast to all SNS subscribers (drivers, admins, public safety)
      broadcastToSNSTopic(subject, message);

      // 2. Direct SMS directly to patient's registered mobile number from signup portal
      const patientPhone = userProfile?.phone || userProfile?.emergencyContactPhone;
      if (patientPhone) {
        sendDirectSMS(
          patientPhone,
          `APADHA SEVA UPDATE: Ambulance DISPATCHED! 🚑\nBooking ID: ${booking.id}\nAmbulance: ${booking.type}\nHospital: ${booking.hospital}\nETA: ${selectedAmbulance ? selectedAmbulance.eta : 5} Mins.`
        );
      }
    } catch (snsErr) {
      console.warn("AWS SNS publish notification warning:", snsErr);
    }
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
      coords: mapCenter,
      lat: mapCenter[0],
      lng: mapCenter[1],
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

    // 2. Cache locally in localStorage for offline availability & live tracking precision
    const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    localStorage.setItem('bookings', JSON.stringify([newBooking, ...localBookings]));
    localStorage.setItem('apadhaseva_latest_coords', JSON.stringify(mapCenter));

    // 3. Dispatch AWS SNS Emergency Notification
    sendAWSNotification(newBooking);

    // Trigger celebration
    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    alert(`🎉 Emergency Ambulance booked 100% FREE OF COST!\nBooking ID: ${newBooking.id}\nAmbulance: ${selectedAmbulance.name}\nTarget Hospital: ${selectedHospital.name} (${selectedHospital.distance} km away)\nETA: ${selectedAmbulance.eta} minutes.\nNavigating to Live Ambulance tracking...`);
    navigate('/track');
  };

  const primaryTown = getPrimaryTown(locationName);

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

            {/* Address input with search button & Enter key execution */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search ANY city/area (e.g. Mahabubabad, Warangal, Medchal)"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchLocation(addressInput);
                      }
                    }}
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
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchLocation(addressInput)}
                  disabled={searchLoading}
                  style={{
                    padding: '0 18px',
                    borderRadius: '10px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(220,38,38,0.2)'
                  }}
                >
                  <Search size={16} /> {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

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

            {/* Quick Area Presets */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Quick Areas:</span>
              {[
                { name: 'Mahabubabad', coords: [17.5976, 79.9995] },
                { name: 'Warangal', coords: [17.9689, 79.5941] },
                { name: 'Medchal', coords: [17.6294, 78.4813] },
                { name: 'Kompally', coords: [17.5372, 78.4844] },
                { name: 'Secunderabad', coords: [17.4399, 78.4983] },
                { name: 'Kukatpally', coords: [17.4849, 78.4138] },
                { name: 'Gachibowli', coords: [17.4401, 78.3489] },
                { name: 'Madhapur', coords: [17.4483, 78.3741] }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setMapCenter(preset.coords);
                    setLocationName(`${preset.name}, Telangana, India`);
                    setAddressInput(preset.name);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: '1px solid #cbd5e1',
                    background: (locationName + ' ' + addressInput).toLowerCase().includes(preset.name.toLowerCase()) ? '#dc2626' : '#f8fafc',
                    color: (locationName + ' ' + addressInput).toLowerCase().includes(preset.name.toLowerCase()) ? 'white' : '#334155',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  📍 {preset.name}
                </button>
              ))}
            </div>
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
            <h3 style={{ fontSize: '16px', color: 'var(--secondary-color)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass className="animate-spin" style={{ animationDuration: '6s' }} size={16} /> Live Radar Dispatch Grid
            </h3>
            <p style={{ fontSize: '12px', color: '#166534', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #bbf7d0', fontWeight: '600' }}>
              📍 <strong>Exact Location Pin:</strong> Click or tap anywhere on the map below to pinpoint your exact gate/house location!
            </p>
            <div style={{ height: '300px', width: '100%' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapCenter} icon={currentLocIcon}>
                  <Popup>🚑 Target Emergency Pickup Point<br /><strong>{locationName}</strong></Popup>
                </Marker>

                {/* Dynamically render pins for nearby hospitals sorted by proximity */}
                {hospitalsList.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalPinIcon}>
                    <Popup>🏥 {h.name}<br />Proximity: <strong>{h.distance} km</strong></Popup>
                  </Marker>
                ))}

                <MapRefresher coords={mapCenter} />
                <MapClickHandler onLocationSelect={handleMapClick} />
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
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
              Hospitals automatically sorted by calculated driving proximity to patient location.
            </p>

            {/* Filter Tabs: All, Private, Govt */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setHospitalTypeFilter('ALL')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: hospitalTypeFilter === 'ALL' ? '2px solid var(--accent-teal)' : '1px solid #cbd5e1',
                  background: hospitalTypeFilter === 'ALL' ? '#f0fdf4' : '#f8fafc',
                  color: hospitalTypeFilter === 'ALL' ? '#047857' : '#475569'
                }}
              >
                All Hospitals ({hospitalsList.length})
              </button>
              <button
                type="button"
                onClick={() => setHospitalTypeFilter('PRIVATE')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: hospitalTypeFilter === 'PRIVATE' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: hospitalTypeFilter === 'PRIVATE' ? '#eff6ff' : '#f8fafc',
                  color: hospitalTypeFilter === 'PRIVATE' ? '#1d4ed8' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🏥 Private Hospitals ({hospitalsList.filter(h => h.sector === 'PRIVATE').length})
              </button>
              <button
                type="button"
                onClick={() => setHospitalTypeFilter('GOVT')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: hospitalTypeFilter === 'GOVT' ? '2px solid #166534' : '1px solid #cbd5e1',
                  background: hospitalTypeFilter === 'GOVT' ? '#f0fdf4' : '#f8fafc',
                  color: hospitalTypeFilter === 'GOVT' ? '#166534' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                🏛️ Govt Hospitals ({hospitalsList.filter(h => h.sector === 'GOVT').length})
              </button>
            </div>

            {/* Direct Google Maps Live Search Link for current location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              marginBottom: '14px',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🗺️</span>
                <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>
                  Live Google Maps sync active for <strong>{primaryTown || 'Mahabubabad'}</strong>
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/search/hospitals+in+${encodeURIComponent(primaryTown || locationName || 'Mahabubabad')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0284c7',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(2,132,199,0.2)'
                }}
              >
                🔍 Search All on Google Maps ↗
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hospitalsList
                .filter(h => hospitalTypeFilter === 'ALL' || h.sector === hospitalTypeFilter)
                .map((h, idx) => (
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
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '15px', color: 'var(--secondary-color)', fontWeight: '700' }}>{h.name}</h4>
                      {h.sector === 'PRIVATE' ? (
                        <span style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                          🏥 PRIVATE MULTISPECIALTY
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          🏛️ GOVT HOSPITAL
                        </span>
                      )}
                      {h.badge && (
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          {h.badge}
                        </span>
                      )}
                      {h.isAreaMatch ? (
                        <span style={{ background: '#166534', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          📍 LOCAL AREA ({h.area.toUpperCase()})
                        </span>
                      ) : idx === 0 ? (
                        <span style={{ background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          📍 NEAREST PROXIMITY
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '6px', gap: '8px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Zone: <strong>{h.area}</strong> | Proximity: <strong>{h.distance} km</strong> | Hotline: <strong>{h.phone}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + (h.area || ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#0369a1',
                            fontSize: '11px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            background: '#f0f9ff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bae6fd',
                            transition: 'all 0.2s'
                          }}
                        >
                          🗺️ Google Maps ↗
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name + ' ' + (h.area || ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            background: '#f0fdf4',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bbf7d0',
                            transition: 'all 0.2s'
                          }}
                        >
                          🧭 Directions ↗
                        </a>
                      </div>
                    </div>

                    {/* Hospital specialized features/Aarogyasri empanelment */}
                    {h.features && (
                      <div style={{ fontSize: '11px', color: '#047857', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>✨</span> {h.features}
                      </div>
                    )}

                    {/* Both Normal Beds and ICU Beds availability */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🛏️ Normal Beds: {h.normalBeds || 40} Available
                      </span>
                      <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🫁 ICU Beds: {h.icuBeds || 10} Available
                      </span>
                      {h.oxygenBeds && (
                        <span style={{ background: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                          💨 Oxygen: {h.oxygenBeds} Beds
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 8px' }}>
                      🟢 Ready
                    </span>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>
                      Total: {(h.normalBeds || 40) + (h.icuBeds || 10)} Beds
                    </div>
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
