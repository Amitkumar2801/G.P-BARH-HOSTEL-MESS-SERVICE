// src/components/PublicNoticeModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function PublicNoticeModal({ isOpen, onClose, initialCategory = 'RULES', isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (initialCategory) {
      setActiveTab(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (!isOpen) return;
    fetchDocuments();
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/public/documents');
      if (Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch public documents:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDoc = documents.find(d => d.category === activeTab) || documents.find(d => d.category === 'NOTICE');

  const handleDownload = (doc) => {
    if (!doc) return;
    
    if (doc.file_url && doc.file_url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.file_name || `GP_Barh_${doc.category}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${doc.file_name || 'Official Document'}... 📥`);
      return;
    }

    // Fallback printable text document generation for text-based guidelines
    const content = `${doc.title}\n\nGovernment Polytechnic Barh - Hostel & Mess Management\nPublished By: ${doc.uploaded_by || 'Chief Warden'}\nUpdated: ${new Date(doc.updated_at).toLocaleDateString()}\n\n${'='.repeat(60)}\n\n${doc.description || ''}\n\n${'='.repeat(60)}\nOfficial Institutional Copy - GP Barh`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.file_name ? doc.file_name.replace('.pdf', '.txt') : `GP_Barh_${doc.category}_Official.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${doc.title || 'Document'} details... 📥`);
  };

  const tabs = [
    { id: 'RULES', label: 'Hostel Rules', icon: '📜', subtitle: 'Discipline & Timings' },
    { id: 'MESS_MENU', label: 'Mess Menu', icon: '🍲', subtitle: 'Weekly Food Chart' },
    { id: 'CONTACT_WARDEN', label: 'Contact Warden', icon: '📞', subtitle: 'Office & Helplines' },
    { id: 'NOTICE', label: 'Latest Circulars', icon: '📢', subtitle: 'Official Notices' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#720e0e] via-[#851414] to-[#540a0a] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-inner">
              🏛️
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight tracking-wide">
                GP Barh Hostel &amp; Mess Official Bulletins
              </h3>
              <p className="text-[11px] text-yellow-300 font-semibold tracking-wider uppercase mt-0.5">
                Public Documents • Uploaded &amp; Verified by Chief Warden Office
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer border-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex overflow-x-auto custom-scrollbar p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-2xl text-left transition-all flex items-center gap-2.5 cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-[#720e0e] dark:text-yellow-400 shadow-sm border-slate-200 dark:border-slate-700 font-black'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900 border-transparent font-semibold'
              }`}
            >
              <span className="text-xl shrink-0">{tab.icon}</span>
              <div className="min-w-0">
                <p className="text-xs truncate">{tab.label}</p>
                <p className="text-[9.5px] opacity-75 font-normal truncate">{tab.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Fetching official documents...</p>
            </div>
          ) : currentDoc ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* TOP HERO BANNER */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30">
                      Official Notice • {currentDoc.category}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>✓</span> Verified by Warden
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {currentDoc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Last Updated: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(currentDoc.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> • Publisher: <span className="font-semibold">{currentDoc.uploaded_by || 'Chief Warden Office'}</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(currentDoc)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#720e0e] hover:bg-[#851414] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Copy</span>
                  </button>
                </div>
              </div>

              {/* IMAGE / FILE PREVIEW OR RICH CONTENT VIEW */}
              {currentDoc.file_url && currentDoc.file_url.startsWith('data:image') ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-black/5 dark:bg-black/30 p-2 text-center">
                  <img
                    src={currentDoc.file_url}
                    alt={currentDoc.title}
                    className="max-h-[480px] w-auto mx-auto rounded-xl object-contain shadow-md"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Official Image Notice • Click download above to save full resolution copy.
                  </p>
                </div>
              ) : currentDoc.file_url && currentDoc.file_url.startsWith('data:application/pdf') ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-3xl shadow-sm border border-rose-200 dark:border-rose-900">
                    📄
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{currentDoc.file_name || 'Official_Document.pdf'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Portable Document Format • {currentDoc.file_size || 'Official PDF'}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(currentDoc)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <span>Open &amp; Download PDF</span>
                    <span>📥</span>
                  </button>
                </div>
              ) : null}

              {/* DETAILED DESCRIPTION & BULLET POINTS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📌 Official Guidelines &amp; Bulletins</span>
                </h5>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  {currentDoc.description || 'Official guidelines issued by Warden office.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <p className="text-sm">No official document published under this category yet.</p>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 px-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">
            © Government Polytechnic, Barh • Directorate of Technical Education, Bihar
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer border-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicNoticeModal;
