// ── State ──────────────────────────────────────────────────────────────────
let allData = [];
let pendingData = [];
let pendingHeaders = [];
let exportFmt = 'csv';
let exportFilter = 'all';

// ── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_HEADERS = [
  'Date','Site ID','Flue ID','CO2 (ppm)','CO (ppm)',
  'NOx (ppm)','SO2 (ppm)','O2 (%)','Temp (°C)',
  'Flow Rate (m³/h)','Status','Operator'
];
const SAMPLE_DATA = [
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

// ── Tabs ───────────────────────────────────────────────────────────────────
function switchTab(tab, el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
  if (tab === 'data') renderTable();
  if (tab === 'export') renderExportPanel();
}

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, icon) {
  const t = document.getElementById('toast');
  t.innerHTML = (icon || '✓') + ' ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Drag & Drop ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('dropzone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
});

// ── File handling ──────────────────────────────────────────────────────────
function handleFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = e => {
    let headers, rows;
    if (ext === 'csv') {
      const lines = e.target.result.trim().split('\n').map(l =>
        l.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      );
      headers = lines[0];
      rows = lines.slice(1).filter(r => r.some(c => c));
    } else {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
      headers = json[0];
      rows = json.slice(1).filter(r => r && r.some(c => c !== undefined && c !== ''));
    }
    pendingHeaders = headers;
    pendingData = rows;
    showPreview(headers, rows.slice(0, 5), file.name, rows.length);
  };

  if (ext === 'csv') reader.readAsText(file);
  else reader.readAsArrayBuffer(file);
}

function showPreview(headers, rows, filename, total) {
  const preview = document.getElementById('importPreview');
  const table = document.getElementById('previewTable');
  document.getElementById('previewLabel').textContent =
    `${filename} — ${rows.length} of ${total} rows`;
  table.innerHTML = '';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = headers.map((_, i) =>
      `<td>${row[i] !== undefined ? row[i] : ''}</td>`
    ).join('');
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  preview.style.display = 'block';
}

function confirmImport() {
  allData = pendingData.map(row => {
    const obj = {};
    pendingHeaders.forEach((h, i) => obj[h] = row[i] !== undefined ? row[i] : '');
    return obj;
  });
  updateSidebar();
  showToast(`Imported ${allData.length} records successfully`);
  clearImport();
  // Switch to Data tab
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item')[1].classList.add('active');
  document.getElementById('panel-data').classList.add('active');
  renderTable();
}

function clearImport() {
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('fileInput').value = '';
  pendingData = []; pendingHeaders = [];
}

function loadSample() {
  pendingHeaders = SAMPLE_HEADERS;
  pendingData = SAMPLE_DATA;
  showPreview(SAMPLE_HEADERS, SAMPLE_DATA.slice(0, 5), 'sample_emissions.csv', SAMPLE_DATA.length);
}

// ── Sidebar status ─────────────────────────────────────────────────────────
function updateSidebar() {
  const count = allData.length;
  document.getElementById('navCount').textContent = count;
  document.getElementById('stat-total').textContent = count;

  const dot = document.getElementById('sidebarDot');
  const statusEl = document.getElementById('sidebarStatus');

  if (count === 0) {
    dot.className = 'status-dot';
    statusEl.textContent = 'No data loaded';
  } else {
    const hasCritical = allData.some(r => r['Status'] === 'Critical');
    const hasWarning  = allData.some(r => r['Status'] === 'Warning');
    if (hasCritical) {
      dot.className = 'status-dot warn';
      statusEl.textContent = `${count} records · critical`;
    } else if (hasWarning) {
      dot.className = 'status-dot warn';
      statusEl.textContent = `${count} records · warning`;
    } else {
      dot.className = 'status-dot active';
      statusEl.textContent = `${count} records · ok`;
    }
  }

  if (count > 0 && allData[0]['CO2 (ppm)'] !== undefined) {
    const co2   = allData.map(r => parseFloat(r['CO2 (ppm)'])).filter(n => !isNaN(n));
    const nox   = allData.map(r => parseFloat(r['NOx (ppm)'])).filter(n => !isNaN(n));
    const sites = [...new Set(allData.map(r => r['Site ID']).filter(Boolean))];
    document.getElementById('stat-co2').textContent   = co2.length ? Math.round(co2.reduce((a,b)=>a+b,0)/co2.length) : '—';
    document.getElementById('stat-nox').textContent   = nox.length ? Math.round(nox.reduce((a,b)=>a+b,0)/nox.length) : '—';
    document.getElementById('stat-sites').textContent = sites.length || '—';
  }
}

// ── Data table ─────────────────────────────────────────────────────────────
function getHeaders() {
  return allData.length ? Object.keys(allData[0]) : [];
}

function renderTable() {
  const headers = getHeaders();
  const search  = document.getElementById('searchInput').value.toLowerCase();
  const statusF = document.getElementById('statusFilter').value;

  const rows = allData.filter(row => {
    const matchSearch = !search || Object.values(row).some(v => String(v).toLowerCase().includes(search));
    const matchStatus = !statusF || row['Status'] === statusF;
    return matchSearch && matchStatus;
  });

  const head = document.getElementById('dataHead');
  const body = document.getElementById('dataBody');

  if (!headers.length) {
    head.innerHTML = '';
    body.innerHTML = `
      <tr><td colspan="12">
        <div class="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
          <p>No data loaded</p>
          <small>Go to the Import tab to load a CSV or Excel file</small>
        </div>
      </td></tr>`;
    return;
  }

  head.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '<th></th></tr>';
  body.innerHTML = '';

  rows.forEach((row, ri) => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      if (h === 'Status') {
        const cls = row[h] === 'Critical' ? 'status-critical'
                  : row[h] === 'Warning'  ? 'status-warning'
                  : 'status-normal';
        td.innerHTML = `<span class="status-badge ${cls}">${row[h] || ''}</span>`;
      } else {
        td.textContent = row[h] !== undefined ? row[h] : '';
        td.className = 'editable';
        td.contentEditable = true;
        td.addEventListener('blur', () => { allData[ri][h] = td.textContent; updateSidebar(); });
      }
      tr.appendChild(td);
    });
    const del = document.createElement('td');
    del.innerHTML = `<button class="btn-del" onclick="deleteRow(${ri})">Remove</button>`;
    tr.appendChild(del);
    body.appendChild(tr);
  });
}

function addRow() {
  if (!allData.length) { showToast('Import data first', '!'); return; }
  const blank = {};
  getHeaders().forEach(h => blank[h] = '');
  blank['Date']   = new Date().toISOString().split('T')[0];
  blank['Status'] = 'Normal';
  allData.push(blank);
  updateSidebar();
  renderTable();
  showToast('New row added');
}

function deleteRow(i) {
  allData.splice(i, 1);
  updateSidebar();
  renderTable();
}

// ── Export panel ───────────────────────────────────────────────────────────
function renderExportPanel() {
  const headers = getHeaders();
  const cl = document.getElementById('colChecklist');
  cl.innerHTML = '';
  headers.forEach(h => {
    const label = document.createElement('label');
    label.className = 'col-item';
    label.innerHTML = `<input type="checkbox" checked> ${h}`;
    cl.appendChild(label);
  });
  updateExportInfo();
}

function updateExportInfo() {
  const count = exportFilter === 'all'
    ? allData.length
    : allData.filter(r => r['Status'] === exportFilter).length;
  document.getElementById('exportInfo').textContent =
    count ? `${count} rows will be exported` : 'No data to export';
}

function selectFmt(fmt) {
  exportFmt = fmt;
  document.querySelectorAll('.format-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('fmt-' + fmt).classList.add('selected');
  document.getElementById('check-csv').style.opacity  = fmt === 'csv'  ? '1' : '0';
  document.getElementById('check-xlsx').style.opacity = fmt === 'xlsx' ? '1' : '0';
}

function setExpFilter(val, el) {
  exportFilter = val;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  updateExportInfo();
}

function doExport() {
  if (!allData.length) { showToast('No data to export', '!'); return; }

  const checkedCols = [...document.querySelectorAll('#colChecklist .col-item input:checked')]
    .map(i => i.parentElement.textContent.trim());

  const rows = exportFilter === 'all'
    ? allData
    : allData.filter(r => r['Status'] === exportFilter);

  const filtered = rows.map(row => {
    const obj = {};
    checkedCols.forEach(h => obj[h] = row[h] !== undefined ? row[h] : '');
    return obj;
  });

  const dateStr = new Date().toISOString().split('T')[0];

  if (exportFmt === 'csv') {
    const lines = [
      checkedCols.join(','),
      ...filtered.map(r => checkedCols.map(h => `"${r[h]}"`).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `emissions_export_${dateStr}.csv`;
    a.click();
  } else {
    const ws = XLSX.utils.json_to_sheet(filtered, { header: checkedCols });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emissions Data');
    XLSX.writeFile(wb, `emissions_export_${dateStr}.xlsx`);
  }

  showToast(`Exported ${filtered.length} rows as .${exportFmt}`);
}
