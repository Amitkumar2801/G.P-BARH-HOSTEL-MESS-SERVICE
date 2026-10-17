// src/components/AcademicBatchesHub.jsx
// Government Polytechnic, Barh - Academic Sessions & Student Batch Management Hub
// High-Contrast Institutional ERP Interface with Real-Time Dynamic Session Discovery

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Eye,
  X,
  Building,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  ArrowDown,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';

export default function AcademicBatchesHub({
  studentDirectory = [],
  fetchWardenData,
  isDarkMode = false,
  showResetConfirmModal,
  setShowResetConfirmModal
}) {
  // Navigation tabs: 'matrix' (Sessions Directory), 'roster' (Student Roster), 'yearback' (Retention Registry), 'clearance' (Graduation Hub)
  const [activeTab, setActiveTab] = useState('matrix');

  // Filtering states
  const [selectedBatchSession, setSelectedBatchSession] = useState('2024-27');
  const [selectedHostel, setSelectedHostel] = useState('ALL'); // 'ALL', 'BOYS', 'GIRLS'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'YEAR_BACK', 'DUES_PENDING', 'ELIGIBLE'
  const [programFilter, setProgramFilter] = useState('ALL'); // 'ALL', 'REGULAR', 'LATERAL'
  const [sessionScopeFilter, setSessionScopeFilter] = useState('ALL'); // 'ALL', 'ACTIVE_ONLY', 'GRADUATING', 'UPCOMING'
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLayout, setDisplayLayout] = useState('cards'); // 'cards' (Horizontal Strips) | 'table' (Dense Table)

  // Server Data & Loading
  const [batchStudents, setBatchStudents] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Modal states
  const [inspectedStudent, setInspectedStudent] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [isClearingBatch, setIsClearingBatch] = useState(false);

  // Clearance Policy Safeguards
  const [excludeRetained, setExcludeRetained] = useState(true);
  const [enforceNoDues, setEnforceNoDues] = useState(true);

  // Normalize session string (e.g., "2024-2027" -> "2024-27", "2027-2030" -> "2027-30")
  const normalizeSess = (s) => {
    if (!s) return '';
    const str = String(s).trim();
    const parts = str.replace('/', '-').split('-');
    if (parts.length === 2) {
      const y1 = parts[0].trim();
      let y2 = parts[1].trim();
      if (y2.length === 4) y2 = y2.slice(2);
      return `${y1}-${y2}`;
    }
    return str;
  };

  // Primary student pool
  const studentPool = useMemo(() => {
    return (batchStudents && batchStudents.length > 0) ? batchStudents : studentDirectory;
  }, [batchStudents, studentDirectory]);

  // =========================================================================
  // 🌟 DYNAMIC SESSION GENERATOR & REAL-DATA AUTO-DISCOVERY ENGINE
  // =========================================================================
  // Automatically generates all standard rolling Polytechnic diploma sessions from 2022
  // up to (currentYear + 2) e.g., 2027-30, 2028-31, AND dynamically scans the live student
  // database. When a junior joins in 2027 or beyond, their session is automatically populated!
  const dynamicSessionsCatalog = useMemo(() => {
    const currentYear = 2026; // College reference baseline academic calendar year
    const baseYear = 2022; // Earliest alumni baseline year
    let maxYear = Math.max(currentYear + 2, 2028); // Generates upcoming intake sessions like 2027-30, 2028-31

    // Scan real student records to detect any sessions that reach even further into the future
    const allPool = (studentDirectory && studentDirectory.length > 0) ? studentDirectory : batchStudents;
    const detectedSessions = new Set();

    allPool.forEach(st => {
      const s = st.semester || st.session;
      if (s) {
        const norm = normalizeSess(s);
        const parts = norm.split('-');
        if (parts.length === 2) {
          const y1 = parseInt(parts[0], 10);
          let y2 = parseInt(parts[1], 10);
          if (y2 < 100) y2 += 2000;
          if (!isNaN(y1) && !isNaN(y2)) {
            maxYear = Math.max(maxYear, y1 + 1, y2 - 2);
            detectedSessions.add(norm);
          }
        }
      }
    });

    // Color theme resolver per session status
    const getTheme = (status, programType, isFinalYear) => {
      if (status === 'ARCHIVED') {
        return {
          accentBorder: 'border-l-slate-500',
          cardBorder: 'border-slate-300 dark:border-slate-700',
          cardBg: 'bg-gradient-to-r from-slate-100/90 via-white to-white dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-900',
          badgeBg: 'bg-slate-800 text-white',
          tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
        };
      }
      if (isFinalYear) {
        return programType === 'LATERAL' ? {
          accentBorder: 'border-l-amber-500',
          cardBorder: 'border-amber-400 dark:border-amber-700',
          cardBg: 'bg-gradient-to-r from-amber-50/70 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900',
          badgeBg: 'bg-amber-500 text-slate-950',
          tagColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700',
        } : {
          accentBorder: 'border-l-rose-600',
          cardBorder: 'border-rose-400 dark:border-rose-700',
          cardBg: 'bg-gradient-to-r from-rose-50/70 via-white to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900',
          badgeBg: 'bg-rose-600 text-white',
          tagColor: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-700',
        };
      }
      if (status === 'FRESHERS') {
        return {
          accentBorder: 'border-l-emerald-600',
          cardBorder: 'border-emerald-400 dark:border-emerald-700',
          cardBg: 'bg-gradient-to-r from-emerald-50/60 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900',
          badgeBg: 'bg-emerald-600 text-white',
          tagColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        };
      }
      if (status === 'UPCOMING') {
        return {
          accentBorder: 'border-l-purple-600',
          cardBorder: 'border-purple-400 dark:border-purple-700',
          cardBg: 'bg-gradient-to-r from-purple-50/60 via-white to-white dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900',
          badgeBg: 'bg-purple-600 text-white',
          tagColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border-purple-300 dark:border-purple-700',
        };
      }
      return programType === 'LATERAL' ? {
        accentBorder: 'border-l-cyan-600',
        cardBorder: 'border-cyan-400 dark:border-cyan-700',
        cardBg: 'bg-gradient-to-r from-cyan-50/60 via-white to-white dark:from-cyan-950/30 dark:via-slate-900 dark:to-slate-900',
        badgeBg: 'bg-cyan-600 text-white',
        tagColor: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/80 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
      } : {
        accentBorder: 'border-l-indigo-600',
        cardBorder: 'border-indigo-400 dark:border-indigo-700',
        cardBg: 'bg-gradient-to-r from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900',
        badgeBg: 'bg-indigo-600 text-white',
        tagColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
      };
    };

    const map = new Map();

    for (let y = baseYear; y <= maxYear; y++) {
      // 1. Lateral Entry (admitted in y, 2-Year Duration, Passout in y+2)
      if (y >= 2023) {
        const leId = `${y}-${String(y + 2).slice(-2)}`;
        const out = y + 2;
        let status = 'ACTIVE';
        let level = '2nd Year LE (Semester V/VI)';
        let isFinalYear = false;

        if (out < currentYear) {
          status = 'ARCHIVED';
          level = 'Alumni Passout Batch (LE)';
        } else if (out === currentYear) {
          status = 'GRADUATING';
          level = 'Final Year LE (Graduation Ready)';
          isFinalYear = true;
        } else if (y === currentYear) {
          status = 'FRESHERS';
          level = '1st Year LE (Semester III/IV)';
        } else if (y > currentYear) {
          status = 'UPCOMING';
          level = `Upcoming Session (${y} LE Intake)`;
        }

        const theme = getTheme(status, 'LATERAL', isFinalYear);
        map.set(leId, {
          id: leId,
          label: `Session ${y}–${y + 2} (Lateral Entry)`,
          programType: 'LATERAL',
          programLabel: '2-Year Lateral Entry (LE)',
          level,
          status,
          admissionYear: y,
          passoutYear: y + 2,
          isFinalYear,
          ...theme,
          description: status === 'ARCHIVED'
            ? 'Graduated lateral entry diploma alumni directory with vacated bed archives.'
            : status === 'UPCOMING'
            ? `Prospective lateral entry engineering admissions and hostel bed allocation reserves for ${y}.`
            : isFinalYear
            ? 'Final year lateral entry engineering batch preparing for graduation and bed recycling.'
            : `Lateral entry diploma engineering batch admitted in session ${y}.`
        });
      }

      // 2. Regular 3-Year Diploma (admitted in y, 3-Year Duration, Passout in y+3)
      const regId = `${y}-${String(y + 3).slice(-2)}`;
      const out = y + 3;
      let status = 'ACTIVE';
      let level = '2nd Year (Semester III/IV)';
      let isFinalYear = false;

      if (out < currentYear) {
        status = 'ARCHIVED';
        level = 'Alumni Passout Batch';
      } else if (out === currentYear) {
        status = 'GRADUATING';
        level = 'Final Year Regular (Semester V/VI)';
        isFinalYear = true;
      } else if (y === currentYear) {
        status = 'FRESHERS';
        level = '1st Year Freshers (Semester I/II)';
      } else if (y > currentYear) {
        status = 'UPCOMING';
        level = `Upcoming Session (${y} Regular Intake)`;
      } else {
        const progressYear = currentYear - y + 1;
        level = progressYear === 2 ? '2nd Year (Semester III/IV)' : `${progressYear}rd Year`;
      }

      const theme = getTheme(status, 'REGULAR', isFinalYear);
      map.set(regId, {
        id: regId,
        label: `Session ${y}–${y + 3}${status === 'ARCHIVED' ? ' (Alumni)' : ''}`,
        programType: 'REGULAR',
        programLabel: '3-Year Regular Diploma',
        level,
        status,
        admissionYear: y,
        passoutYear: y + 3,
        isFinalYear,
        ...theme,
        description: status === 'ARCHIVED'
          ? 'Graduated alumni batch records with vacated hostel bed archives.'
          : status === 'UPCOMING'
          ? `Prospective regular diploma admissions and hostel bed allocation reserves for ${y}.`
          : isFinalYear
          ? 'Senior regular diploma batch preparing for graduation and bed vacancy recycling.'
          : `Regular 3-year diploma engineering track admitted in session ${y}.`
      });
    }

    // Auto-integrate any custom detected sessions from real student database
    detectedSessions.forEach(cId => {
      if (!map.has(cId)) {
        const parts = cId.split('-');
        const adm = parseInt(parts[0], 10);
        let out = parseInt(parts[1], 10);
        if (out < 100) out += 2000;
        const isLE = (out - adm) === 2;
        const pType = isLE ? 'LATERAL' : 'REGULAR';
        const isFinalYear = (out === currentYear);
        const status = out < currentYear ? 'ARCHIVED' : (isFinalYear ? 'GRADUATING' : (adm > currentYear ? 'UPCOMING' : 'ACTIVE'));
        const level = status === 'ARCHIVED' ? 'Alumni Batch' : (isFinalYear ? 'Final Year' : `${currentYear - adm + 1}th Year`);
        const theme = getTheme(status, pType, isFinalYear);

        map.set(cId, {
          id: cId,
          label: `Session ${adm}–${out}`,
          programType: pType,
          programLabel: isLE ? '2-Year Lateral Entry (LE)' : '3-Year Regular Diploma',
          level,
          status,
          admissionYear: adm,
          passoutYear: out,
          isFinalYear,
          ...theme,
          description: `Academic session ${cId} auto-detected from institutional student records.`
        });
      }
    });

    // Sort strictly ascending chronologically: admissionYear ASC, then passoutYear ASC
    const sorted = Array.from(map.values()).sort((a, b) => {
      if (a.admissionYear !== b.admissionYear) return a.admissionYear - b.admissionYear;
      return a.passoutYear - b.passoutYear;
    });

    // Number sequentially: #01, #02, #03...
    sorted.forEach((item, idx) => {
      item.seqNumber = String(idx + 1).padStart(2, '0');
    });

    return sorted;
  }, [studentDirectory, batchStudents]);

  // Consolidated Master Catalog including 'ALL' entry
  const allSessionsCatalog = useMemo(() => {
    return [
      {
        id: 'ALL',
        seqNumber: '00',
        label: 'All Academic Sessions (Master Directory)',
        programType: 'ALL',
        programLabel: 'Institutional Consolidated Roster',
        level: 'Consolidated Directory',
        status: 'ALL',
        academicPeriod: 'All Sessions',
        admissionYear: 2022,
        passoutYear: 2030,
        isFinalYear: false,
        accentBorder: 'border-l-slate-700',
        cardBorder: 'border-slate-300 dark:border-slate-700',
        cardBg: 'bg-white dark:bg-slate-900',
        badgeBg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950',
        tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
        description: 'Consolidated administrative directory covering all academic diploma sessions.'
      },
      ...dynamicSessionsCatalog
    ];
  }, [dynamicSessionsCatalog]);

  // Fetch session students from server API
  const fetchSessionStudents = async (session = selectedBatchSession, hostel = selectedHostel) => {
    setIsFetching(true);
    try {
      const sessParam = session || '2024-27';
      const res = await axios.get(`http://127.0.0.1:8000/api/warden/students/by-batch?session=${sessParam}&hostel_type=${hostel}`);
      if (Array.isArray(res.data)) {
        setBatchStudents(res.data);
      }
    } catch (err) {
      console.warn('Session fetch fallback to student directory:', err);
      const target = (session || '2024-27').trim();
      const filtered = studentDirectory.filter(s => {
        const sSess = normalizeSess(s.semester || s.session || '');
        const matchSess = target === 'ALL' || sSess === target || sSess.includes(target);
        const sGen = (s.gender || '').toUpperCase();
        const matchHostel = hostel === 'ALL' || (hostel === 'BOYS' && sGen === 'MALE') || (hostel === 'GIRLS' && sGen === 'FEMALE');
        return matchSess && matchHostel;
      });
      setBatchStudents(filtered);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchSessionStudents(selectedBatchSession, selectedHostel);
  }, [selectedBatchSession, selectedHostel]);

  // Filtered dataset for Active Roster Tab
  const filteredStudents = useMemo(() => {
    return studentPool.filter(st => {
      const sess = normalizeSess(st.semester || st.session);
      const target = normalizeSess(selectedBatchSession);

      if (target !== 'ALL' && sess !== target) {
        if (!sess.includes(target) && !target.includes(sess)) return false;
      }

      const gen = String(st.gender || '').toUpperCase();
      if (selectedHostel === 'BOYS' && gen === 'FEMALE') return false;
      if (selectedHostel === 'GIRLS' && gen !== 'FEMALE') return false;

      if (programFilter === 'REGULAR') {
        if (sess.includes('26') && sess.startsWith('2024')) return false;
        if (sess.includes('27') && sess.startsWith('2025')) return false;
      }
      if (programFilter === 'LATERAL') {
        const isLE = sess === '2024-26' || sess === '2025-27' || sess === '2023-25' || (st.branch && st.branch.toLowerCase().includes('lateral'));
        if (!isLE) return false;
      }

      const isYb = Boolean(st.is_year_back);
      const isPaid = (st.payment_status === 'PAID' || st.allotment_status === 'APPROVED');
      if (statusFilter === 'ACTIVE' && isYb) return false;
      if (statusFilter === 'YEAR_BACK' && !isYb) return false;
      if (statusFilter === 'DUES_PENDING' && isPaid) return false;
      if (statusFilter === 'ELIGIBLE' && (isYb || !isPaid)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = String(st.full_name || '').toLowerCase();
        const reg = String(st.reg_no || '').toLowerCase();
        const roll = String(st.roll_no || '').toLowerCase();
        const room = String(st.room_number || '').toLowerCase();
        const branch = String(st.branch || '').toLowerCase();
        if (!name.includes(q) && !reg.includes(q) && !roll.includes(q) && !room.includes(q) && !branch.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [studentPool, selectedBatchSession, selectedHostel, programFilter, statusFilter, searchQuery]);

  // Session-level aggregates
  const activeSessionStudents = useMemo(() => {
    return studentPool.filter(st => {
      const sess = normalizeSess(st.semester || st.session);
      const target = normalizeSess(selectedBatchSession);
      if (target === 'ALL') return true;
      return sess === target || sess.includes(target) || target.includes(sess);
    });
  }, [studentPool, selectedBatchSession]);

  const totalInSession = activeSessionStudents.length;
  const countRetained = activeSessionStudents.filter(s => Boolean(s.is_year_back)).length;
  const countRegular = activeSessionStudents.filter(s => !s.is_year_back).length;
  const countDuesPending = activeSessionStudents.filter(s => s.payment_status !== 'PAID' && s.allotment_status !== 'APPROVED').length;
  const countClearanceReady = activeSessionStudents.filter(s => !s.is_year_back && (s.payment_status === 'PAID' || s.allotment_status === 'APPROVED')).length;

  // Institute-wide metrics
  const institutionalMetrics = useMemo(() => {
    const total = studentDirectory.length;
    const retained = studentDirectory.filter(s => Boolean(s.is_year_back)).length;
    const dues = studentDirectory.filter(s => s.payment_status !== 'PAID' && s.allotment_status !== 'APPROVED').length;
    const regular = studentDirectory.filter(s => !s.is_year_back).length;
    return { total, retained, dues, regular };
  }, [studentDirectory]);

  // Retained students institute-wide
  const allRetainedStudents = useMemo(() => {
    return studentDirectory.filter(s => Boolean(s.is_year_back));
  }, [studentDirectory]);

  // Multi-selection logic
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds(new Set());
    } else {
      const set = new Set(selectedStudentIds);
      filteredStudents.forEach(s => set.add(s.id));
      setSelectedStudentIds(set);
    }
  };

  const toggleSingleSelect = (id) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectClearanceCandidates = () => {
    const set = new Set();
    filteredStudents.forEach(s => {
      const isPaid = (s.payment_status === 'PAID' || s.allotment_status === 'APPROVED');
      if (!s.is_year_back && isPaid) set.add(s.id);
    });
    setSelectedStudentIds(set);
    toast.success(`Selected ${set.size} clearance-ready candidates.`, {
      style: { borderRadius: '10px', background: '#0f172a', color: '#10b981', fontWeight: 700 }
    });
  };

  // Toggle Retention (Year-Back)
  const handleToggleRetention = async (studentId, currentVal) => {
    const newVal = !currentVal;
    setBatchStudents(prev => prev.map(s => s.id === studentId ? { ...s, is_year_back: newVal } : s));
    if (inspectedStudent && inspectedStudent.id === studentId) {
      setInspectedStudent(prev => ({ ...prev, is_year_back: newVal }));
    }

    toast.success(newVal
      ? 'Retention safeguard active: Student protected against passout archival.'
      : 'Student restored to normal academic progression track.', {
      duration: 3500,
      style: { borderRadius: '10px', background: '#0f172a', color: '#f59e0b', fontWeight: 700 }
    });

    try {
      await axios.post('http://127.0.0.1:8000/api/warden/students/mark-year-back', {
        student_id: studentId,
        is_year_back: newVal
      });
      if (fetchWardenData) fetchWardenData();
    } catch (err) {
      console.error('Retention toggle error:', err);
    }
  };

  // Delete Individual Student
  const handleDeleteIndividual = async () => {
    if (!deleteCandidate) return;
    const sId = deleteCandidate.id;
    setIsDeletingSingle(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/warden/students/${sId}`);
      toast.success(`Archival complete: Bed vacated for ${deleteCandidate.full_name}.`, {
        duration: 3500,
        style: { borderRadius: '10px', background: '#166534', color: '#fff', fontWeight: 700 }
      });
      setBatchStudents(prev => prev.filter(s => s.id !== sId));
      setSelectedStudentIds(prev => {
        const next = new Set(prev);
        next.delete(sId);
        return next;
      });
      setDeleteCandidate(null);
      if (inspectedStudent?.id === sId) setInspectedStudent(null);
      if (fetchWardenData) fetchWardenData();
    } catch (err) {
      console.error('Single delete error:', err);
      toast.error('Failed to complete student archival on server.');
    } finally {
      setIsDeletingSingle(false);
    }
  };

  // Bulk Delete
  const handleBulkArchival = async () => {
    const ids = Array.from(selectedStudentIds);
    if (ids.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/warden/students/bulk-delete', {
        student_ids: ids,
        reason: 'Warden Administrative Bulk Archival'
      });
      toast.success(res?.data?.message || `Successfully archived ${ids.length} student records.`, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#166534', color: '#fff', fontWeight: 700 }
      });
      setBatchStudents(prev => prev.filter(s => !ids.includes(s.id)));
      setSelectedStudentIds(new Set());
      setShowBulkModal(false);
      if (fetchWardenData) fetchWardenData();
    } catch (err) {
      console.error('Bulk archival error:', err);
      toast.error('Failed to process bulk archival request.');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  // Automated Passout Clearance
  const handleExecutePassoutClearance = async () => {
    setIsClearingBatch(true);
    try {
      const payload = {
        session: selectedBatchSession,
        exclude_year_back: excludeRetained,
        require_fee_clearance: enforceNoDues
      };
      const res = await axios.delete('http://127.0.0.1:8000/api/warden/students/batch-clear', {
        data: payload
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      toast.success(res?.data?.message || `Session ${selectedBatchSession} graduation clearance executed successfully.`, {
        duration: 5000,
        style: { borderRadius: '10px', background: '#0f172a', color: '#10b981', fontWeight: 800 }
      });
      setShowClearanceModal(false);
      fetchSessionStudents(selectedBatchSession, selectedHostel);
      if (fetchWardenData) fetchWardenData();
    } catch (err) {
      console.error('Clearance error:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Graduation clearance process failed.';
      toast.error(detail);
    } finally {
      setIsClearingBatch(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error('No student records available to export.');
      return;
    }
    const headers = ['Registration Number', 'Full Name', 'Roll Number', 'Academic Session', 'Branch', 'Hostel Wing', 'Room Number', 'Bed Code', 'Academic Track', 'Financial Status', 'Mobile Contact'];
    const rows = filteredStudents.map(s => [
      `"${s.reg_no || ''}"`,
      `"${s.full_name || ''}"`,
      `"${s.roll_no || ''}"`,
      `"${normalizeSess(s.semester || s.session)}"`,
      `"${s.branch || ''}"`,
      `"${s.hostel_block || ''}"`,
      `"${s.room_number || 'Unallocated'}"`,
      `"${s.bed_code || ''}"`,
      s.is_year_back ? '"RETAINED (YEAR-BACK)"' : '"REGULAR TRACK"',
      s.payment_status === 'PAID' ? '"DUES CLEARED"' : '"DUES OUTSTANDING"',
      `"${s.mobile || ''}"`
    ]);

    const csvData = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const uri = encodeURI(csvData);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `GP_Barh_Session_${selectedBatchSession}_${selectedHostel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Session roster exported in CSV format.');
  };

  const openSessionDrilldown = (sessionId) => {
    setSelectedBatchSession(sessionId);
    setSelectedStudentIds(new Set());
    setActiveTab('roster');
  };

  const currentSession = allSessionsCatalog.find(c => c.id === selectedBatchSession) || allSessionsCatalog[1];

  // Visible sessions in Sessions Directory filtered by Scope
  const visibleSessions = useMemo(() => {
    return dynamicSessionsCatalog.filter(sess => {
      const enrolled = studentDirectory.filter(s => {
        const sSess = normalizeSess(s.semester || s.session || '');
        return sSess === sess.id || sSess.includes(sess.id);
      }).length;

      if (sessionScopeFilter === 'ACTIVE_ONLY') {
        return enrolled > 0;
      }
      if (sessionScopeFilter === 'GRADUATING') {
        return sess.isFinalYear;
      }
      if (sessionScopeFilter === 'UPCOMING') {
        return sess.admissionYear >= 2026;
      }
      return true; // 'ALL'
    });
  }, [dynamicSessionsCatalog, studentDirectory, sessionScopeFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL INSTITUTIONAL COMMAND HEADER */}
      {/* ========================================================================= */}
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-red-600/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-black tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GOVERNMENT POLYTECHNIC BARH • ADMINISTRATIVE CONTROL</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-amber-400 shrink-0" />
              <span>Academic Sessions &amp; Student Batch Hub</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 font-bold max-w-2xl leading-relaxed">
              Official Polytechnic session-wise administrative desk. Supervise 3-Year Regular &amp; 2-Year Lateral Entry sessions in strict chronological sequence, enforce retention safeguards, and automate passout bed recovery.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center flex-wrap">
            <button
              type="button"
              onClick={() => fetchSessionStudents(selectedBatchSession, selectedHostel)}
              disabled={isFetching}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black border border-slate-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isFetching ? 'Syncing Data...' : 'Sync Database'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clearance')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-950/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Graduation Clearance</span>
            </button>
          </div>
        </div>

        {/* Top-Level Navigation Segmented Control */}
        <nav className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'matrix', label: 'Sessions Directory', icon: Building, badge: `${dynamicSessionsCatalog.length} Sessions` },
            { id: 'roster', label: `Active Roster (${selectedBatchSession})`, icon: Users, badge: `${totalInSession} Students` },
            { id: 'yearback', label: 'Retention Registry', icon: ShieldCheck, badge: `${institutionalMetrics.retained} Retained` },
            { id: 'clearance', label: 'Graduation & Bed Recovery', icon: GraduationCap, badge: 'Workflow' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative shrink-0 px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 cursor-pointer select-none border ${
                  isActive
                    ? 'bg-white text-slate-900 border-white shadow-md font-black'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 font-extrabold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>


      {/* ========================================================================= */}
      {/* 2. TAB: SESSIONS DIRECTORY (STRICT ASCENDING HORIZONTAL DESIGN WITH SEPARATORS) */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <section className="space-y-6">
          
          {/* Executive Institutional Metrics (Horizontal Row with Bold Borders & Separators) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md flex items-center gap-4 hover:border-slate-400 transition">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border-2 border-slate-300 dark:border-slate-600 shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Total Enrollment</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white">
                  {institutionalMetrics.total}
                </div>
                <span className="text-xs font-black text-slate-600 dark:text-slate-400">Active Students</span>
              </div>
            </div>

            <div className="bg-emerald-50/20 dark:bg-slate-900 p-5 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 shadow-md flex items-center gap-4 hover:border-emerald-500 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0 border-2 border-emerald-400 dark:border-emerald-700 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Regular Progression</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {institutionalMetrics.regular}
                </div>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">Normal Track</span>
              </div>
            </div>

            <div className="bg-amber-50/20 dark:bg-slate-900 p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-700 shadow-md flex items-center gap-4 hover:border-amber-500 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0 border-2 border-amber-400 dark:border-amber-700 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">Retained / Year-Back</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {institutionalMetrics.retained}
                </div>
                <span className="text-xs font-black text-amber-800 dark:text-amber-300">Protected From Purge</span>
              </div>
            </div>

            <div className="bg-rose-50/20 dark:bg-slate-900 p-5 rounded-2xl border-2 border-rose-400 dark:border-rose-700 shadow-md flex items-center gap-4 hover:border-rose-500 transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 flex items-center justify-center shrink-0 border-2 border-rose-400 dark:border-rose-700 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-400 block">Outstanding Dues</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                  {institutionalMetrics.dues}
                </div>
                <span className="text-xs font-black text-rose-700 dark:text-rose-300">Settlement Required</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Section Dividing Bar */}
          <div className="h-0.5 bg-slate-200 dark:bg-slate-800 my-4"></div>

          {/* Subheader & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>Academic Sessions Directory</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  Strict Ascending Chronology
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-1">
                Chronologically segregated diploma sessions. Automatically rolling into upcoming sessions ({visibleSessions.length} sessions listed).
              </p>
            </div>

            {/* Scope & Hostel Filter Toolbars */}
            <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
              
              {/* Scope Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                {[
                  { id: 'ALL', label: 'All Sessions' },
                  { id: 'ACTIVE_ONLY', label: 'Active Enrolled' },
                  { id: 'GRADUATING', label: 'Final Year' },
                  { id: 'UPCOMING', label: 'Upcoming (2026+)' }
                ].map(scope => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setSessionScopeFilter(scope.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      sessionScopeFilter === scope.id
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>

              {/* Hostel Wing Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                {[
                  { id: 'ALL', label: 'All Wings' },
                  { id: 'BOYS', label: 'Boys' },
                  { id: 'GIRLS', label: 'Girls' }
                ].map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setSelectedHostel(h.id);
                      fetchSessionStudents(selectedBatchSession, h.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      selectedHostel === h.id
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* HORIZONTAL SESSION SECTIONS WITH DISTINCT BORDERS, DIVIDERS & BOLD TEXT */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {visibleSessions.map((session, idx) => {
              const studentsInSession = studentDirectory.filter(s => {
                const sSess = normalizeSess(s.semester || s.session || '');
                return sSess === session.id || sSess.includes(session.id);
              });
              const totalCount = studentsInSession.length;
              const ybCount = studentsInSession.filter(s => Boolean(s.is_year_back)).length;
              const duesCount = studentsInSession.filter(s => {
                const isPaid = (s.payment_status === 'PAID' || s.allotment_status === 'APPROVED');
                return !isPaid;
              }).length;
              const clearedCount = totalCount - duesCount;

              return (
                <div key={session.id} className="relative">
                  <article
                    className={`rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between gap-5 shadow-md hover:shadow-2xl hover:-translate-y-0.5 border-l-[12px] ${session.accentBorder} ${session.cardBorder} ${session.cardBg} ${
                      session.isFinalYear
                        ? 'ring-2 ring-amber-400/50 shadow-amber-500/10'
                        : ''
                    }`}
                  >
                    {/* Top Identity & Timeline Status Strip */}
                    <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black font-mono shadow-sm ${session.badgeBg}`}>
                          BATCH #{session.seqNumber}
                        </span>
                        
                        <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          <span>INTAKE:</span>
                          <span className="font-mono text-slate-950 dark:text-white underline decoration-2">{session.admissionYear}</span>
                          <span className="text-slate-400">•</span>
                          <span>PASSOUT:</span>
                          <span className="font-mono text-slate-950 dark:text-white underline decoration-2">{session.passoutYear}</span>
                        </div>
                      </div>

                      <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border-2 shadow-2xs ${session.tagColor}`}>
                        {session.level}
                      </span>
                    </div>

                    {/* Main Horizontal Content Strip */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                      
                      {/* Left Identity Section */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
                            {session.label}
                          </h3>

                          {session.isFinalYear ? (
                            <span className="px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 border-2 border-amber-500 flex items-center gap-1.5 shrink-0 shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                              <span>Final Year (Graduation Ready)</span>
                            </span>
                          ) : session.programType === 'LATERAL' ? (
                            <span className="px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200 border-2 border-cyan-300 dark:border-cyan-700 shrink-0">
                              Lateral Entry (2-Year Track)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 shrink-0">
                              Regular Diploma (3-Year Track)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-extrabold leading-relaxed">
                          {session.description}
                        </p>
                      </div>

                      {/* Middle: 4 Distinct Stat Boxes with Vertical Separators */}
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0 py-3 xl:py-0 border-y-2 xl:border-y-0 xl:border-x-2 border-slate-300 dark:border-slate-700 xl:px-6">
                        <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-center min-w-[85px] shadow-xs">
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase block tracking-wider">Enrolled</span>
                          <span className="text-xl font-black font-mono text-slate-950 dark:text-white">{totalCount}</span>
                        </div>

                        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 text-center min-w-[85px] shadow-xs">
                          <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase block tracking-wider">Retained</span>
                          <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{ybCount}</span>
                        </div>

                        <div className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700 text-center min-w-[85px] shadow-xs">
                          <span className="text-[10px] font-black text-rose-800 dark:text-rose-400 uppercase block tracking-wider">Dues</span>
                          <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">{duesCount}</span>
                        </div>

                        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-center min-w-[85px] shadow-xs">
                          <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase block tracking-wider">Cleared</span>
                          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{clearedCount}</span>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 self-stretch xl:self-auto">
                        {session.isFinalYear && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatchSession(session.id);
                              setActiveTab('clearance');
                            }}
                            className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-600 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
                            title="Open Graduation Clearance Protocol"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            <span>Clearance Protocol</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openSessionDrilldown(session.id)}
                          className="flex-1 xl:flex-none px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
                        >
                          <span>MANAGE ROSTER</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </article>

                  {/* Distinct Visual Separator & Step Connector between cards */}
                  {idx < visibleSessions.length - 1 && (
                    <div className="relative py-4 flex items-center justify-center my-2 select-none">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                      </div>
                      <div className="relative flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shadow-xs text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span>NEXT INTAKE SESSION</span>
                        <ArrowDown className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-mono text-slate-950 dark:text-white font-black">STEP #{visibleSessions[idx + 1].seqNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Consolidated Institutional Roster Banner (Full-Width Horizontal Strip) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-2 border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-black flex items-center gap-2.5 text-white">
                <Building className="w-5 h-5 text-amber-400" />
                <span>Consolidated Institutional Directory (All Academic Sessions Combined)</span>
              </h3>
              <p className="text-xs text-slate-300 font-semibold">
                Audit, search, and manage students across all diploma sessions concurrently in a unified master workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSessionDrilldown('ALL')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shrink-0 shadow-lg shadow-amber-400/20"
            >
              <span>Open Master Roster</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>
      )}


      {/* ========================================================================= */}
      {/* 3. TAB: ACTIVE SESSION ROSTER (DRILLDOWN WORKSPACE) */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <section className="space-y-6">
          
          {/* Breadcrumb & Batch Switcher Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 border-slate-300 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black"
                title="Return to Sessions Directory"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Sessions</span>
              </button>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Session Roster</span>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {currentSession.label}
                  </h2>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-bold hidden sm:inline">{currentSession.level}</span>
                </div>
              </div>
            </div>

            {/* Selector Controls */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <select
                value={selectedBatchSession}
                onChange={(e) => {
                  setSelectedBatchSession(e.target.value);
                  setSelectedStudentIds(new Set());
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-black font-mono bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {allSessionsCatalog.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition cursor-pointer flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                title="Export this active roster to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Counters (Horizontal Row) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { id: 'ALL', label: 'Total in Session', count: totalInSession, icon: Users },
              { id: 'ACTIVE', label: 'Regular Progression', count: countRegular, icon: CheckCircle2 },
              { id: 'YEAR_BACK', label: 'Retained (Year-Back)', count: countRetained, icon: ShieldCheck },
              { id: 'DUES_PENDING', label: 'Dues Outstanding', count: countDuesPending, icon: AlertTriangle }
            ].map(pill => {
              const isActive = statusFilter === pill.id;
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between opacity-80 mb-1">
                    <span className="text-[10.5px] font-black uppercase tracking-wider">{pill.label}</span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black font-mono">{pill.count}</div>
                </button>
              );
            })}
          </div>

          {/* Search & Layout Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-slate-300 dark:border-slate-700 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student name, registration ID, roll number, or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>

              {/* Program & Layout Switcher */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="ALL">All Programs</option>
                  <option value="REGULAR">3-Year Regular</option>
                  <option value="LATERAL">2-Year Lateral Entry</option>
                </select>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDisplayLayout('cards')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      displayLayout === 'cards'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Strip View
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayLayout('table')}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      displayLayout === 'table'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            {/* Selection Bar & Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-red-600 cursor-pointer"
                  />
                  <span>Select All Filtered</span>
                </label>

                <button
                  type="button"
                  onClick={selectClearanceCandidates}
                  className="font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Select Clearance Ready ({countClearanceReady})
                </button>
              </div>

              <span className="font-bold">
                Showing <strong>{filteredStudents.length}</strong> of {totalInSession} in session
              </span>
            </div>

            {/* Floating Bulk Action Dock */}
            {selectedStudentIds.size > 0 && (
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black font-mono text-xs">
                    {selectedStudentIds.size}
                  </span>
                  <span className="text-xs font-black">Students Selected</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const ids = Array.from(selectedStudentIds);
                      ids.forEach(id => handleToggleRetention(id, false));
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-lg transition cursor-pointer"
                  >
                    Tag as Retained (Year-Back)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive Selected</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds(new Set())}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* DATA PRESENTATION */}
            {filteredStudents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                  No student records match the active criteria.
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Try adjusting the session, program filter, or clearing the search query.
                </p>
              </div>
            ) : displayLayout === 'cards' ? (
              /* HORIZONTAL STUDENT STRIPS VIEW */
              <div className="space-y-3 pt-2">
                {filteredStudents.map((st, sIdx) => {
                  const isYb = Boolean(st.is_year_back);
                  const isPaid = (st.payment_status === 'PAID' || st.allotment_status === 'APPROVED');
                  const isSelected = selectedStudentIds.has(st.id);

                  return (
                    <div key={st.id || st.reg_no} className="space-y-2">
                      <article
                        className={`rounded-2xl p-4 sm:p-5 border-2 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-[8px] shadow-sm hover:shadow-md ${
                          isYb ? 'border-l-amber-500' : 'border-l-blue-600'
                        } ${
                          isSelected
                            ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-400 shadow-md'
                            : isYb
                            ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {/* Left: Checkbox + Avatar + Profile */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSingleSelect(st.id)}
                            className="rounded border-slate-300 text-red-600 cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black font-mono text-slate-800 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
                            {st.full_name ? st.full_name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4
                                onClick={() => setInspectedStudent(st)}
                                className="font-black text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-red-600 transition"
                              >
                                {st.full_name || 'Candidate Record'}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-mono font-bold">
                                (Roll #{st.roll_no || '00'})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono font-bold truncate">
                              Reg: <strong className="text-slate-800 dark:text-slate-200">{st.reg_no || 'N/A'}</strong> • {st.branch || 'Engineering'}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Room Allocation & Status Badges with High Contrast Dividers */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 py-2 md:py-0 border-y-2 md:border-y-0 md:border-x-2 border-slate-300 dark:border-slate-700 md:px-5">
                          {/* Bed allocation */}
                          {st.room_number && st.room_number !== 'Unassigned' ? (
                            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-black">
                              <span className="text-slate-800 dark:text-slate-200">
                                Room {st.room_number} <span className="text-slate-400 font-mono">({st.bed_code || 'A'})</span>
                              </span>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-slate-400 text-xs italic font-bold">
                              No Bed Allocated
                            </div>
                          )}

                          {/* Lifecycle badge */}
                          {isYb ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              Retained (Year-Back)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Regular Track
                            </span>
                          )}

                          {/* Fee status */}
                          {isPaid ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Dues Cleared</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>Dues Pending</span>
                            </span>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleRetention(st.id, isYb)}
                            className={`py-1.5 px-3 rounded-xl text-xs font-black transition cursor-pointer border flex items-center gap-1.5 ${
                              isYb
                                ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isYb ? 'Retained' : 'Set Year-Back'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectedStudent(st)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            title="View Profile Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(st)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            title="Vacate Bed & Archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </article>

                      {/* Divider line between student records */}
                      {sIdx < filteredStudents.length - 1 && (
                        <div className="h-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DENSE TABLE VIEW */
              <div className="rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-red-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3.5">Student Information</th>
                      <th className="py-3 px-3">Branch &amp; Session</th>
                      <th className="py-3 px-3">Hostel Accommodation</th>
                      <th className="py-3 px-3 text-center">Academic &amp; Fee Status</th>
                      <th className="py-3 px-3 text-right">Administrative Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-slate-900 font-bold">
                    {filteredStudents.map(st => {
                      const isYb = Boolean(st.is_year_back);
                      const isPaid = (st.payment_status === 'PAID' || st.allotment_status === 'APPROVED');
                      const isSelected = selectedStudentIds.has(st.id);

                      return (
                        <tr
                          key={st.id || st.reg_no}
                          className={`transition ${
                            isSelected
                              ? 'bg-amber-50/50 dark:bg-amber-950/20'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSingleSelect(st.id)}
                              className="rounded border-slate-300 text-red-600 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-black font-mono text-[11px] shrink-0 border border-slate-200 dark:border-slate-700">
                                {st.full_name ? st.full_name.slice(0, 2).toUpperCase() : 'ST'}
                              </div>
                              <div>
                                <div
                                  onClick={() => setInspectedStudent(st)}
                                  className="font-black text-slate-900 dark:text-white cursor-pointer hover:text-red-600 transition"
                                >
                                  {st.full_name || 'Candidate Record'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono font-bold">
                                  Reg: {st.reg_no}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-black text-slate-900 dark:text-slate-100 font-mono">
                              {normalizeSess(st.semester || st.session)}
                            </span>
                            <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                              {st.branch || 'Engineering'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {st.room_number && st.room_number !== 'Unassigned' ? (
                              <div>
                                <span className="font-black text-slate-900 dark:text-slate-100">
                                  Room {st.room_number} <span className="text-slate-400 font-mono font-normal">({st.bed_code || 'A'})</span>
                                </span>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {st.hostel_block || 'Standard Wing'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No Bed Allocated</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {isYb ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Retained (Year-Back)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                  Regular Track
                                </span>
                              )}

                              <span className={`text-[9.5px] font-black flex items-center gap-1 ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                <span>{isPaid ? 'Dues Cleared' : 'Dues Pending'}</span>
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => handleToggleRetention(st.id, isYb)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer border ${
                                  isYb
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {isYb ? 'Retained' : 'Set Year-Back'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(st)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Vacate & Archive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </section>
      )}


      {/* ========================================================================= */}
      {/* 4. TAB: RETENTION REGISTRY (YEAR-BACK SAFEGUARDED REPOSITORY) */}
      {/* ========================================================================= */}
      {activeTab === 'yearback' && (
        <section className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Academic Retention Policy</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Year-Back Retention Registry (Purge Protected)
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-bold max-w-2xl leading-relaxed">
              Students categorized under academic retention (Year-Back) are shielded against automated session clearance. Their hostel accommodation and mess provisioning are preserved continuously.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Safeguarded Roster ({allRetainedStudents.length} Students)
              </h3>
              <span className="text-[11px] font-black text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                Active Safeguard
              </span>
            </div>

            {allRetainedStudents.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                  Zero active retention records.
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  All enrolled students are currently progressing on their regular academic curriculum.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allRetainedStudents.map(st => (
                  <div
                    key={st.id || st.reg_no}
                    className="p-4 rounded-xl border-2 border-amber-400 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/15 flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-l-[8px] border-l-amber-500 shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4
                          onClick={() => setInspectedStudent(st)}
                          className="font-black text-sm text-slate-900 dark:text-white cursor-pointer hover:text-amber-600 transition truncate"
                        >
                          {st.full_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950 shrink-0">
                          Retained (Safe)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold">
                        Reg: <strong className="text-slate-900 dark:text-white">{st.reg_no}</strong> • Session: {normalizeSess(st.semester || st.session)} • Branch: {st.branch || 'Engineering'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Room {st.room_number || 'Unassigned'} ({st.bed_code || 'A'})
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleRetention(st.id, true)}
                        className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black transition cursor-pointer border border-slate-300 dark:border-slate-700"
                      >
                        Restore Regular
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectedStudent(st)}
                        className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition cursor-pointer"
                        title="View Profile Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      )}


      {/* ========================================================================= */}
      {/* 5. TAB: GRADUATION CLEARANCE & BED RECOVERY ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'clearance' && (
        <section className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Graduation Clearance &amp; Bed Vacation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Automated Alumni Clearance &amp; Inventory Recovery Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-bold max-w-2xl leading-relaxed">
              Transition final-year diploma graduates to alumni archives while instantly recycling allocated hostel beds back to the vacancy inventory for incoming freshers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Step 1: Session Selection (Horizontal Strips Ordered Ascending) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black">1</span>
                <span>Select Target Graduation Session (Ascending Order)</span>
              </div>

              <div className="space-y-2.5">
                {dynamicSessionsCatalog
                  .filter(c => c.isFinalYear || c.status === 'GRADUATING' || c.admissionYear <= 2024)
                  .sort((a, b) => a.admissionYear - b.admissionYear)
                  .map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedBatchSession(c.id);
                        fetchSessionStudents(c.id, selectedHostel);
                      }}
                      className={`w-full p-4 rounded-xl text-left border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedBatchSession === c.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/10 dark:bg-white/10 font-black">
                          ADM: {c.admissionYear}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-mono">{c.label}</span>
                            {c.isFinalYear && (
                              <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-amber-400 text-slate-950">
                                Final Year
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-80 font-semibold">{c.programLabel} • {c.level}</p>
                        </div>
                      </div>

                      <span className="text-xs font-black shrink-0">
                        {selectedBatchSession === c.id ? '✓ Selected Session' : 'Click to Select →'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Step 2: Audit & Policy Validation */}
            <div className="space-y-3 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black">2</span>
                <span>Pre-Clearance Audit &amp; Policy Safeguards ({selectedBatchSession})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-black uppercase block tracking-wider">Total in Session</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{totalInSession}</div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase block tracking-wider">Retained / Safe</span>
                  <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{countRetained}</div>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-black block">Excluded From Purge</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-black uppercase block tracking-wider">Pending Dues</span>
                  <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">{countDuesPending}</div>
                  <span className="text-[10px] text-rose-800 dark:text-rose-300 font-black block">Requires Settlement</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase block tracking-wider">Eligible to Clear</span>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{countClearanceReady}</div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-black block">Beds Recycled</span>
                </div>
              </div>

              {/* Policy Toggles */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeRetained}
                    onChange={(e) => setExcludeRetained(e.target.checked)}
                    className="rounded text-red-600 cursor-pointer w-4 h-4"
                  />
                  <div>
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Safeguard Year-Back Detained Candidates (Recommended)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Students tagged with Year-Back retention are exempted from archival and will preserve their room allocation.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforceNoDues}
                    onChange={(e) => setEnforceNoDues(e.target.checked)}
                    className="rounded text-red-600 cursor-pointer w-4 h-4"
                  />
                  <div>
                    <span className="font-black text-xs text-slate-900 dark:text-white block">
                      Enforce Financial No-Dues Clearance Protocol
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Prevent record archival for candidates who have unsettled hostel maintenance or dining fees.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Trigger Execution */}
            <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Execute graduation clearance for Session {selectedBatchSession}?
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  {countClearanceReady} eligible records will be archived and their beds returned to vacancy pool.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowClearanceModal(true)}
                disabled={countClearanceReady === 0}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-md shadow-red-950/40 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm &amp; Execute Clearance</span>
              </button>
            </div>

          </div>

        </section>
      )}


      {/* ========================================================================= */}
      {/* 🌟 MODAL: STUDENT PROFILE DOSSIER */}
      {/* ========================================================================= */}
      {inspectedStudent && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black font-mono text-slate-900 dark:text-white shrink-0 border border-slate-200 dark:border-slate-700">
                  {inspectedStudent.full_name ? inspectedStudent.full_name.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {inspectedStudent.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">
                    Reg: {inspectedStudent.reg_no} • Roll: #{inspectedStudent.roll_no || '00'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Academic Program</span>
                <span className="font-bold text-slate-900 dark:text-white">{inspectedStudent.branch || 'Diploma in Engineering'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Academic Session</span>
                <span className="font-black font-mono text-slate-900 dark:text-white">{normalizeSess(inspectedStudent.semester || inspectedStudent.session)}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Room &amp; Bed Allotted</span>
                <span className="font-black text-blue-600 dark:text-blue-400">
                  {inspectedStudent.room_number ? `Room ${inspectedStudent.room_number} (Bed ${inspectedStudent.bed_code || 'A'})` : 'No Allocation'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Financial Status</span>
                <span className={`font-black ${inspectedStudent.payment_status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {inspectedStudent.payment_status === 'PAID' ? 'Dues Cleared' : 'Payment Outstanding'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Registered Contact</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{inspectedStudent.mobile || inspectedStudent.email || 'None on record'}</span>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handleToggleRetention(inspectedStudent.id, Boolean(inspectedStudent.is_year_back))}
                className="flex-1 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black transition cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                {Boolean(inspectedStudent.is_year_back) ? 'Restore to Regular Track' : 'Tag as Year-Back (Retained)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(inspectedStudent);
                  setInspectedStudent(null);
                }}
                className="py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition cursor-pointer border border-rose-200"
              >
                Archive Student
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* ⚡ MODAL: BATCH CLEARANCE CONFIRMATION */}
      {/* ========================================================================= */}
      {showClearanceModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Confirm Graduation Clearance
                </h4>
                <p className="text-xs text-slate-500 font-mono font-bold">Session {selectedBatchSession}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              You are about to archive graduating candidates in Session <strong>{selectedBatchSession}</strong>. 
              Their hostel beds will be <strong>immediately vacated and recycled</strong> to the vacancy inventory.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 font-bold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Candidates:</span>
                <span className="font-mono text-slate-900 dark:text-white font-black">{totalInSession}</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>Retained Safeguard (Excluded):</span>
                <span className="font-mono font-black">{countRetained}</span>
              </div>
              <div className="flex justify-between text-emerald-600 border-t border-slate-200 dark:border-slate-700 pt-1 font-black">
                <span>Eligible for Bed Vacation:</span>
                <span className="font-mono">{countClearanceReady}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearanceModal(false)}
                disabled={isClearingBatch}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePassoutClearance}
                disabled={isClearingBatch}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase cursor-pointer transition shadow-sm"
              >
                {isClearingBatch ? 'Clearing Session...' : 'Execute Clearance'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 🗑️ MODAL: SINGLE STUDENT DELETE */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Archive Student Record
                </h4>
                <p className="text-xs text-slate-500 font-mono font-bold">Reg: {deleteCandidate.reg_no}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Are you sure you want to archive <strong>{deleteCandidate.full_name}</strong>? Any assigned hostel bed will be immediately vacated and returned to the inventory.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeletingSingle}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteIndividual}
                disabled={isDeletingSingle}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase cursor-pointer transition shadow-sm"
              >
                {isDeletingSingle ? 'Archiving...' : 'Confirm Archival'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 🗑️ MODAL: BULK DELETE */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Bulk Archive Selected Candidates
                </h4>
                <p className="text-xs text-slate-500 font-bold">{selectedStudentIds.size} records selected</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Confirm permanent archival of <strong>{selectedStudentIds.size} student records</strong>. All allocated hostel beds and room assignments will be vacated transactionally.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                disabled={isDeletingBulk}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkArchival}
                disabled={isDeletingBulk}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase cursor-pointer transition shadow-sm"
              >
                {isDeletingBulk ? 'Archiving...' : `Confirm (${selectedStudentIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
