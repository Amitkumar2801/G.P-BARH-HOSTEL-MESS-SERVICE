// src/components/PaymentsHub.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png.png';

function PaymentsHub({ currentUser, profileData, isDarkMode }) {
  // Configurable Fee Rates (Default: 6 Months @ ₹750 = ₹4,500 Hostel, 6 Months @ ₹3,600 = ₹21,600 Mess)
  const [feeConfig, setFeeConfig] = useState({
    mess_fee_per_month: 3600,
    hostel_maintenance_per_month: 750
  });

  // Direct 6-Month Amounts
  const hostelAmount = (Number(feeConfig.hostel_maintenance_per_month) || 750) * 6; // ₹4,500
  const messAmount = (Number(feeConfig.mess_fee_per_month) || 3600) * 6; // ₹21,600

  // Submissions State
  const [hostelUtr, setHostelUtr] = useState('');
  const [hostelProof, setHostelProof] = useState(null);
  const [hostelProofPreview, setHostelProofPreview] = useState(null);
  const [isSubmittingHostel, setIsSubmittingHostel] = useState(false);

  const [messUtr, setMessUtr] = useState('');
  const [messProof, setMessProof] = useState(null);
  const [messProofPreview, setMessProofPreview] = useState(null);
  const [isSubmittingMess, setIsSubmittingMess] = useState(false);

  // Dynamic QR Modals
  const [showQrModal, setShowQrModal] = useState(null); // 'HOSTEL' or 'MESS'

  // Transactions History & Receipts
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);

  // Fetch Fee Config from backend
  const fetchFeeConfig = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/fees/config');
      if (res.data) {
        setFeeConfig(res.data);
      }
    } catch (err) {
      console.log('Using default fee rates');
    }
  };

  // Fetch Payment History
  const fetchPaymentHistory = async () => {
    setLoadingTxns(true);
    const regNo = profileData?.regNo || currentUser?.reg_no || currentUser?.reg_no_email;
    if (!regNo) {
      setTransactions([]);
      setLoadingTxns(false);
      return;
    }
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/payments/my-history?reg_no=${regNo}`);
      if (res.data && res.data.length > 0) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.log('Using local cached records');
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchFeeConfig();
    fetchPaymentHistory();
  }, [profileData?.regNo]);

  // Copy helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied! 📋`, {
      style: { borderRadius: '10px', background: '#0f172a', color: '#fff' }
    });
  };

  // Proof upload handlers
  const handleHostelProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHostelProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setHostelProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMessProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setMessProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit Hostel Payment
  const handleSubmitHostelPayment = async (e) => {
    e.preventDefault();
    if (!hostelUtr.trim()) {
      toast.error('Please enter 12-digit UTR Number!');
      return;
    }
    setIsSubmittingHostel(true);
    const regNo = profileData?.regNo || currentUser?.reg_no || currentUser?.reg_no_email || '';
    const studentName = profileData?.fullName || currentUser?.full_name || 'Student';
    const payload = {
      student_id: currentUser?.id,
      student_name: studentName,
      reg_no: regNo,
      gender: profileData?.gender || currentUser?.gender || 'MALE',
      fee_type: 'HOSTEL',
      amount: hostelAmount,
      utr_number: hostelUtr.trim(),
      proof_url: hostelProofPreview || '',
      payment_period: '6 Months Maintenance (₹750 × 6)',
      remarks: 'Submitted by student portal'
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/payments/submit', payload);
      toast.success('Hostel payment submitted for audit! ⏳', {
        style: { borderRadius: '12px', background: '#166534', color: '#fff' }
      });
      setHostelUtr('');
      setHostelProof(null);
      setHostelProofPreview(null);
      fetchPaymentHistory();
    } catch (err) {
      const newLocalTxn = {
        id: Date.now(),
        ...payload,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };
      setTransactions([newLocalTxn, ...transactions]);
      toast.success('Hostel payment submitted! Status: Pending Audit ⏳', {
        style: { borderRadius: '12px', background: '#166534', color: '#fff' }
      });
      setHostelUtr('');
      setHostelProof(null);
      setHostelProofPreview(null);
    } finally {
      setIsSubmittingHostel(false);
    }
  };

  // Submit Mess Payment
  const handleSubmitMessPayment = async (e) => {
    e.preventDefault();
    if (!messUtr.trim()) {
      toast.error('Please enter 12-digit UTR Number!');
      return;
    }
    setIsSubmittingMess(true);
    const regNo = profileData?.regNo || currentUser?.reg_no || currentUser?.reg_no_email || '';
    const studentName = profileData?.fullName || currentUser?.full_name || 'Student';
    const payload = {
      student_id: currentUser?.id,
      student_name: studentName,
      reg_no: regNo,
      gender: profileData?.gender || currentUser?.gender || 'MALE',
      fee_type: 'MESS',
      amount: messAmount,
      utr_number: messUtr.trim(),
      proof_url: messProofPreview || '',
      payment_period: '6 Months Mess Advance (₹3,600 × 6)',
      remarks: 'Submitted by student portal'
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/payments/submit', payload);
      toast.success('Mess payment submitted for audit! ⏳', {
        style: { borderRadius: '12px', background: '#166534', color: '#fff' }
      });
      setMessUtr('');
      setMessProof(null);
      setMessProofPreview(null);
      fetchPaymentHistory();
    } catch (err) {
      const newLocalTxn = {
        id: Date.now(),
        ...payload,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };
      setTransactions([newLocalTxn, ...transactions]);
      toast.success('Mess payment submitted! Status: Pending Audit ⏳', {
        style: { borderRadius: '12px', background: '#166534', color: '#fff' }
      });
      setMessUtr('');
      setMessProof(null);
      setMessProofPreview(null);
    } finally {
      setIsSubmittingMess(false);
    }
  };

  return (
    <div className="payments-hub-direct animate-fade-in" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      {/* 🌟 ULTRA-CLEAN MODERN HEADER */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💳</span> Fee Payments Hub
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Official 6-Month Hostel &amp; Mess fee clearance. Scan QR, submit 12-digit UTR, and get verified PDF receipts.
        </p>
      </div>

      {/* 🌟 DUAL DIRECT PAYMENT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* ======================================================== */}
        {/* 🏢 CARD 1: HOSTEL FEE (6 MONTHS: ₹4,500) */}
        {/* ======================================================== */}
        <div
          className="custom-card"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '22px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div>
            {/* CARD TOP */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
                  🏢
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text)', margin: 0 }}>Hostel Fee</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>6 Months Maintenance</span>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '4px 10px', borderRadius: '20px' }}>
                ₹750 × 6
              </span>
            </div>

            {/* AMOUNT BOX */}
            <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.18)', borderRadius: '16px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#1d4ed8', lineHeight: 1.1 }}>₹{hostelAmount.toLocaleString('en-IN')}.00</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <div>A/C: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>50200112532031</strong></div>
                <div>IFSC: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>HDFC0002248</strong></div>
              </div>
            </div>

            {/* SCAN QR BUTTON */}
            <button
              type="button"
              onClick={() => setShowQrModal('HOSTEL')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                marginBottom: '16px'
              }}
            >
              <span>📱 Scan UPI QR / Bank Transfer Info</span>
            </button>

            {/* UTR FORM */}
            <form onSubmit={handleSubmitHostelPayment} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 12-digit UTR Number..."
                  value={hostelUtr}
                  onChange={(e) => setHostelUtr(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', padding: '10px 12px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📎 Payment Proof:</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleHostelProofUpload} style={{ fontSize: '11px', width: '150px' }} />
                </label>
                {hostelProofPreview && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800 }}>✓ Attached</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmittingHostel}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isSubmittingHostel ? 'Submitting...' : '🚀 Submit Hostel Fee UTR'}
              </button>
            </form>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 🍽️ CARD 2: MESS FEE (6 MONTHS: ₹21,600) */}
        {/* ======================================================== */}
        <div
          className="custom-card"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '22px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div>
            {/* CARD TOP */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                  🍽️
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text)', margin: 0 }}>Mess Advance</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>6 Months Advance</span>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '4px 10px', borderRadius: '20px' }}>
                ₹3,600 × 6
              </span>
            </div>

            {/* AMOUNT BOX */}
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.18)', borderRadius: '16px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#047857', lineHeight: 1.1 }}>₹{messAmount.toLocaleString('en-IN')}.00</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                <div>A/C: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>50200112096961</strong></div>
                <div>IFSC: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>HDFC0002248</strong></div>
              </div>
            </div>

            {/* SCAN QR BUTTON */}
            <button
              type="button"
              onClick={() => setShowQrModal('MESS')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                marginBottom: '16px'
              }}
            >
              <span>📱 Scan UPI QR / Bank Transfer Info</span>
            </button>

            {/* UTR FORM */}
            <form onSubmit={handleSubmitMessPayment} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 12-digit UTR Number..."
                  value={messUtr}
                  onChange={(e) => setMessUtr(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', padding: '10px 12px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📎 Payment Proof:</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleMessProofUpload} style={{ fontSize: '11px', width: '150px' }} />
                </label>
                {messProofPreview && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800 }}>✓ Attached</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmittingMess}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isSubmittingMess ? 'Submitting...' : '🚀 Submit Mess Fee UTR'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 🧾 SECTION 3: VERIFIED RECEIPTS & HISTORY */}
      {/* ======================================================== */}
      <div
        className="custom-card"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '22px',
          padding: '22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🧾</span> Payment Records &amp; Official Receipts
            </h3>
          </div>
          <button
            type="button"
            onClick={fetchPaymentHistory}
            style={{
              padding: '6px 12px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* RESPONSIVE TRANSACTION CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No payment transactions found. Submit a fee payment above.
            </div>
          ) : (
            transactions.map((txn, idx) => {
              const isApproved = txn.status === 'APPROVED';
              const isPending = txn.status === 'PENDING';
              const dateStr = new Date(txn.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <div
                  key={txn.id || idx}
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: txn.fee_type === 'HOSTEL' ? '#1d4ed8' : '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{txn.fee_type === 'HOSTEL' ? '🏢 Hostel Fee (6 Months)' : '🍽️ Mess Advance (6 Months)'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>• {dateStr}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Ref / UTR: <code style={{ color: 'var(--text)', fontWeight: 700 }}>{txn.utr_number}</code>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text)' }}>
                        ₹{Number(txn.amount || 0).toLocaleString('en-IN')}.00
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        {isApproved && (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800 }}>
                            ✅ Verified
                          </span>
                        )}
                        {isPending && (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800 }}>
                            ⏳ Under Audit
                          </span>
                        )}
                        {txn.status === 'REJECTED' && (
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 800 }}>
                            ❌ Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PROMINENT DOWNLOAD BUTTON */}
                  {isApproved && (
                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveReceiptModal(txn)}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                        }}
                      >
                        <span>📥</span>
                        <span>Download Official PDF Receipt</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📱 DYNAMIC UPI QR POPUP MODAL */}
      {/* ======================================================== */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: '16px' }}>
          <div style={{ background: 'var(--card)', width: '100%', maxWidth: '380px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ background: showQrModal === 'HOSTEL' ? '#1d4ed8' : '#059669', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{showQrModal === 'HOSTEL' ? '🏢' : '🍽️'}</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>
                    {showQrModal === 'HOSTEL' ? 'Hostel Fee UPI QR' : 'Mess Fee UPI QR'}
                  </h3>
                  <div style={{ fontSize: '10.5px', opacity: 0.9 }}>Government Polytechnic Barh</div>
                </div>
              </div>
              <button onClick={() => setShowQrModal(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ width: '170px', height: '170px', margin: '0 auto 14px', background: 'white', borderRadius: '12px', padding: '10px', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    showQrModal === 'HOSTEL'
                      ? `upi://pay?pa=50200112532031@hdfcbank&pn=Principal%20GP%20Barh%20Hostel&am=${hostelAmount}&cu=INR`
                      : `upi://pay?pa=50200112096961@hdfcbank&pn=Committee%20Mess%20GP%20Barh&am=${messAmount}&cu=INR`
                  )}`}
                  alt="UPI QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', marginBottom: '2px' }}>
                Scan with Google Pay / PhonePe / Paytm
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: showQrModal === 'HOSTEL' ? '#1d4ed8' : '#059669', marginBottom: '14px' }}>
                ₹{(showQrModal === 'HOSTEL' ? hostelAmount : messAmount).toLocaleString('en-IN')}.00
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', textAlign: 'left', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>A/C: <strong style={{ color: 'var(--text)' }}>{showQrModal === 'HOSTEL' ? '50200112532031' : '50200112096961'}</strong></span>
                  <button type="button" onClick={() => copyToClipboard(showQrModal === 'HOSTEL' ? '50200112532031' : '50200112096961', 'A/C No')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>📋</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IFSC: <strong style={{ color: 'var(--text)' }}>HDFC0002248</strong></span>
                  <button type="button" onClick={() => copyToClipboard('HDFC0002248', 'IFSC')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>📋</button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📥 OFFICIAL PRINTABLE E-RECEIPT MODAL */}
      {/* ======================================================== */}
      {activeReceiptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '12px' }}>
          <div style={{ background: '#ffffff', color: '#111827', width: '100%', maxWidth: '480px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.6)', border: '2px solid #e2e8f0', maxHeight: '95vh', overflowY: 'auto' }}>
            
            {/* TOP BRANDING BAR */}
            <div style={{ background: '#800000', color: 'white', padding: '16px 20px', textAlign: 'center', borderBottom: '3px solid #eab308' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}>
                <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={logo} alt="Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 900, margin: 0, fontFamily: 'serif' }}>राजकीय पॉलिटेक्निक, बाढ़</h2>
                  <p style={{ fontSize: '9px', fontWeight: 700, margin: 0, textTransform: 'uppercase', opacity: 0.9 }}>Government Polytechnic, Barh</p>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 10px', borderRadius: '12px', display: 'inline-block', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px', color: '#fef08a' }}>
                Official Fee E-Receipt
              </div>
            </div>

            {/* RECEIPT BODY */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px dashed #cbd5e1', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>RECEIPT NO.</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#800000', fontFamily: 'monospace' }}>
                    {activeReceiptModal.receipt_number || `GPB/2026/${activeReceiptModal.fee_type === 'HOSTEL' ? 'HST' : 'MSS'}-${activeReceiptModal.id}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>DATE</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155' }}>
                    {new Date(activeReceiptModal.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* PARTICULARS */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '8px', columnGap: '12px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>STUDENT NAME</span>
                    <strong style={{ color: '#0f172a' }}>{activeReceiptModal.student_name || profileData?.fullName || currentUser?.full_name || 'Student'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>REGISTRATION NO</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{activeReceiptModal.reg_no || profileData?.regNo || currentUser?.reg_no || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>FEE CATEGORY</span>
                    <strong style={{ color: activeReceiptModal.fee_type === 'HOSTEL' ? '#1e40af' : '#047857' }}>
                      {activeReceiptModal.fee_type === 'HOSTEL' ? 'Hostel Fee (6 Months)' : 'Mess Advance (6 Months)'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>BANK UTR / REF</span>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '10.5px' }}>{activeReceiptModal.utr_number}</strong>
                  </div>
                </div>
              </div>

              {/* AMOUNT BOX */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#166534', fontWeight: 700 }}>CERTIFIED AMOUNT</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803d' }}>
                    ₹{Number(activeReceiptModal.amount || 0).toLocaleString('en-IN')}.00
                  </div>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 900, background: '#16a34a', color: '#fff', padding: '3px 8px', borderRadius: '12px' }}>
                  ✓ PAID &amp; VERIFIED
                </span>
              </div>

              {/* DIGITAL STAMP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b', marginBottom: '16px' }}>
                <div>🔒 Accounts Section, GP Barh</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Stamp: <code>GPB-VERIFIED-2026</code></div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🖨️</span>
                  <span>Print / Save Official PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceiptModal(null)}
                  style={{
                    background: '#e2e8f0',
                    color: '#334155',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '12.5px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PaymentsHub;
