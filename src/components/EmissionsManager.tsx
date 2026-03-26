import { useState, useRef, useEffect, useCallback } from 'react';

interface DataRow { [key: string]: string }

const SAMPLE_HEADERS = [
  'Date','Site ID','Flue ID','CO2 (ppm)','CO (ppm)',
  'NOx (ppm)','SO2 (ppm)','O2 (%)','Temp (°C)',
  'Flow Rate (m³/h)','Status','Operator',
];
const SAMPLE_DATA_RAW = [
  ['2024-11-01','SITE-A','FL-01','412','18','45','12','20.1','185','320','Normal','J. Smith'],
  ['2024-11-01','SITE-A','FL-02','438','22','61','15','19.8','192','315','Warning','J. Smith'],
  ['2024-11-02','SITE-B','FL-01','401','15','38','10','20.3','178','330','Normal','R. Patel'],
  ['2024-11-02','SITE-B','FL-02','455','30','82','18','19.4','205','298','Critical','R. Patel'],
  ['2024-11-03','SITE-A','FL-01','409','17','42','11','20.2','182','325','Normal','J. Smith'],
  ['2024-11-03','SITE-C','FL-01','421','20','50','13','20.0','190','310','Normal','L. Chen'],
  ['2024-11-04','SITE-C','FL-02','466','28','75','17','19.5','210','290','Warning','L. Chen'],
  ['2024-11-04','SITE-B','FL-01','398','14','36','9','20.4','175','335','Normal','R. Patel'],
  ['2024-11-05','SITE-A','FL-01','415','19','47','12','20.1','186','318','Normal','J. Smith'],
  ['2024-11-05','SITE-C','FL-01','428','21','55','14','19.9','193','308','Normal','L. Chen'],
];

type Tab = 'import' | 'data' | 'export';

export function EmissionsManager() {
  const [tab, setTab] = useState<Tab>('import');
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [pending, setPending] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ filename: string; total: number } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exportFmt, setExportFmt] = useState<'csv' | 'xlsx'>('csv');
  const [exportFilter, setExportFilter] = useState('all');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [isDrag, setIsDrag] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Load XLSX from CDN once
  useEffect(() => {
    if ((window as any).XLSX) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    document.head.appendChild(s);
  }, []);

  // Sync selected columns when data changes
  useEffect(() => {
    if (allData.length) setSelectedCols(Object.keys(allData[0]));
  }, [allData]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  }, []);

  const parseFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      let headers: string[], rows: string[][];
      if (ext === 'csv') {
        const lines = (e.target!.result as string).trim().split('\n').map(l =>
          l.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
        );
        headers = lines[0];
        rows = lines.slice(1).filter(r => r.some(c => c));
      } else {
        const XLSX = (window as any).XLSX;
        if (!XLSX) { showToast('XLSX library still loading, please try again'); return; }
        const wb = XLSX.read(e.target!.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        headers = json[0].map(String);
        rows = json.slice(1)
          .filter((r: any[]) => r && r.some(c => c !== undefined && c !== ''))
          .map((r: any[]) => r.map(String));
      }
      setPending({ headers, rows });
      setPreviewMeta({ filename: file.name, total: rows.length });
    };
    if (ext === 'csv') reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const confirmImport = () => {
    if (!pending) return;
    const data = pending.rows.map(row => {
      const obj: DataRow = {};
      pending.headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
      return obj;
    });
    setAllData(data);
    setPending(null);
    setPreviewMeta(null);
    showToast(`✓ Imported ${data.length} records successfully`);
    setTab('data');
  };

  const clearImport = () => {
    setPending(null);
    setPreviewMeta(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const loadSample = () => {
    setPending({ headers: SAMPLE_HEADERS, rows: SAMPLE_DATA_RAW });
    setPreviewMeta({ filename: 'sample_emissions.csv', total: SAMPLE_DATA_RAW.length });
  };

  const addRow = () => {
    if (!allData.length) { showToast('! Import data first'); return; }
    const blank: DataRow = {};
    Object.keys(allData[0]).forEach(h => { blank[h] = ''; });
    blank['Date'] = new Date().toISOString().split('T')[0];
    blank['Status'] = 'Normal';
    setAllData(prev => [...prev, blank]);
    showToast('✓ New row added');
  };

  const deleteRow = (i: number) => {
    setAllData(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateCell = (ri: number, col: string, val: string) => {
    setAllData(prev => prev.map((row, i) => i === ri ? { ...row, [col]: val } : row));
  };

  const doExport = () => {
    if (!allData.length) { showToast('! No data to export'); return; }
    const rows = exportFilter === 'all' ? allData : allData.filter(r => r['Status'] === exportFilter);
    const filtered = rows.map(row => {
      const obj: DataRow = {};
      selectedCols.forEach(h => { obj[h] = row[h] ?? ''; });
      return obj;
    });
    const dateStr = new Date().toISOString().split('T')[0];
    if (exportFmt === 'csv') {
      const lines = [
        selectedCols.join(','),
        ...filtered.map(r => selectedCols.map(h => `"${r[h]}"`).join(',')),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `emissions_export_${dateStr}.csv`;
      a.click();
    } else {
      const XLSX = (window as any).XLSX;
      if (!XLSX) { showToast('XLSX library still loading, please try again'); return; }
      const ws = XLSX.utils.json_to_sheet(filtered, { header: selectedCols });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Emissions Data');
      XLSX.writeFile(wb, `emissions_export_${dateStr}.xlsx`);
    }
    showToast(`✓ Exported ${filtered.length} rows as .${exportFmt}`);
  };

  // Computed
  const headers = allData.length ? Object.keys(allData[0]) : [];
  const filteredRows = allData.filter(row => {
    const matchSearch = !search || Object.values(row).some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !statusFilter || row['Status'] === statusFilter;
    return matchSearch && matchStatus;
  });

  const nums = (col: string) => allData.map(r => parseFloat(r[col])).filter(n => !isNaN(n));
  const avg = (col: string) => { const n = nums(col); return n.length ? Math.round(n.reduce((a,b)=>a+b,0)/n.length) : null; };
  const uniqueSites = new Set(allData.map(r => r['Site ID']).filter(Boolean)).size;

  const hasCritical = allData.some(r => r['Status'] === 'Critical');
  const hasWarning  = allData.some(r => r['Status'] === 'Warning');
  const dotColor = hasCritical || hasWarning ? 'bg-amber-400' : allData.length ? 'bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]' : 'bg-slate-500';
  const statusText = allData.length
    ? (hasCritical ? `${allData.length} records · critical` : hasWarning ? `${allData.length} records · warning` : `${allData.length} records · ok`)
    : 'No data loaded';

  const exportCount = exportFilter === 'all' ? allData.length : allData.filter(r => r['Status'] === exportFilter).length;

  const navBtn = (id: Tab, label: string, icon: React.ReactNode, badge?: number) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors text-left ${
        tab === id ? 'bg-blue-600/25 text-white font-medium' : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'
      }`}
    >
      <span className={tab === id ? 'opacity-100' : 'opacity-70'}>{icon}</span>
      {label}
      {badge !== undefined && (
        <span className="ml-auto bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono">{badge}</span>
      )}
    </button>
  );

  const statusBadge = (status: string) => {
    const cls = status === 'Critical'
      ? 'bg-red-50 text-red-600'
      : status === 'Warning'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-emerald-50 text-emerald-600';
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <div className="flex rounded-xl border border-border overflow-hidden shadow-sm" style={{ minHeight: 640 }}>

      {/* ── Sidebar ── */}
      <aside className="w-52 bg-[#0F1728] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white leading-tight">EmissionsTrack</span>
        </div>

        <nav className="flex-1 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-2">Data</p>
          {navBtn('import', 'Import',
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          )}
          {navBtn('data', 'Data Table',
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>,
            allData.length
          )}
          {navBtn('export', 'Export',
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          )}

          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mt-5 mb-2">Status</p>
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-slate-400 font-mono">
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} />
            <span>{statusText}</span>
          </div>
        </nav>

        <div className="px-4 py-3.5 border-t border-white/10">
          <span className="text-[11px] text-slate-600 font-mono">v1.0.0 · Compliance Ready</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 bg-[#F4F5F7] overflow-auto p-8">

        {/* ── IMPORT TAB ── */}
        {tab === 'import' && (
          <div>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-xl font-semibold text-[#0F1728] tracking-tight">Import Data</h1>
                <p className="text-sm text-slate-400 mt-0.5">Upload a CSV or Excel file to load emissions records</p>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
              onDragLeave={() => setIsDrag(false)}
              onDrop={e => { e.preventDefault(); setIsDrag(false); if (e.dataTransfer.files[0]) parseFile(e.dataTransfer.files[0]); }}
              className={`bg-white border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
                isDrag ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/40'
              }`}
            >
              <div className="h-14 w-14 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </div>
              <p className="text-[15px] font-medium text-[#0F1728] mb-1.5">Drop your file here</p>
              <p className="text-sm text-slate-400">or <span className="text-blue-600">click to browse</span> · .csv, .xlsx, .xls</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { if (e.target.files?.[0]) parseFile(e.target.files[0]); }} />

            {/* Preview */}
            {pending && previewMeta && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 font-mono">
                    <div className="h-6 w-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    {previewMeta.filename} — {Math.min(5, pending.rows.length)} of {previewMeta.total} rows
                  </div>
                  <div className="flex gap-2">
                    <button onClick={confirmImport} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Confirm import
                    </button>
                    <button onClick={clearImport} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">Discard</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50">
                      <tr>{pending.headers.map(h => <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {pending.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          {pending.headers.map((_, j) => <td key={j} className="px-3 py-2 text-slate-500 font-mono text-[12px] whitespace-nowrap">{row[j] ?? ''}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sample */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Don't have a file?</p>
              <button onClick={loadSample} className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-white border border-slate-300 hover:border-slate-400 hover:text-slate-800 px-3 py-1.5 rounded-md transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Load sample emissions dataset
              </button>
            </div>
          </div>
        )}

        {/* ── DATA TAB ── */}
        {tab === 'data' && (
          <div>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h1 className="text-xl font-semibold text-[#0F1728] tracking-tight">Data Table</h1>
                <p className="text-sm text-slate-400 mt-0.5">View, search and edit emissions records</p>
              </div>
              <button onClick={addRow} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add row
              </button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-3.5 mb-6">
              {[
                { label: 'Total Records', value: allData.length, color: 'bg-blue-50 text-blue-600', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
                { label: 'Avg CO₂ (ppm)', value: avg('CO2 (ppm)') ?? '—', color: 'bg-emerald-50 text-emerald-600', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M4 20V10l8-8 8 8v10"/></svg> },
                { label: 'Avg NOₓ (ppm)', value: avg('NOx (ppm)') ?? '—', color: 'bg-amber-50 text-amber-600', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                { label: 'Active Sites', value: uniqueSites || '—', color: 'bg-purple-50 text-purple-600', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10A15.3 15.3 0 018 12 15.3 15.3 0 0112 2z"/></svg> },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.color}`}>{kpi.icon}</div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{kpi.label}</p>
                    <p className="text-2xl font-semibold text-[#0F1728] font-mono leading-none">{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative flex-none w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search records…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-[#0F1728] placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-600 outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                <option value="">All statuses</option>
                <option value="Normal">Normal</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      {headers.map(h => <th key={h} className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 whitespace-nowrap">{h}</th>)}
                      <th className="border-b border-slate-200" />
                    </tr>
                  </thead>
                  <tbody>
                    {!headers.length ? (
                      <tr>
                        <td colSpan={12} className="py-16 text-center text-slate-400 text-sm">
                          <svg className="mx-auto mb-3 opacity-30" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
                          <p>No data loaded</p>
                          <small className="text-xs">Go to the Import tab to load a CSV or Excel file</small>
                        </td>
                      </tr>
                    ) : filteredRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                        {headers.map(h => (
                          <td key={h} className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[12px] text-slate-500">
                            {h === 'Status' ? statusBadge(row[h]) : (
                              <input
                                className="bg-transparent outline-none focus:bg-blue-50 focus:text-[#0F1728] rounded px-1 w-full min-w-[60px] transition-colors"
                                value={row[h] ?? ''}
                                onChange={e => updateCell(allData.indexOf(row), h, e.target.value)}
                              />
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => deleteRow(allData.indexOf(row))}
                            className="text-[11px] text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ── */}
        {tab === 'export' && (
          <div>
            <div className="mb-7">
              <h1 className="text-xl font-semibold text-[#0F1728] tracking-tight">Export Data</h1>
              <p className="text-sm text-slate-400 mt-0.5">Download your emissions records as CSV or Excel</p>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>
              <div>
                {/* Format */}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">File format</p>
                <div className="space-y-2.5 mb-7">
                  {(['csv', 'xlsx'] as const).map(fmt => (
                    <div
                      key={fmt}
                      onClick={() => setExportFmt(fmt)}
                      className={`flex items-center gap-3.5 p-4 bg-white rounded-xl border-2 cursor-pointer transition-colors shadow-sm ${
                        exportFmt === fmt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`font-mono text-lg font-medium w-14 flex-shrink-0 ${fmt === 'csv' ? 'text-emerald-600' : 'text-blue-600'}`}>.{fmt.toUpperCase()}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0F1728]">{fmt === 'csv' ? 'CSV File' : 'Excel Workbook'}</p>
                        <p className="text-xs text-slate-400">{fmt === 'csv' ? 'Universal comma-separated format, compatible with all tools.' : 'Microsoft Excel format with column headers.'}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center transition-opacity ${exportFmt === fmt ? 'opacity-100' : 'opacity-0'}`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Filter records</p>
                <div className="flex gap-2 flex-wrap mb-7">
                  {['all', 'Normal', 'Warning', 'Critical'].map(f => (
                    <button
                      key={f}
                      onClick={() => setExportFilter(f)}
                      className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                        exportFilter === f ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {f === 'all' ? 'All records' : f}
                    </button>
                  ))}
                </div>

                {/* Action */}
                <div className="flex items-center gap-3.5">
                  <button onClick={doExport} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    Download file
                  </button>
                  <span className="text-xs text-slate-400 font-mono">{exportCount ? `${exportCount} rows will be exported` : 'No data to export'}</span>
                </div>
              </div>

              {/* Column selector */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm self-start">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Columns to include</p>
                <div className="space-y-0.5">
                  {(allData.length ? Object.keys(allData[0]) : []).map(col => (
                    <label key={col} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 transition-colors text-sm text-slate-600 font-mono">
                      <input
                        type="checkbox"
                        checked={selectedCols.includes(col)}
                        onChange={e => setSelectedCols(prev => e.target.checked ? [...prev, col] : prev.filter(c => c !== col))}
                        className="accent-blue-600 h-3.5 w-3.5 cursor-pointer"
                      />
                      {col}
                    </label>
                  ))}
                  {!allData.length && <p className="text-xs text-slate-400 px-2 py-1">Import data first</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#0F1728] text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
