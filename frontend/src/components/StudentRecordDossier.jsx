// src/components/StudentRecordDossier.jsx
import React from 'react';
import logo from '../assets/logo.png.png';

function StudentRecordDossier({ profileData = {}, currentUser = {}, profilePic = null, isDarkMode = false }) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const isFemale = String(profileData?.gender || currentUser?.gender || '').toUpperCase() === 'FEMALE';
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const avatarSrc = profilePic || defaultAvatar;

  const fullName = profileData?.fullName || currentUser?.full_name || (isFemale ? 'SANA SHARMA' : 'AMIT SHARMA');
  
  const getCleanRegNo = () => {
    const r1 = String(profileData?.regNo || '');
    if (r1 && !r1.includes('@')) return r1;
    const r2 = String(currentUser?.reg_no || '');
    if (r2 && !r2.includes('@')) return r2;
    return isFemale ? '1554424000' : '1554424049';
  };
  const regNo = getCleanRegNo();
  const rawRoll = profileData?.rollNo || currentUser?.roll_no || (isFemale ? '00' : '49');
  const rollNo = String(rawRoll || '').replace('#', '').trim() || (isFemale ? '00' : '49');
  const branch = profileData?.branch || currentUser?.branch || 'Artificial Intelligence & Machine Learning';
  const session = profileData?.session || profileData?.semester || currentUser?.semester || '2024-27';

  const getMaskedContact = () => {
    const c1 = String(profileData?.contact || '').trim();
    if (c1 && !c1.includes('42022') && !c1.includes('56789') && !c1.includes('-----')) {
      return c1;
    }
    const c2 = String(currentUser?.mobile || '').trim();
    if (c2 && !c2.includes('42022') && !c2.includes('56789') && !c2.includes('-----')) {
      return c2;
    }
    return isFemale ? '+91 91234 -----' : '+91 88731 -----';
  };
  const contact = getMaskedContact();
  
  const getCleanEmail = () => {
    const e1 = String(profileData?.email || '').trim();
    if (e1 && !e1.includes('arwal28') && !e1.includes('sanasharma31') && !e1.includes('student.female@') && !e1.includes('student@')) {
      return e1;
    }
    return isFemale ? 'sanasharma.gpb.ai@gmail.com' : 'amitkumar.gpb.ai@gmail.com';
  };
  const email = getCleanEmail();

  const getCleanAddress = () => {
    const a1 = String(profileData?.address || '').trim();
    if (a1 && !a1.includes('Saksohara') && !a1.includes('Agwanpur')) return a1;
    const a2 = String(currentUser?.address || '').trim();
    if (a2 && !a2.includes('Saksohara') && !a2.includes('Agwanpur')) return a2;
    return 'Vill - , P.O - , P.S - , Dist - , State - , PIN - ';
  };
  const address = getCleanAddress();

  const bloodGroup = profileData?.bloodGroup || currentUser?.blood_group || 'O+';
  const hostelBlock = profileData?.hostelBlock || currentUser?.hostel_block || (isFemale ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block');
  const roomBed = isFemale ? 'Room 101 • Bed A' : 'Room 102 • Bed B';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 1. TOP HEADER ACTION CARD (HIDDEN ON PRINT) 🌟 */}
      <div
        className="no-print custom-card prof-header-simple"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          padding: '22px 28px',
          borderRadius: '18px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* AVATAR WITH BADGE */}
          <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
              📷
            </div>
          </div>

          {/* NAME & BRANCH */}
          <div className="prof-name-area">
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '0.3px', fontFamily: "'Fraunces', serif" }}>
              {fullName}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>{branch}</span>
            </p>
          </div>
        </div>

        {/* VIBRANT BLUE PRINT PDF BUTTON */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handlePrint}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#2563eb'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>PRINT PDF</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. OFFICIAL PRINTABLE STUDENT RECORD SHEET 🌟 */}
      <div
        id="student-record-document"
        className="student-record-printable-card"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          border: '2px solid #cbd5e1',
          fontFamily: "'DM Sans', -apple-system, sans-serif"
        }}
      >
        {/* INSTITUTIONAL HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #720e0e 0%, #8b0000 100%)',
            color: '#ffffff',
            padding: '20px 26px',
            borderBottom: '3px solid #eab308',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', background: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', flexShrink: 0 }}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.5px' }}>
                राजकीय पॉलिटेक्निक, बाढ़ (पटना)
              </h3>
              <h4 style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                GOVERNMENT POLYTECHNIC, BARH
              </h4>
              <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#fef08a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Dept. of Science, Technology &amp; Technical Education • Govt. of Bihar
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '9px', color: '#fef08a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              OFFICIAL STUDENT RECORD
            </div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>
              SESSION {session}
            </div>
          </div>
        </div>

        {/* SUB-HEADER STATUS BAR */}
        <div style={{ background: '#f8fafc', padding: '8px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
          <span>Verified Student Identity &amp; Academic Dossier</span>
          <span style={{ color: '#8b0000', fontWeight: 800 }}>Date of Record: {today}</span>
        </div>

        {/* RECORD SHEET BODY */}
        <div style={{ padding: '26px', display: 'flex', gap: '26px', flexWrap: 'wrap', background: '#ffffff' }}>
          
          {/* LEFT COLUMN: PHOTO & BADGES */}
          <div style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            
            {/* PASSPORT PHOTO */}
            <div style={{ width: '160px', height: '190px', borderRadius: '12px', border: '3px solid #800000', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', background: '#f1f5f9', position: 'relative' }}>
              <img src={avatarSrc} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, insetInline: 0, background: 'rgba(128,0,0,0.9)', color: '#ffffff', textAlign: 'center', fontSize: '9px', fontWeight: 800, padding: '3px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Verified Student
              </div>
            </div>

            {/* BLOOD GROUP */}
            <div style={{ width: '100%', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Blood Group</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#b91c1c' }}>{bloodGroup}</div>
            </div>

            {/* DIGITAL QR */}
            <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', lineHeight: 1 }}>📱</div>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>ID: {regNo}</div>
            </div>
          </div>

          {/* RIGHT COLUMN: COMPLETE ACADEMIC RECORDS */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* STUDENT NAME */}
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#8b0000', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isFemale ? '👩 Female Candidate' : '👨 Male Candidate'}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '2px 0 4px', fontFamily: "'Fraunces', serif" }}>
                {fullName}
              </h2>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                {branch}
              </div>
            </div>

            {/* DATA TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', width: '35%', fontSize: '11px', textTransform: 'uppercase' }}>Registration No.</td>
                  <td style={{ padding: '9px 14px', fontWeight: 900, color: '#8b0000', fontFamily: 'monospace', fontSize: '14px' }}>{regNo}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Class Roll No.</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{rollNo}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Branch</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{branch}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Academic Session</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{session}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Hostel &amp; Room</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#166534' }}>{hostelBlock} • {roomBed}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Contact Mobile</td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: '#0f172a' }}>{contact}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Email Address</td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: '#0f172a' }}>{email}</td>
                </tr>
                <tr>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Permanent Address</td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>{address}</td>
                </tr>
              </tbody>
            </table>

            {/* VERIFICATION NOTE */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                This is a computer-generated official student record verified by Government Polytechnic, Barh (Patna).
              </div>
            </div>

          </div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div style={{ background: '#f8fafc', borderTop: '2px dashed #cbd5e1', padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ height: '32px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Signature of Student</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>({fullName})</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #800000', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontSize: '8px', fontWeight: 900, textAlign: 'center', padding: '2px', textTransform: 'uppercase' }}>
              OFFICIAL SEAL<br />GP BARH
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ height: '32px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Chief Warden / Principal</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Govt. Polytechnic, Barh (Patna)</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default StudentRecordDossier;
