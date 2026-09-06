import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  Filter, 
  Download, 
  Radio,
  MapPin,
  RefreshCw,
  Sliders,
  Building2,
  PhoneCall,
  UserPlus,
  Plus,
  X,
  ShieldCheck
} from 'lucide-react';

const AdminPortal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modals for adding Driver and Admin
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // New Driver Form State
  const [newDriver, setNewDriver] = useState({
    driver: '',
    phone: '',
    vehicleNo: '',
    type: 'ALS Cardiac ICU',
    sector: 'Madhapur Zone 1'
  });

  // New Admin Form State
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Dispatch Operations Officer',
    region: 'Greater Hyderabad HQ'
  });

  // Operational Metrics
  const metrics = [
    { label: 'Active Emergency Calls', value: '14', change: '+3 in last hour', color: '#dc2626', icon: ShieldAlert },
    { label: 'Ambulances Online', value: '42 / 48', change: '87.5% fleet active', color: '#16a34a', icon: Truck },
    { label: 'Avg Dispatch Time', value: '3.4 min', change: '-12s vs weekly avg', color: '#0284c7', icon: Clock },
    { label: 'Hospital ER Link', value: '28 Connected', change: '100% operational', color: '#0d9488', icon: Building2 }
  ];

  // Registered Admin System Users
  const [adminUsers, setAdminUsers] = useState(() => {
    const saved = localStorage.getItem('apadhaseva_admin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: 'ADM-01', name: 'N. Shrinikeath Reddy', email: 'admin@apadhaseva.com', role: 'Super Admin', region: 'Greater Hyderabad HQ' },
      { id: 'ADM-02', name: 'Pooja Hegde', email: 'pooja.dispatch@apadhaseva.com', role: 'Chief Dispatcher', region: 'Cyberabad Sector' }
    ];
  });

  // Fleet Roster Data
  const [fleet, setFleet] = useState(() => {
    const saved = localStorage.getItem('apadhaseva_fleet');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: 'AMB-101', vehicleNo: 'AP-09-AX-9901', driver: 'Rajesh Sharma', phone: '+91 98765 00001', type: 'ALS Cardiac ICU', status: 'IN_RESCUE', sector: 'Madhapur Zone 1', battery: '98%' },
      { id: 'AMB-102', vehicleNo: 'TS-08-EM-1008', driver: 'Suresh Verma', phone: '+91 98765 00002', type: 'BLS Emergency', status: 'AVAILABLE', sector: 'Jubilee Hills Checkpost', battery: '92%' },
      { id: 'AMB-103', vehicleNo: 'AP-11-Z-4040', driver: 'Mohammed Ali', phone: '+91 98765 00003', type: 'Neonatal ICU', status: 'AVAILABLE', sector: 'Gachibowli Financial Dist', battery: '100%' },
      { id: 'AMB-104', vehicleNo: 'TS-07-ER-9988', driver: 'K. Ramakrishna', phone: '+91 98765 00004', type: 'ALS Cardiac ICU', status: 'IN_RESCUE', sector: 'Banjara Hills Rd 12', battery: '85%' },
      { id: 'AMB-105', vehicleNo: 'TS-09-EM-5544', driver: 'Venkat Rao', phone: '+91 98765 00005', type: 'BLS Emergency', status: 'MAINTENANCE', sector: 'Secunderabad Depot', battery: '45%' },
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('apadhaseva_fleet', JSON.stringify(fleet));
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem('apadhaseva_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Live Emergency Dispatch Logs
  const [activeDispatches, setActiveDispatches] = useState([
    { id: 'EMG-9021', patient: 'K. Srinivasa Rao', condition: 'Cardiac Chest Pain', priority: 'CRITICAL', assignedVehicle: 'AP-09-AX-9901', hospital: 'CARE Hospitals, Gachibowli', status: 'EN_ROUTE_PATIENT', eta: '4 min' },
    { id: 'EMG-9018', patient: 'Priya Sharma', condition: 'Accident Fracture', priority: 'HIGH', assignedVehicle: 'TS-07-ER-9988', hospital: 'Apollo Hospitals, Jubilee Hills', status: 'PATIENT_ONBOARD', eta: '8 min' },
    { id: 'EMG-9015', patient: 'Ravi Kumar', condition: 'Stroke Symptoms', priority: 'CRITICAL', assignedVehicle: 'Unassigned', hospital: 'KIMS Hospital, Begumpet', status: 'PENDING_DISPATCH', eta: 'Calculating' },
    { id: 'EMG-9012', patient: 'Deepa Gupta', condition: 'High Fever & Convulsions', priority: 'MEDIUM', assignedVehicle: 'TS-08-EM-1008', hospital: 'Sunshine Hospital, Gachibowli', status: 'COMPLETED', eta: '0 min' },
  ]);

  const handleAssignDriver = (dispatchId, vehicleNo) => {
    setActiveDispatches(prev => prev.map(d => {
      if (d.id === dispatchId) {
        return { ...d, assignedVehicle: vehicleNo, status: 'DISPATCHED', eta: '5 min' };
      }
      return d;
    }));
  };

  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    if (!newDriver.driver || !newDriver.vehicleNo || !newDriver.phone) {
      alert("Please fill in driver name, phone, and vehicle registration number.");
      return;
    }

    const created = {
      id: `AMB-${100 + fleet.length + 1}`,
      vehicleNo: newDriver.vehicleNo.toUpperCase(),
      driver: newDriver.driver,
      phone: newDriver.phone,
      type: newDriver.type,
      status: 'AVAILABLE',
      sector: newDriver.sector,
      battery: '100%'
    };

    setFleet(prev => [created, ...prev]);
    setShowDriverModal(false);
    setNewDriver({ driver: '', phone: '', vehicleNo: '', type: 'ALS Cardiac ICU', sector: 'Madhapur Zone 1' });
  };

  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) {
      alert("Please fill in admin name and email.");
      return;
    }

    const created = {
      id: `ADM-0${adminUsers.length + 1}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      region: newAdmin.region
    };

    setAdminUsers(prev => [...prev, created]);
    setShowAdminModal(false);
    setNewAdmin({ name: '', email: '', phone: '', role: 'Dispatch Operations Officer', region: 'Greater Hyderabad HQ' });
  };

  const handleExportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "DispatchID,Patient,Condition,Priority,AssignedVehicle,Hospital,Status\n"
      + activeDispatches.map(e => `${e.id},${e.patient},${e.condition},${e.priority},${e.assignedVehicle},${e.hospital},${e.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apadhaseva_emergency_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDispatches = activeDispatches.filter(d => {
    const matchesSearch = d.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && d.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '32px 20px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white' }}>Admin Operations Center</h1>
              <span className="badge badge-danger animate-pulse" style={{ fontSize: '13px' }}>
                <Radio size={14} /> LIVE COMMAND CENTER
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              APADHA SEVA Central Emergency Dispatch & Ambulance Fleet Manager • Greater Hyderabad Region
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowDriverModal(true)}
              className="btn-primary"
              style={{ background: '#0d9488' }}
            >
              <Truck size={18} /> + Add Driver Partner
            </button>

            <button 
              onClick={() => setShowAdminModal(true)}
              className="btn-primary"
              style={{ background: '#2563eb' }}
            >
              <UserPlus size={18} /> + Add System Admin
            </button>

            <button 
              onClick={handleExportLogs}
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {metrics.map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '24px', borderLeft: `6px solid ${m.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>{m.label}</span>
                <IconComponent size={22} color={m.color} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px', color: 'var(--text-main)' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: m.color, marginTop: '4px' }}>
                {m.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Admin Roster Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#2563eb" /> Active System Administrators ({adminUsers.length})
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {adminUsers.map(usr => (
            <div key={usr.id} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                {usr.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{usr.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{usr.role} • {usr.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Control Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginBottom: '36px' }}>
        
        {/* LEFT: LIVE DISPATCH MONITOR */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={22} color="var(--primary-color)" /> Emergency Call Monitor
            </h2>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search patient, ID, condition..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px'
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              </div>

              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING_DISPATCH">Pending Dispatch</option>
                <option value="EN_ROUTE_PATIENT">En Route</option>
                <option value="PATIENT_ONBOARD">Patient Onboard</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Dispatch Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 8px' }}>Call ID</th>
                  <th style={{ padding: '12px 8px' }}>Patient / Condition</th>
                  <th style={{ padding: '12px 8px' }}>Priority</th>
                  <th style={{ padding: '12px 8px' }}>Assigned Ambulance</th>
                  <th style={{ padding: '12px 8px' }}>Hospital ER</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.map(dispatch => (
                  <tr key={dispatch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '700' }}>{dispatch.id}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ fontWeight: '600' }}>{dispatch.patient}</div>
                      <div style={{ fontSize: '12px', color: '#dc2626' }}>{dispatch.condition}</div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span className={`badge ${dispatch.priority === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {dispatch.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      {dispatch.assignedVehicle !== 'Unassigned' ? (
                        <div style={{ fontWeight: '600', color: '#0d9488' }}>🚑 {dispatch.assignedVehicle}</div>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: '600' }}>⚠️ Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: '13px', color: '#475569' }}>
                      {dispatch.hospital}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      {dispatch.assignedVehicle === 'Unassigned' ? (
                        <button 
                          onClick={() => handleAssignDriver(dispatch.id, fleet[0]?.vehicleNo || 'TS-08-EM-1008')}
                          className="btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Auto-Assign
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                          ✓ Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: AMBULANCE FLEET STATUS */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={22} color="var(--accent-teal)" /> Fleet Roster ({fleet.length})
            </h2>
            <button onClick={() => setShowDriverModal(true)} style={{ background: 'transparent', border: 'none', color: '#0d9488', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
            {fleet.map(veh => (
              <div key={veh.id} style={{
                padding: '14px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>{veh.vehicleNo}</span>
                  <span className={`badge ${
                    veh.status === 'AVAILABLE' ? 'badge-success' :
                    veh.status === 'IN_RESCUE' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {veh.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Driver: <strong>{veh.driver}</strong> ({veh.phone})
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px', color: '#64748b' }}>
                  <span>🏷️ {veh.type}</span>
                  <span>📍 {veh.sector}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: ADD DRIVER PARTNER */}
      {showDriverModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="#0d9488" /> Register New Driver Partner
              </h3>
              <button onClick={() => setShowDriverModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddDriverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Driver Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newDriver.driver}
                  onChange={(e) => setNewDriver({...newDriver, driver: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+91 9876543210"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Reg No. *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="TS-09-EM-9999"
                    value={newDriver.vehicleNo}
                    onChange={(e) => setNewDriver({...newDriver, vehicleNo: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ambulance Category</label>
                <select 
                  value={newDriver.type}
                  onChange={(e) => setNewDriver({...newDriver, type: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                >
                  <option value="ALS Cardiac ICU">ALS Cardiac ICU (Advanced Life Support)</option>
                  <option value="BLS Emergency">BLS Emergency (Basic Life Support)</option>
                  <option value="Neonatal ICU">Neonatal Pediatric ICU</option>
                  <option value="First-Responder Bike">First-Responder Emergency Bike</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Assigned Sector Base</label>
                <input 
                  type="text" 
                  placeholder="e.g. Madhapur Zone 1"
                  value={newDriver.sector}
                  onChange={(e) => setNewDriver({...newDriver, sector: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowDriverModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#0d9488' }}>
                  Save Driver Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SYSTEM ADMIN */}
      {showAdminModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={22} color="#2563eb" /> Add System Administrator
              </h3>
              <button onClick={() => setShowAdminModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Administrator Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Anish Sharma"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Official Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="anish.admin@apadhaseva.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Administrative Designation</label>
                <select 
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                >
                  <option value="Dispatch Operations Officer">Dispatch Operations Officer</option>
                  <option value="Hospital ER Coordinator">Hospital ER Coordinator</option>
                  <option value="Fleet Supervisor">Fleet Supervisor</option>
                  <option value="Super Admin">Super Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAdminModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#2563eb' }}>
                  Create Admin Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
