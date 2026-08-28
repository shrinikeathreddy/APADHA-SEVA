import React, { useState } from 'react';
import { Activity, ShieldAlert, Heart, RefreshCw, Volume2, Info } from 'lucide-react';

const FirstAid = () => {
  const [activeTab, setActiveTab] = useState('cpr');

  const guides = {
    cpr: {
      title: "❤️ Adult CPR (Cardiopulmonary Resuscitation)",
      warning: "Only perform CPR if the person is unconscious and NOT breathing normally.",
      steps: [
        { title: "Call Emergency Dispatchers", text: "Dial 108 immediately and activate the speakerphone. Place the phone beside the patient." },
        { title: "Check Respiration & Airways", text: "Look closely at the chest for rise/fall. Listen for breathing sounds. If none, prepare for chest compressions." },
        { title: "Hand Positioning", text: "Place the heel of one hand on the center of the person's chest (on the lower half of the breastbone). Interlock your other hand on top." },
        { title: "Push Hard & Fast", text: "Compress the chest at least 2 inches deep. Rate: 100 to 120 compressions per minute (to the beat of Stayin' Alive)." },
        { title: "Minimize Interruptions", text: "Keep pushing continuously. Do not stop compressions until medical paramedics arrive to take over." }
      ]
    },
    choking: {
      title: "🫁 Choking (Heimlich Maneuver)",
      warning: "Perform only if the patient is fully unable to speak, breathe, or cough effectively.",
      steps: [
        { title: "Stand Behind the Victim", text: "Wrap your arms around their waist. Lean the patient slightly forward." },
        { title: "Fist Positioning", text: "Make a fist with one hand. Place the thumb side of your fist slightly above the patient's navel (well below the breastbone)." },
        { title: "Grasp Your Fist", text: "Grasp your fist firmly with your other hand. Prepare to execute quick thrusts." },
        { title: "Perform Upward Thrusts", text: "Press hard into the abdomen with a quick, upward thrust. Repeat until the obstructing object is dislodged." },
        { title: "If Patient Unconscious", text: "If the patient loses consciousness, lower them carefully to the ground and initiate emergency CPR immediately." }
      ]
    },
    bleeding: {
      title: "🩸 Severe Bleeding Control",
      warning: "Ensure your own safety. If possible, wear sterile medical gloves before applying direct pressure.",
      steps: [
        { title: "Apply Direct Pressure", text: "Place a sterile gauze pad or clean cloth directly over the wound. Press firmly with both hands." },
        { title: "Elevate Wound Center", text: "Raise the bleeding extremity above heart level if it doesn't cause further skeletal injuries." },
        { title: "Maintain Pressure Constant", text: "Keep pressing continuously for at least 5 minutes. Do not lift the dressing to check if bleeding has stopped." },
        { title: "Apply Pressure Dressing", text: "Wrap a bandage tightly over the gauze dressing. Ensure it's secure but doesn't restrict arterial pulse." },
        { title: "Watch for Shock Symptoms", text: "Keep the patient warm and lying flat. Alert the approaching ambulance crew of heavy blood loss." }
      ]
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>🩺 First-Aid Emergency Guidelines</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quick reference procedures while waiting for the ambulance. Standby for paramedic assistance.</p>
        </div>
        <button style={{
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} onClick={() => {
          alert("Audio guide activated! (Simulation: Voice commands reading guidelines in real time to helper)");
        }}>
          <Volume2 size={16} /> Audio Assistant
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('cpr')}
          style={{
            background: activeTab === 'cpr' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'cpr' ? 'white' : 'var(--secondary-color)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'all 0.2s'
          }}
        >
          Cardiopulmonary Resuscitation (CPR)
        </button>
        <button 
          onClick={() => setActiveTab('choking')}
          style={{
            background: activeTab === 'choking' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'choking' ? 'white' : 'var(--secondary-color)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'all 0.2s'
          }}
        >
          Choking Relief
        </button>
        <button 
          onClick={() => setActiveTab('bleeding')}
          style={{
            background: activeTab === 'bleeding' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'bleeding' ? 'white' : 'var(--secondary-color)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'all 0.2s'
          }}
        >
          Severe Bleeding Control
        </button>
      </div>

      {/* Warning Banner */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fef3c7',
        color: '#92400e',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '30px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <ShieldAlert size={24} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: '600' }}>
          <strong>WARNING:</strong> {guides[activeTab].warning}
        </span>
      </div>

      {/* Guide Content */}
      <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--secondary-color)', marginBottom: '30px' }}>{guides[activeTab].title}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {guides[activeTab].steps.map((step, idx) => (
            <div key={idx} className="guideline-card" style={{
              display: 'flex',
              gap: '20px',
              padding: '16px 20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                background: 'var(--secondary-color)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {idx + 1}
              </div>
              <div>
                <h4 style={{ fontSize: '16px', color: 'var(--secondary-color)', marginBottom: '4px' }}>{step.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        padding: '16px 20px',
        borderRadius: '12px',
        color: '#166534',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>Need clarification? Approaching ambulance paramedics are equipped with telemedicine audio bridges. Keep your mobile ready.</span>
      </div>

    </div>
  );
};

export default FirstAid;
