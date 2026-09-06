import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, MapPin, Activity, CheckCircle, XCircle, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const History = () => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};

    const defaultDemo = [
      {
        id: 'APS-2026001',
        date: '11 Jul 2026',
        patient: 'Registered User (Self)',
        pickup: 'Madhapur, Cyber Towers Junction',
        hospital: 'Gandhi Government General Hospital',
        status: 'Completed',
        type: 'ICU Ambulance'
      },
      {
        id: 'APS-2025987',
        date: '05 Jul 2026',
        patient: 'Nookala Shrinikeath Reddy (Father)',
        pickup: 'Gachibowli Stadium Road',
        hospital: 'Apollo Medical Hospital',
        status: 'Cancelled',
        type: 'Basic Ambulance'
      },
      {
        id: 'APS-2025912',
        date: '28 Jun 2026',
        patient: 'Unknown (Accident Victim)',
        pickup: 'Kukatpally Highway Overpass',
        hospital: 'NIMS Trauma Care',
        status: 'Completed',
        type: 'Oxygen Ambulance'
      }
    ];

    if (currentUser) {
      try {
        const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const dbBookings = [];
          snapshot.forEach((docSnap) => {
            dbBookings.push({ docId: docSnap.id, ...docSnap.data() });
          });

          dbBookings.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

          const stored = localStorage.getItem('bookings');
          let localList = [];
          if (stored) {
            try { localList = JSON.parse(stored); } catch (e) {}
          }

          const merged = [...dbBookings];
          localList.forEach(item => {
            if (!merged.some(m => m.id === item.id)) merged.push(item);
          });
          defaultDemo.forEach(item => {
            if (!merged.some(m => m.id === item.id)) merged.push(item);
          });

          setBookings(merged);
          setLoading(false);
        }, (error) => {
          console.warn("Firestore history snapshot error:", error);
          setBookings(defaultDemo);
          setLoading(false);
        });
      } catch (err) {
        console.error("Firestore query init error:", err);
        setBookings(defaultDemo);
        setLoading(false);
      }
    } else {
      const stored = localStorage.getItem('bookings');
      let localList = [];
      if (stored) {
        try { localList = JSON.parse(stored); } catch (e) {}
      }
      const merged = [...localList];
      defaultDemo.forEach(item => {
        if (!merged.some(m => m.id === item.id)) merged.push(item);
      });
      setBookings(merged);
      setLoading(false);
    }

    return () => unsubscribeSnapshot();
  }, [currentUser, isLoggedIn, navigate]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.patient.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && b.status.toLowerCase().includes('complete');
    if (filterStatus === 'cancelled') return matchesSearch && b.status.toLowerCase().includes('cancel');
    return matchesSearch;
  });

  const totals = bookings.reduce((acc, curr) => {
    if (curr.status.toLowerCase().includes('complete')) acc.completed += 1;
    else if (curr.status.toLowerCase().includes('cancel')) acc.cancelled += 1;
    acc.total += 1;
    return acc;
  }, { total: 0, completed: 0, cancelled: 0 });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '600' }}>🔄 Retrieving Ambulance Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '85vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>📋 Rescue History Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review details of your previous ambulance bookings and paramedic response files.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '20px', background: 'white', textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Total Rescues</h4>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary-color)' }}>{totals.total}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', background: 'white', textAlign: 'center', borderBottom: '3px solid #166534' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Completed</h4>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#166534' }}>{totals.completed}</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', background: 'white', textAlign: 'center', borderBottom: '3px solid #991b1b' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Cancelled / Refused</h4>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#991b1b' }}>{totals.cancelled}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card" style={{
        padding: '20px',
        background: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search booking ID, victim, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFilterStatus('all')}
            style={{
              background: filterStatus === 'all' ? 'var(--secondary-color)' : '#f1f5f9',
              color: filterStatus === 'all' ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          <button 
            onClick={() => setFilterStatus('completed')}
            style={{
              background: filterStatus === 'completed' ? 'var(--secondary-color)' : '#f1f5f9',
              color: filterStatus === 'completed' ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilterStatus('cancelled')}
            style={{
              background: filterStatus === 'cancelled' ? 'var(--secondary-color)' : '#f1f5f9',
              color: filterStatus === 'cancelled' ? 'white' : 'var(--text-main)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b, idx) => (
            <div key={idx} className="glass-card" style={{
              padding: '24px',
              background: 'white',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--secondary-color)' }}>{b.id}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {b.date}
                  </span>
                  <span className="badge badge-warning" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {b.type}
                  </span>
                </div>
                
                <p style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '6px' }}>
                  <strong>Patient:</strong> {b.patient}
                </p>
                
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <MapPin size={14} /> <strong>Pickup:</strong> {b.pickup}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={14} /> <strong>Hospital:</strong> {b.hospital}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <span className={`badge ${b.status.toLowerCase().includes('complete') ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {b.status.toLowerCase().includes('complete') ? <><CheckCircle size={14} /> Completed</> : <><XCircle size={14} /> Cancelled</>}
                </span>
                
                <button 
                  onClick={() => alert(`Downloading medical report receipt for rescue booking ID ${b.id}...`)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-teal)',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} /> Paramedic Log
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: '40px', background: 'white', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No historical ambulance logs found matching search filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default History;
