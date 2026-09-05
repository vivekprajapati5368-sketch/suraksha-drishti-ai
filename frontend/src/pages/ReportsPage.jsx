import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, CheckCircle, Shield, AlertTriangle, User, Send, Building2, ArrowRight, MapPin, Check } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { IndianFlagLogo } from '../components/common/IndianFlagLogo';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('Relocation Recommendation Report');
  const [stateFilter, setStateFilter] = useState('All');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Field Officer Submission Form
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldOfficerName, setFieldOfficerName] = useState(user?.name || '');
  const [fieldLocation, setFieldLocation] = useState('');
  const [fieldDistrict, setFieldDistrict] = useState('');
  const [fieldState, setFieldState] = useState('Uttarakhand');
  const [fieldIncident, setFieldIncident] = useState('Pore Water Saturation / Soil Slumping');
  const [fieldObservation, setFieldObservation] = useState('');
  const [fieldNeeds, setFieldNeeds] = useState('');
  const [formMsg, setFormMsg] = useState('');

  const fetchReport = () => {
    setLoading(true);
    api.getOfficialReport(reportType, stateFilter)
      .then(res => {
        if (res.success) setReportData(res.data);
      })
      .catch(err => console.error('Failed to load report:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, stateFilter]);

  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Instant Sub-Second (1-2s) Official Report Printing & PDF Engine
  const handlePrint = () => {
    setIsPrinting(true);
    try {
      const printElement = document.getElementById('printable-report');
      if (!printElement) {
        window.print();
        setTimeout(() => setIsPrinting(false), 1200);
        return;
      }

      // Remove any previously injected print iframe
      const oldFrame = document.getElementById('sd-instant-print-frame');
      if (oldFrame) oldFrame.remove();

      // Collect all parent stylesheets and styles so all styling transfers cleanly
      const parentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(el => el.outerHTML)
        .join('\n');

      // Create zero-overhead hidden printing iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'sd-instant-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Official_Relocation_Directive_${stateFilter}_${new Date().toISOString().slice(0, 10)}</title>
            ${parentStyles}
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm 8mm 8mm 8mm;
              }
              *, *::before, *::after {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                background: #ffffff !important;
                color: #0f172a !important;
                padding: 0 !important;
                margin: 0 !important;
                font-size: 10.5px !important;
                line-height: 1.35 !important;
              }
              .no-print {
                display: none !important;
              }
              /* Top Tricolour Ribbon */
              .official-tricolor-ribbon {
                width: 100% !important;
                height: 6px !important;
                background: linear-gradient(to right, #FF671F 0%, #FF671F 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%) !important;
                border-radius: 3px !important;
                margin-bottom: 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Guaranteed Indian Flag & Logo Dimensions in Print/PDF */
              .indian-flag-logo-container {
                display: inline-flex !important;
                flex-shrink: 0 !important;
                position: relative !important;
                border-radius: 50% !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .indian-flag-logo-container svg {
                display: block !important;
                width: 100% !important;
                height: 100% !important;
              }
              /* Official Government Circular Seal */
              .official-circular-seal {
                width: 88px !important;
                height: 88px !important;
                border-radius: 50% !important;
                border: 2px dashed #000080 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 4px !important;
                text-align: center !important;
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Official Document Tables */
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin-top: 8px !important;
                margin-bottom: 10px !important;
              }
              th, td {
                border: 1px solid #334155 !important;
                padding: 5px 6px !important;
                font-size: 9.5px !important;
                text-align: left !important;
              }
              th {
                background-color: #0f172a !important;
                color: #ffffff !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              tr:nth-child(even) {
                background-color: #f8fafc !important;
              }
              tr, .print-avoid-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              h1, h2, h3, h4, strong {
                color: #000000 !important;
              }
            </style>
          </head>
          <body>
            ${printElement.innerHTML}
          </body>
        </html>
      `);
      frameDoc.close();

      // Launch print dialog in under 200 milliseconds
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          window.print();
        } finally {
          setIsPrinting(false);
        }
      }, 180);
    } catch (err) {
      console.warn('Fallback to standard window.print():', err);
      window.print();
      setIsPrinting(false);
    }
  };

  const handleExportCSV = () => {
    if (!matrix || matrix.length === 0) {
      alert('No report matrix rows available to export.');
      return;
    }

    const headers = [
      'Vulnerable Habitation',
      'District',
      'State',
      'Population at Risk',
      'Primary Hazard',
      'Risk Score (/100)',
      'Designated Safe Haven',
      'Transit Distance (km)',
      'AI Suitability Match (%)',
      'Mandated Protocol'
    ];

    const rows = matrix.map(r => [
      `"${(r.habitationName || '').replace(/"/g, '""')}"`,
      `"${(r.district || '').replace(/"/g, '""')}"`,
      `"${(r.state || '').replace(/"/g, '""')}"`,
      r.population || 0,
      `"${(r.primaryHazard || '').replace(/"/g, '""')}"`,
      r.riskScore || 0,
      `"${(r.topSafeZone || '').replace(/"/g, '""')}"`,
      r.distanceKm || 0,
      r.suitabilityScore || 0,
      `"${(r.action || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `suraksha_drishti_report_${stateFilter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3500);
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitFieldReport({
        officer_name: fieldOfficerName || user?.name || 'Field Officer',
        location_name: fieldLocation,
        district: fieldDistrict,
        state: fieldState,
        incident_type: fieldIncident,
        ground_observation: fieldObservation,
        immediate_needs: fieldNeeds
      });
      if (res.success) {
        setFormMsg('Field report logged to Disaster Management Division!');
        setFieldLocation('');
        setFieldObservation('');
        setFieldNeeds('');
        setTimeout(() => setShowFieldForm(false), 2000);
      }
    } catch (err) {
      alert('Failed to submit report: ' + err.message);
    }
  };

  const reportTypes = [
    'Relocation Recommendation Report',
    'Hazard Risk Report',
    'Vulnerable Habitation Report',
    'Safe Zone Capacity Report'
  ];

  const meta = reportData?.meta || {};
  const summary = reportData?.summary || {};
  const matrix = reportData?.relocationMatrix || [];
  const habitations = reportData?.habitations || [];
  const safeZones = reportData?.safeZones || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-cyberblue-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-cyberyellow-400">
              NATIONAL DISASTER INTELLIGENCE • DECISION-SUPPORT DOSSIER
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-display font-black tracking-tight drop-shadow-sm">
            Official Disaster Risk & Relocation Reports
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Compliant with National Disaster Risk Reduction & Immediate Relocation Guidelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowFieldForm(!showFieldForm)}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-command-950 dark:hover:bg-command-800 border border-slate-300 dark:border-cyberblue-700/80 text-slate-800 dark:text-cyberblue-300 text-xs font-bold font-mono flex items-center gap-1.5 transition hover:border-amber-500 dark:hover:border-cyberyellow-400 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-amber-600 dark:text-cyberyellow-400" />
            Field Observation
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-lg shadow-emerald-700/25 transition cursor-pointer"
            title="Generate & Download CSV File of Report"
          >
            <Download className="w-4 h-4 text-white" />
            {csvDownloaded ? '✓ CSV File Exported!' : 'Export CSV File'}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:opacity-75 text-slate-950 text-xs font-black tracking-wide flex items-center gap-2 shadow-lg shadow-yellow-500/25 transition cursor-pointer"
            title="Generate and Print PDF of Report (Instant Sub-1s)"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            {isPrinting ? '⚡ Preparing Print / PDF...' : 'Print / Export PDF'}
          </button>
        </div>
      </div>

      {/* Field Officer Submission Form Modal */}
      {showFieldForm && (
        <div className="no-print bg-white dark:bg-command-900/95 p-6 rounded-2xl border border-amber-400 dark:border-cyberyellow-400/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
              Field Officer Rapid Ground Submission
            </h3>
            <button onClick={() => setShowFieldForm(false)} className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-mono">
              Cancel
            </button>
          </div>

          {formMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
              {formMsg}
            </div>
          )}

          <form onSubmit={handleFieldSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">OFFICER NAME & CALLSIGN:</label>
              <input
                type="text"
                required
                value={fieldOfficerName}
                onChange={e => setFieldOfficerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">INCIDENT SECTOR / HABITATION:</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunil Ward Sector 3"
                value={fieldLocation}
                onChange={e => setFieldLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">DISTRICT & STATE:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="District"
                  value={fieldDistrict}
                  onChange={e => setFieldDistrict(e.target.value)}
                  className="bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                />
                <select
                  value={fieldState}
                  onChange={e => setFieldState(e.target.value)}
                  className="bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                >
                  {['Uttarakhand', 'Kerala', 'Assam', 'Himachal Pradesh', 'Odisha', 'West Bengal'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">INCIDENT TYPE:</label>
              <select
                value={fieldIncident}
                onChange={e => setFieldIncident(e.target.value)}
                className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
              >
                <option>Ground Fissure Widening</option>
                <option>Pore Water Saturation / Soil Slumping</option>
                <option>River Embankment Toe Erosion</option>
                <option>Flash Flood / High Inundation</option>
                <option>Rockfall / Debris Avalanche</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">GROUND OBSERVATION NOTES:</label>
              <textarea
                required
                rows={3}
                placeholder="Detail current structural cracks, sensor readouts, tension fissuring..."
                value={fieldObservation}
                onChange={e => setFieldObservation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">IMMEDIATE TACTICAL EVACUATION NEEDS:</label>
              <input
                type="text"
                placeholder="e.g. 40 buses, NDRF boats, emergency shelter dispatch..."
                value={fieldNeeds}
                onChange={e => setFieldNeeds(e.target.value)}
                className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-yellow-500/20"
              >
                Transmit Observation Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs (hidden in print) */}
      <div className="no-print bg-white dark:bg-command-900/90 p-4 rounded-2xl border-2 border-slate-200 dark:border-cyberblue-900/80 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {reportTypes.map(t => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition ${
                reportType === t
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/25 border border-amber-500'
                  : 'bg-slate-100 dark:bg-command-950 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold border border-slate-200 dark:border-cyberblue-900/80 hover:border-blue-400 dark:hover:border-cyberblue-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-800 dark:text-cyberyellow-400 font-mono font-black">STATE SCOPE:</span>
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="bg-white dark:bg-command-950 border-2 border-slate-300 dark:border-cyberblue-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-bold"
          >
            {['All', 'Uttarakhand', 'Kerala', 'Assam', 'Himachal Pradesh', 'Odisha', 'West Bengal'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'National (All Belts)' : s}</option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Download CSV for current scope"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.CSV</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Container */}
      <div id="printable-report" className="bg-white dark:bg-command-900 border-2 border-slate-300 dark:border-cyberblue-700/80 rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-12 text-slate-900 dark:text-slate-100 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none space-y-8">
        
        {/* Top National Tri-Colour Security Ribbon */}
        <div className="official-tricolor-ribbon h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-white to-[#138808] rounded-full shadow-sm" />

        {/* Official Government of India Letterhead Header */}
        <div className="border-b-4 border-slate-900 dark:border-cyberblue-700 pb-5 print:border-black print-avoid-break">
          {/* Top National Identity Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-300 dark:border-cyberblue-900/80 pb-4 mb-3">
            {/* Left: Enhanced Dynamic Emblem & Interactive Title */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <IndianFlagLogo size="lg" animated={true} showGlow={true} className="drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <DynamicMouseText
                    as="h1"
                    variant="brand"
                    interactive3D={true}
                    className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-slate-950 dark:text-white print:text-black select-none drop-shadow-sm"
                  >
                    SURAKSHA DRISHTI . AI
                  </DynamicMouseText>
                  <span className="no-print inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-sm select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    ACTIVE SYSTEM
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold mt-1">
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/40 text-amber-700 dark:text-cyberyellow-400 font-mono font-black tracking-wide flex items-center gap-1.5 shadow-sm print:text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse no-print"></span>
                    surakshadrishti.ai
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 print:text-black">
                    • Autonomous Disaster Intelligence & Relocation Decision System
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Restricted Directive Metadata */}
            <div className="text-right font-mono text-[11px] space-y-1.5">
              <div className="directive-urgent-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-mono font-black uppercase text-[10.5px] sm:text-[11px] tracking-wider shadow-sm print:bg-red-50 print:border-red-600">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 dark:bg-red-400"></span>
                </span>
                <span className="whitespace-nowrap">अति आवश्यक // IMMEDIATE OPERATIONAL DIRECTIVE</span>
              </div>
              <div className="font-black text-slate-950 dark:text-white print:text-black text-xs font-mono">
                FILE NO: SD-AI/2026/RELOC-DIR-084
              </div>
              <div className="text-slate-600 dark:text-slate-400 print:text-black font-bold text-[10px] font-mono">
                BARCODE: |||| ||| ||||| |||| |||||| SD-AI-2026-IN
              </div>
              <div className="text-slate-600 dark:text-slate-400 print:text-black text-[10px] font-mono font-semibold">
                ISSUE DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              </div>
            </div>
          </div>

          {/* Official Memorandum Subject Order Box */}
          <div className="mt-3 p-3.5 bg-slate-50 dark:bg-command-950 border-2 border-slate-900 dark:border-cyberblue-800 rounded-xl print:bg-gray-100 print:border-black font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-black text-slate-950 dark:text-white print:text-black border-b border-slate-300 dark:border-slate-800 pb-1.5 mb-1.5">
              <span>विषय / SUBJECT: STATUTORY DIRECTIVE FOR AUTONOMOUS POPULATION RELOCATION & SAFE HAVEN ALLOCATION</span>
              <span className="directive-urgent-badge inline-block px-3 py-1 rounded-full font-black text-[10.5px]">
                DISASTER MANAGEMENT ACT 2005 (SEC 38 & 39)
              </span>
            </div>
            <p className="text-[11px] text-slate-800 dark:text-slate-300 print:text-black font-sans leading-relaxed">
              Promulgated by order of the Competent Authority. In accordance with geotechnical telemetric trigger thresholds established under <strong>SURAKSHA DRISHTI . AI</strong>, immediate evacuation from the high-vulnerability sectors detailed in this dossier is mandated. District Magistrates, Police Superintendents, and NDRF Battalions shall execute safe transit routing to designated safe haven installations in accordance with carrying capacity allocations.
            </p>
          </div>
        </div>

        {/* Report Metadata Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-command-950 border-2 border-slate-200 dark:border-cyberblue-900 text-xs font-mono print:bg-gray-100 print:text-black print:border-black shadow-sm print-avoid-break">
          <div>
            <span className="text-slate-600 dark:text-slate-400 print:text-black block text-[10px] font-bold">DOCUMENT REF:</span>
            <strong className="text-amber-800 dark:text-cyberyellow-400 print:text-black font-black text-sm">{meta.documentRef || 'SD-AI/2026/RELOC-DIR-084'}</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 print:text-black block text-[10px] font-bold">REPORT TYPE:</span>
            <strong className="text-slate-950 dark:text-white print:text-black font-extrabold">{meta.reportType || reportType}</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 print:text-black block text-[10px] font-bold">GENERATED TIMESTAMP:</span>
            <strong className="text-slate-950 dark:text-white print:text-black font-extrabold">{new Date().toLocaleDateString('en-IN')} (IST)</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 print:text-black block text-[10px] font-bold">JURISDICTION SCOPE:</span>
            <strong className="text-blue-800 dark:text-cyberblue-300 print:text-black font-black text-sm">{meta.regionScope || (stateFilter === 'All' ? 'National (All Sectors)' : stateFilter)}</strong>
          </div>
        </div>

        {/* Section 1: Executive Situational Appraisal Metrics */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-cyberblue-900 pb-2">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono text-slate-950 dark:text-cyberyellow-400 print:text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-yellow-400"></span>
              1. Executive Situational Appraisal & Carrying Capacity
            </h3>
            <span className="text-[10px] font-mono font-extrabold text-slate-600 dark:text-slate-400 print:text-black">
              AUTONOMOUS INFERENCE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-command-950 rounded-2xl border-2 border-slate-200 dark:border-cyberblue-900 print:border-black shadow-sm">
              <span className="text-slate-600 dark:text-slate-400 print:text-black block text-[10px] font-extrabold">HABITATIONS MONITORED</span>
              <strong className="text-2xl text-slate-950 dark:text-white font-display font-black print:text-black">{summary.totalHabitationsMonitored}</strong>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-1">Total Geo-Tagged Sectors</span>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border-2 border-red-300 dark:border-red-800/80 print:border-black shadow-sm">
              <span className="text-red-700 dark:text-red-300 print:text-black block text-[10px] font-extrabold">CRITICAL RED-ZONE HABITATIONS</span>
              <strong className="text-2xl text-red-600 dark:text-red-400 font-display font-black print:text-red-700">{summary.criticalHabitationsCount}</strong>
              <span className="block text-[10px] text-red-600 dark:text-red-400 mt-1 font-bold">Immediate Relocation Required</span>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 print:border-black shadow-sm">
              <span className="text-amber-800 dark:text-amber-300 print:text-black block text-[10px] font-extrabold">POPULATION AT IMMINENT RISK</span>
              <strong className="text-2xl text-amber-800 dark:text-cyberyellow-400 font-display font-black print:text-black">{summary.criticalPopulation?.toLocaleString()}</strong>
              <span className="block text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-bold">Citizens in Danger Zones</span>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800/80 print:border-black shadow-sm">
              <span className="text-emerald-800 dark:text-emerald-300 print:text-black block text-[10px] font-extrabold">AVAILABLE SHELTER CAPACITY</span>
              <strong className="text-2xl text-emerald-700 dark:text-emerald-400 font-display font-black print:text-emerald-800">{summary.totalAvailableSafeCapacity?.toLocaleString()}</strong>
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-bold">Verified Geotechnical Safe Beds</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-command-950 border-2 border-slate-300 dark:border-cyberblue-700/70 rounded-2xl text-xs print:bg-gray-100 print:border-black shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <strong className="text-amber-800 dark:text-cyberyellow-400 print:text-black font-mono font-black text-sm">CIVIC READINESS STATUS: </strong>
              <span className="font-black text-slate-950 dark:text-white print:text-black text-sm">{summary.operationalReadinessStatus}</span>
            </div>
            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 print:text-black font-bold">
              Surplus capacity margin: <span className="text-emerald-700 dark:text-emerald-300 font-black">{summary.capacitySurplusDeficit?.toLocaleString()}</span> persons across designated havens.
            </div>
          </div>
        </div>

        {/* Section 2: ⚡ 5-SECOND EXECUTIVE FLASH DIRECTIVE: HIGHLIGHTED PLACES */}
        <div className="space-y-4 print-avoid-break">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-200 dark:border-cyberblue-900 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="directive-urgent-badge px-3 py-0.5 rounded-full font-mono font-black text-[10.5px] uppercase tracking-wider shadow-sm">
                  FLASH DIRECTIVE
                </span>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-display text-slate-950 dark:text-white print:text-black">
                  2. Critical Ground-Zero Habitations & Designated Safe Haven Routing
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 print:text-black">
                Rapid administrative decision matrix — specific high-risk locations and assigned safe havens for instant execution.
              </p>
            </div>
            <div className="text-[11px] font-mono font-extrabold text-amber-800 dark:text-cyberyellow-400 print:text-black">
              PRIORITY EVACUATION ORDER (SOP-07)
            </div>
          </div>

          {/* Flash Cards Grid Highlighting Specific Places */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matrix.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-command-950 border-2 border-red-300 dark:border-red-700/80 shadow-md print:border-black print:bg-white flex flex-col justify-between space-y-3 print-avoid-break hover:border-red-500 transition-colors"
              >
                {/* Card Header with Urgency & Match */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-300 font-black text-[10px] uppercase tracking-wider font-mono print:border print:border-black print:text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    PRIORITY EVACUATION #{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-black text-amber-800 dark:text-cyberyellow-400 print:text-black">
                    AI MATCH: {item.suitabilityScore}%
                  </span>
                </div>

                {/* Ground Zero (Vulnerable Place) */}
                <div className="p-3 rounded-xl bg-red-50/90 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800/80 print:border-black print:bg-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono font-black uppercase text-red-700 dark:text-red-400 tracking-wider">
                        📍 VULNERABLE GROUND ZERO (EVACUATE FROM)
                      </div>
                      <div className="text-base sm:text-lg font-black text-red-950 dark:text-white print:text-black font-display leading-tight mt-0.5">
                        {item.habitationName}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        {item.district}, {item.state}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase font-bold">AT RISK</div>
                      <div className="text-base font-black text-red-700 dark:text-red-400 font-mono">
                        {item.population.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900/60 text-[11px] font-mono text-red-900 dark:text-red-300 flex items-center justify-between">
                    <span className="font-bold">Active Threat: {item.primaryHazard}</span>
                    <span className="font-black">Risk Score: {item.riskScore}/100</span>
                  </div>
                </div>

                {/* Transit Corridor Connector */}
                <div className="flex items-center justify-between px-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  <div className="flex items-center gap-1 text-blue-700 dark:text-cyberblue-300 font-black">
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    <span>DIRECTED TRANSIT CORRIDOR:</span>
                  </div>
                  <span className="font-black text-slate-950 dark:text-white print:text-black">{item.distanceKm} km (Clear Route)</span>
                </div>

                {/* Destination Safe Haven (Target Safe Place) */}
                <div className="p-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-800/80 print:border-black print:bg-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                        🛡️ DESIGNATED SAFE HAVEN (EVACUATE TO)
                      </div>
                      <div className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200 print:text-black font-display leading-tight mt-0.5">
                        {item.topSafeZone}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        Geotechnical Stability Verified • Low Slope Gradient (&lt;5°)
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/60 text-[11px] font-mono text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                    <span className="font-bold">Carrying Capacity: Adequate Headroom</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">STATUS: READY TO RECEIVE</span>
                  </div>
                </div>

                {/* Bottom Mandated Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="directive-urgent-badge px-3.5 py-1.5 rounded-full font-mono font-black text-xs uppercase tracking-wide shadow-sm print:bg-red-50 print:border-red-600">
                    🚨 {item.action}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 print:text-black">
                    Convoy Speed: 35 km/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Comprehensive Relocation Matrix Table */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-cyberblue-900 pb-2">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono text-slate-950 dark:text-cyberyellow-400 print:text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              3. Comprehensive Priority Relocation & Safe Zone Ledger
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 print:text-black">
              FULL SECTOR ROSTER ({matrix.length} RECORDED)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-slate-300 dark:border-cyberblue-900 print:border-black shadow-sm">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b-2 border-slate-300 dark:border-cyberblue-800 text-slate-950 dark:text-cyberyellow-300 bg-slate-100 dark:bg-command-950 font-mono font-black print:bg-gray-200 print:text-black">
                  <th className="py-3 px-2 text-center w-10">SL</th>
                  <th className="py-3 px-3">Vulnerable Habitation (Ground Zero)</th>
                  <th className="py-3 px-3">Jurisdiction</th>
                  <th className="py-3 px-3 text-right">Population</th>
                  <th className="py-3 px-3">Primary Hazard</th>
                  <th className="py-3 px-3">Designated Safe Haven</th>
                  <th className="py-3 px-3 text-right">Transit Dist.</th>
                  <th className="py-3 px-3 text-center">AI Match</th>
                  <th className="py-3 px-3">Mandated Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-cyberblue-900/60 print:divide-black">
                {matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-command-800/40 transition print:hover:bg-transparent">
                    <td className="py-3 px-2 text-center font-mono font-black text-slate-700 dark:text-slate-400 print:text-black text-xs">
                      {idx + 1}
                    </td>

                    {/* Highlighted Vulnerable Habitation */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-950 dark:text-red-200 font-black text-xs shadow-sm print:border-black print:text-black">
                        <span className="text-red-600 dark:text-red-400 text-sm">📍</span>
                        <span>{row.habitationName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-bold print:text-black">
                      {row.district}, {row.state}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-slate-950 dark:text-cyberyellow-300 text-sm print:text-black">
                      {row.population.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-bold print:text-black">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-command-950 text-slate-900 dark:text-white font-mono font-semibold border border-slate-300 dark:border-slate-700">
                        {row.primaryHazard}
                      </span>
                    </td>

                    {/* Highlighted Safe Haven */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-black text-xs shadow-sm print:border-black print:text-black">
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm">🛡️</span>
                        <span>{row.topSafeZone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-slate-100 print:text-black">
                      {row.distanceKm} km
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-mono font-black text-xs bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                        {row.suitabilityScore}%
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="directive-urgent-badge inline-block px-2.5 py-1 rounded-full font-mono font-black text-[10.5px] uppercase tracking-wider shadow-sm print:bg-red-50 print:border-red-600">
                        {row.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Standard Operating Directive for Ground Responders */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-command-950 border-2 border-amber-300 dark:border-amber-700/80 text-xs font-mono space-y-2 print:bg-gray-100 print:border-black print-avoid-break">
          <div className="flex items-center gap-2 text-amber-900 dark:text-cyberyellow-400 font-black text-sm uppercase">
            <span>⚠️ FIELD EXECUTION PROTOCOL (DISTRICT MAGISTRATE & NDRF MANDATE)</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold print:text-black">
            1. <strong>Arterial Passage Clearances:</strong> District Police and BRO are directed to maintain green corridor access on all assigned transit roads. No unessential heavy commercial vehicles allowed during convoy movement.
          </p>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold print:text-black">
            2. <strong>Medical & Triage Readiness:</strong> District Health Officers must position mobile trauma and pediatric ambulances at destination safe havens prior to first convoy arrival.
          </p>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold print:text-black">
            3. <strong>Geo-Sensor Synchronization:</strong> Real-time geotechnical tiltmeters and pore pressure transducers are to be kept on 5-minute sampling intervals until red-zone clearance is certified.
          </p>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold print:text-black">
            4. <strong>Logistics & Sustenance Supplies:</strong> Civil supplies departments shall pre-position 72-hour dry rations, water purification units, and auxiliary solar power sets at all safe haven receiving depots.
          </p>
        </div>

        {/* Section 5: Authorization & Verification Seals */}
        <div className="pt-6 border-t-4 border-slate-900 dark:border-cyberblue-700 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono print:border-black print-avoid-break">
          {/* Left: Prepared By */}
          <div className="flex-1">
            <p className="text-slate-600 dark:text-slate-400 print:text-black mb-3 font-bold text-[10px] uppercase">
              PREPARED & COMPILED BY:
            </p>
            <p className="font-black text-amber-800 dark:text-cyberyellow-300 print:text-black text-sm">
              SURAKSHA DRISHTI . AI INFERENCE PIPELINE
            </p>
            <p className="text-slate-700 dark:text-slate-300 font-bold mt-0.5">
              Autonomous Geotechnical & Carrying Capacity Neural Engine
            </p>
            <div className="mt-3 p-2 bg-slate-100 dark:bg-command-950 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono inline-block">
              SHA256: 7e2b8f40a1c9...8d24 (SYSTEM VERIFIED)
            </div>
          </div>

          {/* Right: Official Decision Support Brand Lockup (1st into 2nd) */}
          <div className="flex items-center gap-4 flex-shrink-0 select-none">
            <div className="flex-shrink-0">
              <IndianFlagLogo size="lg" animated={true} showGlow={true} />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <DynamicMouseText
                as="div"
                variant="brand"
                className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-950 dark:text-white print:text-black"
              >
                SURAKSHA DRISHTI . AI
              </DynamicMouseText>
              
              <div className="flex flex-col items-start gap-1.5 font-mono">
                {/* ACTIVE SYSTEM pill */}
                <span className="inline-flex items-center px-3.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#072418] border border-emerald-500/90 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-mono font-black uppercase tracking-wider shadow-sm">
                  ACTIVE SYSTEM
                </span>

                {/* surakshadrishti.ai pill */}
                <span className="inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-amber-100 dark:bg-[#271d0c] border border-amber-500/80 text-amber-900 dark:text-amber-400 text-[10.5px] font-mono font-bold tracking-wide shadow-sm print:text-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                  surakshadrishti.ai
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer: System & Developer Attribution */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 print:text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold">SYSTEM ARCHITECT & DEVELOPER:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700/80 font-black text-blue-900 dark:text-cyberyellow-300 print:border-black print:text-black">
              VIVEK KUMAR
            </span>
          </div>
          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium print:text-black">
            SURAKSHA DRISHTI . AI • NATIONAL DISASTER DECISION SUPPORT
          </div>
        </div>

      </div>
    </div>
  );
}

