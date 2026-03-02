import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { analyzeWithGemini, analyzeImageWithGemini } from './gemini';
import './index.css';

const INCIDENT_ICONS = {
  Flood: '🌊', Fire: '🔥', Collapse: '🏚️',
  Earthquake: '⚠️', Medical: '🚑', Other: '📋',
};

const getSeverityClass = (score) => {
  if (score >= 9) return 'severity-critical';
  if (score >= 7) return 'severity-high';
  if (score >= 5) return 'severity-medium';
  return 'severity-low';
};

const getSeverityColor = (score) => {
  if (score >= 9) return '#ef4444';
  if (score >= 7) return '#f97316';
  if (score >= 5) return '#eab308';
  return '#22c55e';
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// ============================================================
// ADMIN LOGIN MODAL
// ============================================================
function AdminLoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));
    if (username === 'admin' && password === 'resq2024') {
      onLogin();
    } else {
      setError('Invalid credentials. Access denied.');
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">🔐</div>
          <h2 className="modal-title">Admin Access</h2>
          <p className="modal-sub">Restricted to authorized personnel only</p>
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {error && (
          <div className="modal-error">⚠️ {error}</div>
        )}

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading || !username || !password}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? <><span className="loading-spinner" />Verifying...</> : '🔓 Login to Command Center'}
        </button>

        <button className="modal-cancel" onClick={onClose}>Cancel</button>

        <p className="modal-hint">Demo: admin / resq2024</p>
      </div>
    </div>
  );
}

function CitizenReportPage({ onNewIncident }) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [aiSource, setAiSource] = useState('');
  const [error, setError] = useState('');
  const [reportCount, setReportCount] = useState(0);

  const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p.replace(/\s/g, ''));

  const handleImageSelect = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // strip data:...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async () => {
    if (!text.trim() && !imageFile) return;
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number for verification.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your location so responders can find you.');
      return;
    }
    if (reportCount >= 3) {
      setError('Rate limit: Maximum 3 reports per hour. This prevents system abuse.');
      return;
    }
    setLoading(true);
    setError('');
    setReportCount(prev => prev + 1);
    const fullText = location ? `[Location: ${location}] [Phone: ${phone}] ${text}` : text;

    try {
      let geminiResult = null;

      if (imageFile) {
        // MULTIMODAL: Image + Text analysis
        setLoadingMsg('📸 Uploading image to Gemini AI...');
        const base64Data = await fileToBase64(imageFile);
        const mimeType = imageFile.type;

        // Try Gemini multimodal first
        geminiResult = await analyzeImageWithGemini(base64Data, mimeType, fullText);

        if (geminiResult) {
          setLoadingMsg('💾 Saving to command center...');
          const incident = await api.reportImage(base64Data, mimeType, fullText);
          setAiSource('gemini');
          setSubmitted({
            ...incident,
            incidentType: geminiResult.incident_type || incident.incidentType,
            severityScore: geminiResult.severity_score || incident.severityScore,
            summary: geminiResult.brief_summary || incident.summary,
            requiredResources: geminiResult.resources_required || incident.requiredResources,
            hoax: geminiResult.is_hoax || false,
          });
          onNewIncident(incident);
        } else {
          setLoadingMsg('⚡ Analyzing with AI engine...');
          const incident = await api.reportImage(base64Data, mimeType, fullText);
          setAiSource('mock');
          setSubmitted(incident);
          onNewIncident(incident);
        }
      } else {
        // TEXT-ONLY analysis
        setLoadingMsg('🤖 Connecting to Gemini AI...');
        geminiResult = await analyzeWithGemini(fullText);

        if (geminiResult) {
          setLoadingMsg('💾 Saving to command center...');
          const incident = await api.reportText(fullText);
          setAiSource('gemini');
          setSubmitted({
            ...incident,
            incidentType: geminiResult.incident_type || incident.incidentType,
            severityScore: geminiResult.severity_score || incident.severityScore,
            summary: geminiResult.brief_summary || incident.summary,
            requiredResources: geminiResult.resources_required || incident.requiredResources,
            hoax: geminiResult.is_hoax || false,
          });
          onNewIncident(incident);
        } else {
          setLoadingMsg('⚡ Analyzing with AI engine...');
          const incident = await api.reportText(fullText);
          setAiSource('mock');
          setSubmitted(incident);
          onNewIncident(incident);
        }
      }
    } catch (e) {
      setError('Failed to submit. Is the backend running on port 8080?');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const reset = () => {
    setSubmitted(null); setAiSource(''); setText(''); setLocation('');
    setImageFile(null); setImagePreview(null); setPhone('');
  };

  if (submitted) {
    const color = getSeverityColor(submitted.severityScore);
    return (
      <div className="citizen-page">
        <div className="citizen-success">
          <div className="citizen-success-icon" style={{ color }}>
            {INCIDENT_ICONS[submitted.incidentType] || '🚨'}
          </div>
          <h2 className="citizen-success-title">Report Received!</h2>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.9rem', borderRadius: '20px', marginBottom: '0.75rem',
            background: aiSource === 'gemini' ? 'rgba(59,130,246,0.1)' : 'rgba(148,163,184,0.1)',
            border: `1px solid ${aiSource === 'gemini' ? 'rgba(59,130,246,0.3)' : 'rgba(148,163,184,0.2)'}`,
            fontSize: '0.78rem', fontWeight: 600,
            color: aiSource === 'gemini' ? '#3b82f6' : '#94a3b8',
          }}>
            {aiSource === 'gemini'
              ? `✨ Powered by Google Gemini AI ${imageFile ? '(Multimodal)' : ''}`
              : '⚡ Powered by AI Engine'}
          </div>

          <p className="citizen-success-sub">
            Our AI has analyzed your report and dispatched the information to emergency teams.
          </p>
          <div className="citizen-result-card">
            <div className="citizen-result-row">
              <span>Incident Type</span>
              <span className={`incident-type-badge type-${submitted.incidentType}`}>{submitted.incidentType}</span>
            </div>
            <div className="citizen-result-row">
              <span>Severity Level</span>
              <span style={{ color, fontWeight: 700 }}>{submitted.severityScore}/10</span>
            </div>
            <div className="citizen-result-row">
              <span>Ticket ID</span>
              <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>#{String(submitted.id).padStart(4, '0')}</span>
            </div>
            <div className="citizen-result-row">
              <span>Status</span>
              <span className={`status-chip ${submitted.status}`}>{submitted.status}</span>
            </div>
            <div className="citizen-result-row">
              <span>AI Verification</span>
              <span style={{
                color: submitted.hoax ? '#ef4444' : '#22c55e',
                fontWeight: 700, fontSize: '0.85rem',
              }}>
                {submitted.hoax ? '⚠️ FLAGGED AS SUSPICIOUS' : '✅ VERIFIED — Genuine Report'}
              </span>
            </div>
          </div>
          <div className="citizen-resources-needed">
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Resources being dispatched:</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {submitted.requiredResources?.map((r, i) => (
                <span key={i} className="resource-tag">🚁 {r}</span>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={reset} style={{ marginTop: '1.5rem' }}>
            + Report Another Incident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="citizen-page">
      <div className="citizen-hero">
        <div className="citizen-hero-icon">🆘</div>
        <h1 className="citizen-hero-title">Report an Emergency</h1>
        <p className="citizen-hero-sub">
          Your report will be instantly analyzed by AI and routed to emergency responders.
        </p>
      </div>

      <div className="citizen-form">
        <div className="form-group">
          <label className="form-label">What type of emergency?</label>
          <div className="quick-type-grid">
            {[
              { type: 'Flood', icon: '🌊' }, { type: 'Fire', icon: '🔥' },
              { type: 'Collapse', icon: '🏚️' }, { type: 'Earthquake', icon: '⚠️' },
              { type: 'Medical', icon: '🚑' }, { type: 'Other', icon: '📋' },
            ].map(({ type, icon }) => (
              <button key={type}
                className={`quick-type-btn ${text.startsWith(type) ? 'selected' : ''}`}
                onClick={() => setText(type + ': ')}>
                <span>{icon}</span><span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📸 IMAGE UPLOAD */}
        <div className="form-group">
          <label className="form-label">📸 Upload Damage Photo <span style={{ color: '#64748b', fontWeight: 400 }}>(optional — AI analyzes images!)</span></label>

          {imagePreview ? (
            <div className="image-preview-wrap">
              <img src={imagePreview} alt="Damage" className="image-preview" />
              <button className="image-remove-btn" onClick={removeImage}>✕ Remove</button>
            </div>
          ) : (
            <label className="image-upload-zone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleImageSelect(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept="image/*" hidden
                onChange={(e) => handleImageSelect(e.target.files[0])} />
              <div className="upload-icon">📷</div>
              <div className="upload-text">Click to upload or drag & drop</div>
              <div className="upload-hint">JPG, PNG up to 5MB — Gemini AI will analyze the damage</div>
            </label>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">📞 Your Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
          <input className="form-input" placeholder="e.g. 9876543210" type="tel" maxLength={10}
            value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            style={{ borderColor: phone && !isValidPhone(phone) ? '#ef4444' : undefined }} />
          {phone && !isValidPhone(phone) && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>Enter valid 10-digit mobile number</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">📍 Your Location <span style={{ color: '#ef4444' }}>*</span></label>
          <input className="form-input" placeholder="e.g. Anna Nagar, Chennai"
            value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">📝 Describe the situation</label>
          <textarea className="form-textarea"
            placeholder="e.g. Building collapsed, 5 people trapped under debris, need urgent help..."
            value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <button className="btn-primary citizen-submit" onClick={handleSubmit} disabled={loading || (!text.trim() && !imageFile) || !isValidPhone(phone) || !location.trim()}>
          {loading
            ? <><span className="loading-spinner" />{loadingMsg || 'Analyzing...'}</>
            : imageFile ? '📸 Analyze Photo & Report' : '🚨 Send Emergency Report'}
        </button>

        <p className="citizen-disclaimer">🔒 Only submit real emergencies. False reports are automatically detected.</p>
      </div>
    </div>
  );
}

// ============================================================
// INCIDENT CARD
// ============================================================
function IncidentCard({ incident, onDispatch, onResolve }) {
  const [loading, setLoading] = useState(false);
  const handle = async (action) => {
    setLoading(true);
    try { await action(incident.id); } finally { setLoading(false); }
  };
  const color = getSeverityColor(incident.severityScore);

  return (
    <div className={`incident-card ${getSeverityClass(incident.severityScore)}`}>
      <div className="incident-header">
        <div className="incident-meta">
          <span className={`incident-type-badge type-${incident.incidentType}`}>
            {INCIDENT_ICONS[incident.incidentType]} {incident.incidentType}
          </span>
          <span className={`status-chip ${incident.status}`}>{incident.status}</span>
          {incident.hoax && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>⚠️ HOAX</span>}
        </div>
        <span className="incident-id">#{String(incident.id).padStart(4, '0')}</span>
      </div>

      <div className="severity-bar-wrap">
        <div className="severity-bar-track">
          <div className="severity-bar-fill" style={{ width: `${incident.severityScore * 10}%`, background: color }} />
        </div>
        <span className="severity-label" style={{ color }}>{incident.severityScore}/10</span>
      </div>

      <div className="incident-summary">{incident.summary}</div>

      {incident.requiredResources?.length > 0 && (
        <div className="incident-resources">
          {incident.requiredResources.map((r, i) => <span key={i} className="resource-tag">🚁 {r}</span>)}
        </div>
      )}

      {incident.reporterText && (
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', fontStyle: 'italic' }}>
          "{incident.reporterText}"
        </div>
      )}

      <div className="incident-footer">
        <span className="incident-time">🕐 {formatTime(incident.timestamp)}</span>
        <div className="action-buttons">
          {incident.status === 'PENDING' && (
            <button className="btn btn-dispatch" onClick={() => handle(onDispatch)} disabled={loading}>🚀 Dispatch</button>
          )}
          {incident.status === 'DISPATCHED' && (
            <button className="btn btn-resolve" onClick={() => handle(onResolve)} disabled={loading}>✅ Resolve</button>
          )}
          {incident.status === 'RESOLVED' && <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>✅ Resolved</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUICK REPORT (Admin Sidebar)
// ============================================================
function QuickReportPanel({ onNewIncident }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const incident = await api.reportText(text);
      setResult(incident); setText(''); onNewIncident(incident);
      setTimeout(() => setResult(null), 5000);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Describe the situation</label>
        <textarea className="form-textarea"
          placeholder="e.g. Flood in Velachery, water 4ft high..."
          value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      </div>
      <button className="btn-primary" onClick={handleSubmit} disabled={loading || !text.trim()}>
        {loading ? <><span className="loading-spinner" />Analyzing...</> : '⚡ Analyze & Log'}
      </button>
      {result && (
        <div className="response-banner success" style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: '0.4rem' }}>
            {INCIDENT_ICONS[result.incidentType]} Logged #{String(result.id).padStart(4, '0')}
          </div>
          <div className="response-field"><span>Type</span><span>{result.incidentType}</span></div>
          <div className="response-field">
            <span>Severity</span>
            <span style={{ color: getSeverityColor(result.severityScore), fontWeight: 700 }}>{result.severityScore}/10</span>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ incidents, onDispatch, onResolve, onNewIncident, onLogout }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? incidents
    : filter === 'HIGH' ? incidents.filter((i) => i.severityScore >= 7)
      : incidents.filter((i) => i.status === filter);

  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === 'PENDING').length,
    critical: incidents.filter((i) => i.severityScore >= 8).length,
    resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
  };

  const criticals = incidents.filter((i) => i.severityScore >= 8 && i.status !== 'RESOLVED');

  return (
    <>
      {criticals.length > 0 && (
        <div className="alert-ticker">
          <span className="ticker-label">⚠ CRITICAL</span>
          <span className="ticker-text">
            {criticals.map((i) => `#${String(i.id).padStart(4, '0')} ${i.incidentType} — Severity ${i.severityScore}/10`).join('  •  ')}
          </span>
        </div>
      )}

      {/* Admin Banner */}
      <div className="admin-banner">
        <span>🔐 Admin Mode — Command Center Active</span>
        <button className="admin-logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <main className="main">
        <div className="stats-row">
          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>📋</div>
            <div className="stat-info"><h3>{stats.total}</h3><p>Total Incidents</p></div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #eab308' }}>
            <div className="stat-icon" style={{ background: 'rgba(234,179,8,0.1)' }}>⏳</div>
            <div className="stat-info"><h3>{stats.pending}</h3><p>Awaiting Dispatch</p></div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>🔴</div>
            <div className="stat-info"><h3>{stats.critical}</h3><p>Critical (8+)</p></div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.1)' }}>✅</div>
            <div className="stat-info"><h3>{stats.resolved}</h3><p>Resolved</p></div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="section-header">
              <div className="section-title">⚡ Active Incidents</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['ALL', 'HIGH', 'PENDING', 'DISPATCHED', 'RESOLVED'].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '0.3rem 0.75rem', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    background: filter === f ? '#3b82f6' : 'rgba(30,41,59,0.8)',
                    color: filter === f ? 'white' : '#94a3b8', transition: 'all 0.15s',
                  }}>{f}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛡️</div>
                <div>No incidents found</div>
              </div>
            ) : (
              <div className="incidents-list">
                {filtered.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident}
                    onDispatch={onDispatch} onResolve={onResolve} />
                ))}
              </div>
            )}
          </div>

          <div className="report-panel">
            <div className="section-header">
              <div className="section-title">🚨 Quick Report</div>
            </div>
            <QuickReportPanel onNewIncident={onNewIncident} />
          </div>
        </div>
      </main>
    </>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.getAllIncidents();
      setIncidents(data.sort((a, b) => b.severityScore - a.severityScore));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleNewIncident = (incident) =>
    setIncidents((prev) => [incident, ...prev].sort((a, b) => b.severityScore - a.severityScore));

  const handleDispatch = async (id) => {
    const updated = await api.dispatch(id);
    setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleResolve = async (id) => {
    const updated = await api.resolve(id);
    setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleLogin = () => { setIsAdmin(true); setShowLoginModal(false); };
  const handleLogout = () => setIsAdmin(false);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">🛡️</div>
          <div>
            <div className="logo-text">ResQ-AI</div>
            <div className="logo-subtitle">Crisis Nerve Center</div>
          </div>
        </div>

        {/* Only show nav when in admin mode */}
        {isAdmin && (
          <div className="nav-tabs">
            <button className="nav-tab active">📊 Command Center</button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="live-badge">
            <div className="live-dot" />
            LIVE · {incidents.length} incidents
          </div>

          {/* Admin button - always visible in top right */}
          {!isAdmin && (
            <button className="admin-access-btn" onClick={() => setShowLoginModal(true)}>
              🔐 Admin
            </button>
          )}
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <AdminLoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
      )}

      {/* PAGE CONTENT */}
      {isAdmin ? (
        <AdminDashboard
          incidents={incidents}
          onDispatch={handleDispatch}
          onResolve={handleResolve}
          onNewIncident={handleNewIncident}
          onLogout={handleLogout}
        />
      ) : (
        <CitizenReportPage onNewIncident={handleNewIncident} />
      )}
    </div>
  );
}
