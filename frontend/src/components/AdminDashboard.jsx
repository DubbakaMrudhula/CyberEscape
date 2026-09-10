import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cases as defaultCases } from '../data/cases';

export default function AdminDashboard({ onBackToGame }) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'runs', 'scenarios', 'settings', 'logs'
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Overview Data
  const [overview, setOverview] = useState(null);

  // Users Data
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'user' });

  // Runs Data
  const [runs, setRuns] = useState([]);
  const [runSearch, setRunSearch] = useState('');
  const [runRankFilter, setRunRankFilter] = useState('');

  // Scenarios CMS Data
  const [customScenarios, setCustomScenarios] = useState([]);
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [newScenario, setNewScenario] = useState({
    caseId: 'phishing',
    type: 'email',
    title: '',
    difficulty: 'BONUS CHALLENGE',
    subject: '',
    senderName: '',
    senderEmail: '',
    bodyText: '',
    correctAction: 'block',
    points: 150,
    signal: '',
    companionCorrect: 'Great job! You spotted the trick.',
    companionWrong: 'Watch out! That was a trick.'
  });

  // Game Settings
  const [settings, setSettings] = useState({
    startingLives: 3,
    streakBonus: 50,
    passScoreThreshold: 750,
    lockdownMode: false
  });
  const [settingsStatus, setSettingsStatus] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Notifications
  const [notice, setNotice] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  // Fetch all initial admin data
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    async function loadAdminData() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Overview
        const resOverview = await fetch('/api/admin/overview', { headers });
        if (resOverview.ok) {
          const data = await resOverview.json();
          if (isMounted) {
            setOverview(data);
            if (data.analytics?.gameSettings) {
              setSettings(data.analytics.gameSettings);
            }
          }
        }

        // 2. Users
        const resUsers = await fetch('/api/admin/users', { headers });
        if (resUsers.ok) {
          const data = await resUsers.json();
          if (isMounted) setUsers(data.users || []);
        }

        // 3. Runs
        const resRuns = await fetch('/api/admin/runs', { headers });
        if (resRuns.ok) {
          const data = await resRuns.json();
          if (isMounted) setRuns(data.runs || []);
        }

        // 4. Scenarios
        const resScenarios = await fetch('/api/admin/scenarios', { headers });
        if (resScenarios.ok) {
          const data = await resScenarios.json();
          if (isMounted) setCustomScenarios(data.scenarios || []);
        }

        // 5. Audit Logs
        const resLogs = await fetch('/api/admin/audit-logs', { headers });
        if (resLogs.ok) {
          const data = await resLogs.json();
          if (isMounted) setAuditLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
        if (isMounted) showNotification('Could not connect to admin endpoint. Check backend status.', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminData();
    return () => { isMounted = false; };
  }, [token, refreshKey]);

  // User Actions
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showNotification(`User role updated to ${newRole.toUpperCase()}`);
        setRefreshKey(k => k + 1);
      } else {
        showNotification('Failed to change role', 'error');
      }
    } catch {
      showNotification('Network error changing role', 'error');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Permanently remove user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification(`User "${username}" deleted`);
        setRefreshKey(k => k + 1);
      } else {
        showNotification('Failed to delete user', 'error');
      }
    } catch {
      showNotification('Network error deleting user', 'error');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserData)
      });
      if (res.ok) {
        showNotification(`Player "${newUserData.username}" registered successfully`);
        setShowAddUserModal(false);
        setNewUserData({ username: '', email: '', password: '', role: 'user' });
        setRefreshKey(k => k + 1);
      } else {
        const err = await res.json();
        showNotification(err.message || 'Failed to create user', 'error');
      }
    } catch {
      showNotification('Network error adding user', 'error');
    }
  };

  // Run Actions
  const handleDeleteRun = async (runId) => {
    if (!window.confirm('Delete this game record from high scores?')) return;
    try {
      const res = await fetch(`/api/admin/runs/${runId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Game record deleted');
        setRefreshKey(k => k + 1);
      }
    } catch {
      showNotification('Could not delete run', 'error');
    }
  };

  const exportRunsToCSV = () => {
    if (!runs.length) {
      showNotification('No records to export', 'error');
      return;
    }
    const headers = ['Player', 'Score', 'Rank', 'Won', 'Lives Left', 'Date'];
    const rows = runs.map(r => [
      `"${r.alias || 'PLAYER'}"`,
      r.score || 0,
      `"${r.rankBadge || 'C'}"`,
      r.cleared ? 'TRUE' : 'FALSE',
      r.livesRemaining || 0,
      `"${new Date(r.createdAt).toISOString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `escape_room_scores_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Scores exported to CSV');
  };

  // Scenario Actions
  const handleAddScenarioSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        caseId: newScenario.caseId,
        type: newScenario.type,
        difficulty: newScenario.difficulty,
        title: newScenario.title || newScenario.subject || 'Custom Question',
        correctAction: newScenario.correctAction,
        points: Number(newScenario.points) || 100,
        signal: newScenario.signal,
        content: {
          subject: newScenario.subject,
          senderName: newScenario.senderName,
          senderEmail: newScenario.senderEmail,
          bodyText: newScenario.bodyText
        },
        companionReaction: {
          correct: newScenario.companionCorrect,
          wrong: newScenario.companionWrong
        }
      };

      const res = await fetch('/api/admin/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification('New custom question added!');
        setShowAddScenarioModal(false);
        setRefreshKey(k => k + 1);
      } else {
        showNotification('Failed to create question', 'error');
      }
    } catch {
      showNotification('Network error creating question', 'error');
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    if (!window.confirm('Delete this custom question?')) return;
    try {
      const res = await fetch(`/api/admin/scenarios/${scenarioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Question removed');
        setRefreshKey(k => k + 1);
      }
    } catch {
      showNotification('Failed to delete question', 'error');
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsStatus('Saving...');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSettingsStatus('✓ Settings saved!');
        showNotification('Game settings updated successfully');
        setTimeout(() => setSettingsStatus(''), 3000);
      } else {
        setSettingsStatus('Save failed');
      }
    } catch {
      setSettingsStatus('Error saving settings');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredRuns = runs.filter(r => {
    const matchQuery = !runSearch || (r.alias && r.alias.toLowerCase().includes(runSearch.toLowerCase()));
    const matchRank = !runRankFilter || (r.rankBadge && r.rankBadge.toUpperCase() === runRankFilter.toUpperCase());
    return matchQuery && matchRank;
  });

  const vectorStats = overview?.analytics?.vectorBreakdown || { phishing: 0, passwords: 0, qr: 0, scams: 0 };
  const totalMistakes = Object.values(vectorStats).reduce((a, b) => a + b, 0) || 1;

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-console-wrapper">
        <div className="admin-panel-card" style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>Access Restricted</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
            You need to be logged in with an administrator account to view this page.
          </p>
          <button className="primary-action-btn" onClick={onBackToGame}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-console-wrapper">
      {/* Toast Notice */}
      {notice && (
        <div className={`admin-toast-notice ${notice.type}`}>
          <span>{notice.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-brand-cluster">
          <span className="admin-shield-icon">🛡️</span>
          <div>
            <div className="admin-kicker">CONTROL PANEL // ESCAPE ROOM</div>
            <h1 className="admin-title">Admin Management Panel</h1>
          </div>
        </div>

        <div className="admin-header-actions">
          <div className="admin-system-status">
            <span className="live-pulse-dot"></span>
            <span>SYSTEM: <strong>ACTIVE</strong></span>
          </div>

          <button className="admin-btn secondary" onClick={() => setRefreshKey(k => k + 1)} title="Refresh data">
            🔄 Refresh
          </button>

          <button className="admin-btn secondary" onClick={exportRunsToCSV} title="Export CSV report">
            📥 Export CSV
          </button>

          <button className="admin-btn primary" onClick={onBackToGame}>
            🏠 Exit to Home
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <nav className="admin-nav-tabs">
        <button 
          className={`admin-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview & Stats
        </button>
        <button 
          className={`admin-tab-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Players ({users.length})
        </button>
        <button 
          className={`admin-tab-item ${activeTab === 'runs' ? 'active' : ''}`}
          onClick={() => setActiveTab('runs')}
        >
          📋 Game History ({runs.length})
        </button>
        <button 
          className={`admin-tab-item ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          🧩 Questions & Challenges ({defaultCases.reduce((acc, c) => acc + c.scenarios.length, 0) + customScenarios.length})
        </button>
        <button 
          className={`admin-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Game Settings
        </button>
        <button 
          className={`admin-tab-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📜 Activity Logs
        </button>
      </nav>

      {/* Main Admin Content Area */}
      <main className="admin-body">
        {loading && !overview ? (
          <div className="admin-loading-state">
            <span className="spinner-ring"></span>
            <p>Loading stats and game data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW & STATS */}
            {activeTab === 'overview' && (
              <div className="admin-tab-content">
                {/* Metric KPI Cards */}
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">REGISTERED PLAYERS</span>
                      <span className="kpi-icon">👥</span>
                    </div>
                    <div className="kpi-value">{overview?.analytics?.totalUsers || users.length || 0}</div>
                    <div className="kpi-footnote">Active player accounts</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">GAMES PLAYED</span>
                      <span className="kpi-icon">🎮</span>
                    </div>
                    <div className="kpi-value">{overview?.analytics?.totalRuns || runs.length || 0}</div>
                    <div className="kpi-footnote">Total completed sessions</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">AVERAGE SCORE</span>
                      <span className="kpi-icon">📈</span>
                    </div>
                    <div className="kpi-value">{overview?.analytics?.avgScore || 0} <small>PTS</small></div>
                    <div className="kpi-footnote">Across all player games</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-label">WIN RATE</span>
                      <span className="kpi-icon">🏆</span>
                    </div>
                    <div className="kpi-value">{overview?.analytics?.passRate || 0}%</div>
                    <div className="kpi-footnote">Players who cleared the vault</div>
                  </div>
                </div>

                {/* Breakdown & Recent Activity */}
                <div className="overview-two-col">
                  {/* Left: Mistake distribution */}
                  <div className="admin-panel-card">
                    <div className="panel-card-header">
                      <div>
                        <h3>Mistakes by Category</h3>
                        <p>Which challenges players get tricked by most frequently</p>
                      </div>
                      <span className="threat-status-tag">LIVE STATS</span>
                    </div>

                    <div className="vector-breakdown-list">
                      <div className="vector-row">
                        <div className="vector-info">
                          <span className="vector-badge coral">✉ Fake Emails</span>
                          <span className="vector-count">{vectorStats.phishing} mistakes ({Math.round((vectorStats.phishing / totalMistakes) * 100)}%)</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-bar coral" 
                            style={{ width: `${Math.min(100, Math.round((vectorStats.phishing / totalMistakes) * 100))}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="vector-row">
                        <div className="vector-info">
                          <span className="vector-badge lime">✦ Weak Passwords</span>
                          <span className="vector-count">{vectorStats.passwords} mistakes ({Math.round((vectorStats.passwords / totalMistakes) * 100)}%)</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-bar lime" 
                            style={{ width: `${Math.min(100, Math.round((vectorStats.passwords / totalMistakes) * 100))}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="vector-row">
                        <div className="vector-info">
                          <span className="vector-badge orange">▦ Fake QR Codes</span>
                          <span className="vector-count">{vectorStats.qr} mistakes ({Math.round((vectorStats.qr / totalMistakes) * 100)}%)</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-bar orange" 
                            style={{ width: `${Math.min(100, Math.round((vectorStats.qr / totalMistakes) * 100))}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="vector-row">
                        <div className="vector-info">
                          <span className="vector-badge blue">◌ Scam Text Messages</span>
                          <span className="vector-count">{vectorStats.scams} mistakes ({Math.round((vectorStats.scams / totalMistakes) * 100)}%)</span>
                        </div>
                        <div className="progress-track">
                          <div 
                            className="progress-bar blue" 
                            style={{ width: `${Math.min(100, Math.round((vectorStats.scams / totalMistakes) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="vector-callout-insight">
                      <b>💡 Safety Tip:</b> Players stumble most often on 
                      <strong> {vectorStats.phishing >= vectorStats.passwords ? 'Fake Emails' : 'Weak Passwords'}</strong>. 
                      Help them practice checking sender addresses and link previews!
                    </div>
                  </div>

                  {/* Right: Recent Games */}
                  <div className="admin-panel-card">
                    <div className="panel-card-header">
                      <div>
                        <h3>Recent Games</h3>
                        <p>Latest completed games and scores</p>
                      </div>
                      <button className="text-link-btn" onClick={() => setActiveTab('runs')}>View All →</button>
                    </div>

                    <div className="recent-runs-stream">
                      {overview?.recentRuns?.length ? (
                        overview.recentRuns.map((r, i) => (
                          <div key={i} className="stream-run-item">
                            <div className="stream-avatar">
                              {r.alias ? r.alias.slice(0, 2).toUpperCase() : 'PL'}
                            </div>
                            <div className="stream-details">
                              <div className="stream-alias-row">
                                <strong>{r.alias}</strong>
                                <span className={`rank-pill ${r.rankBadge || 'C'}`}>RANK {r.rankBadge || 'C'}</span>
                              </div>
                              <small className="stream-meta">
                                Score: <b>{r.score}</b> · Lives Left: {r.livesRemaining} · {new Date(r.createdAt).toLocaleTimeString()}
                              </small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state-notice">
                          No games recorded yet. Play a game to see stats here!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLAYERS DIRECTORY */}
            {activeTab === 'users' && (
              <div className="admin-tab-content">
                <div className="table-controls-bar">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search players by name or email..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>

                  <div className="table-actions">
                    <button className="admin-btn primary" onClick={() => setShowAddUserModal(true)}>
                      + Add New Player / Admin
                    </button>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>PLAYER NAME</th>
                        <th>EMAIL</th>
                        <th>ACCOUNT ROLE</th>
                        <th>HIGH SCORE</th>
                        <th>GAMES PLAYED</th>
                        <th>JOIN DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id || u._id}>
                          <td>
                            <div className="user-cell">
                              <span className="user-avatar-badge">{u.username.slice(0, 2).toUpperCase()}</span>
                              <strong>{u.username}</strong>
                            </div>
                          </td>
                          <td className="mono-cell">{u.email}</td>
                          <td>
                            <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                              {u.role === 'admin' ? '🛡️ ADMINISTRATOR' : '👤 PLAYER'}
                            </span>
                          </td>
                          <td><b>{u.bestScore || 0} pts</b></td>
                          <td>{u.gamesPlayed || 0}</td>
                          <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons-group">
                              <button 
                                className="action-pill-btn secondary"
                                onClick={() => handleToggleUserRole(u.id || u._id, u.role)}
                                title="Change role between Admin and Player"
                              >
                                {u.role === 'admin' ? 'Make Player' : 'Make Admin'}
                              </button>
                              <button 
                                className="action-pill-btn danger"
                                onClick={() => handleDeleteUser(u.id || u._id, u.username)}
                                title="Delete user account"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="table-empty-cell">
                            No players found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: GAME HISTORY */}
            {activeTab === 'runs' && (
              <div className="admin-tab-content">
                <div className="table-controls-bar">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Filter by player name..." 
                      value={runSearch}
                      onChange={(e) => setRunSearch(e.target.value)}
                    />
                  </div>

                  <div className="filter-select-wrapper">
                    <label>Rank:</label>
                    <select value={runRankFilter} onChange={(e) => setRunRankFilter(e.target.value)}>
                      <option value="">All Ranks</option>
                      <option value="S">Rank S</option>
                      <option value="A">Rank A</option>
                      <option value="B">Rank B</option>
                      <option value="C">Rank C</option>
                      <option value="F">Rank F</option>
                    </select>
                  </div>

                  <div className="table-actions">
                    <button className="admin-btn secondary" onClick={exportRunsToCSV}>
                      📥 Export CSV
                    </button>
                  </div>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>PLAYER</th>
                        <th>FINAL SCORE</th>
                        <th>RANK</th>
                        <th>OUTCOME</th>
                        <th>LIVES LEFT</th>
                        <th>MISTAKES</th>
                        <th>DATE & TIME</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRuns.map((r, i) => (
                        <tr key={r._id || r.id || i}>
                          <td><strong>{r.alias || 'PLAYER'}</strong></td>
                          <td><span className="score-badge">{r.score}</span></td>
                          <td>
                            <span className={`rank-pill ${r.rankBadge || 'C'}`}>
                              RANK {r.rankBadge || 'C'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${r.cleared ? 'cleared' : 'breached'}`}>
                              {r.cleared ? 'WON' : 'GAME OVER'}
                            </span>
                          </td>
                          <td>{'♥'.repeat(Math.max(0, r.livesRemaining || 0))}</td>
                          <td>
                            <div className="mistakes-tag-cluster">
                              {r.mistakes && Object.entries(r.mistakes instanceof Map ? Object.fromEntries(r.mistakes) : r.mistakes).map(([k, v]) => (
                                Number(v) > 0 ? (
                                  <span key={k} className="mini-mistake-pill">{k}: {v}</span>
                                ) : null
                              ))}
                            </div>
                          </td>
                          <td>{new Date(r.createdAt || Date.now()).toLocaleString()}</td>
                          <td>
                            <button 
                              className="action-pill-btn danger"
                              onClick={() => handleDeleteRun(r._id || r.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRuns.length === 0 && (
                        <tr>
                          <td colSpan="8" className="table-empty-cell">
                            No game records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: QUESTIONS & CHALLENGES */}
            {activeTab === 'scenarios' && (
              <div className="admin-tab-content">
                <div className="table-controls-bar">
                  <div>
                    <h3>Questions & Challenges</h3>
                    <p className="subtext">Review the built-in questions or add your own custom challenges.</p>
                  </div>
                  <button className="admin-btn primary" onClick={() => setShowAddScenarioModal(true)}>
                    + Add Custom Question
                  </button>
                </div>

                {/* Default Cases List */}
                <div className="cases-cms-grid">
                  {defaultCases.map((c) => (
                    <div key={c.id} className="case-cms-card">
                      <div className="case-cms-header">
                        <div className="case-cms-tag">{c.caseNumber} · {c.codename}</div>
                        <h4>{c.title}</h4>
                        <p className="case-cms-story">{c.story}</p>
                      </div>

                      <div className="scenarios-nested-list">
                        <h5>QUESTIONS ({c.scenarios.length}):</h5>
                        {c.scenarios.map((s) => (
                          <div key={s.id} className="scenario-item-row">
                            <div className="scenario-item-main">
                              <span className="scenario-diff-pill">{s.difficulty}</span>
                              <strong className="scenario-item-title">{s.subject || s.label || s.title || s.type.toUpperCase()}</strong>
                              <small className="scenario-item-signal">Clue: {s.signal}</small>
                            </div>
                            <div className="scenario-item-right">
                              <span className={`action-rule-badge ${s.correctAction}`}>
                                CORRECT: {s.correctAction === 'block' ? 'FAKE' : 'SAFE'}
                              </span>
                              <span className="points-pill">+{s.points} PTS</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Deployed Scenarios */}
                {customScenarios.length > 0 && (
                  <div className="custom-scenarios-section">
                    <h4 className="section-title">CUSTOM QUESTIONS ({customScenarios.length})</h4>
                    <div className="custom-scenarios-list">
                      {customScenarios.map((cs) => (
                        <div key={cs.scenarioId} className="custom-scenario-card">
                          <div className="custom-scenario-header">
                            <div>
                              <span className="vector-badge coral">{cs.caseId.toUpperCase()}</span>
                              <h4>{cs.title}</h4>
                              <small>{cs.difficulty}</small>
                            </div>
                            <button 
                              className="action-pill-btn danger" 
                              onClick={() => handleDeleteScenario(cs.scenarioId)}
                            >
                              Delete Question
                            </button>
                          </div>
                          <p className="custom-scenario-signal"><b>Clue:</b> {cs.signal}</p>
                          <div className="custom-scenario-meta">
                            <span>Type: <b>{cs.type}</b></span>
                            <span>Correct Choice: <b>{cs.correctAction === 'block' ? 'FAKE' : 'SAFE'}</b></span>
                            <span>Points: <b>+{cs.points}</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: GAME SETTINGS */}
            {activeTab === 'settings' && (
              <div className="admin-tab-content">
                <div className="admin-panel-card max-w-700">
                  <div className="panel-card-header">
                    <div>
                      <h3>Game Rules & Difficulty</h3>
                      <p>Customize starting lives, point bonuses, and game modes</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="settings-form">
                    <div className="setting-row">
                      <div className="setting-info">
                        <label>Starting Lives (per game)</label>
                        <small>How many chances players have before the game ends.</small>
                      </div>
                      <div className="setting-control">
                        <select 
                          value={settings.startingLives} 
                          onChange={(e) => setSettings({ ...settings, startingLives: Number(e.target.value) })}
                        >
                          <option value={1}>1 Life (Hard Mode)</option>
                          <option value={2}>2 Lives (Challenging)</option>
                          <option value={3}>3 Lives (Standard Default)</option>
                          <option value={5}>5 Lives (Easy / Practice)</option>
                        </select>
                      </div>
                    </div>

                    <div className="setting-row">
                      <div className="setting-info">
                        <label>Streak Bonus Points</label>
                        <small>Bonus points given when players get 3 or more answers right in a row.</small>
                      </div>
                      <div className="setting-control">
                        <input 
                          type="number" 
                          min="0" 
                          max="200" 
                          step="10"
                          value={settings.streakBonus}
                          onChange={(e) => setSettings({ ...settings, streakBonus: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="setting-row">
                      <div className="setting-info">
                        <label>Score Needed to Win</label>
                        <small>Minimum score required to earn Rank B or above.</small>
                      </div>
                      <div className="setting-control">
                        <input 
                          type="number" 
                          min="300" 
                          max="2000" 
                          step="50"
                          value={settings.passScoreThreshold}
                          onChange={(e) => setSettings({ ...settings, passScoreThreshold: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="setting-row">
                      <div className="setting-info">
                        <label>Maintenance Mode</label>
                        <small>Temporarily pause game access for updates.</small>
                      </div>
                      <div className="setting-control">
                        <label className="switch-label">
                          <input 
                            type="checkbox" 
                            checked={settings.lockdownMode}
                            onChange={(e) => setSettings({ ...settings, lockdownMode: e.target.checked })}
                          />
                          <span>{settings.lockdownMode ? '🔒 PAUSED' : '🔓 OPEN TO PLAY'}</span>
                        </label>
                      </div>
                    </div>

                    <div className="settings-submit-row">
                      <button type="submit" className="admin-btn primary large">
                        Save Game Settings
                      </button>
                      {settingsStatus && <span className="settings-status-note">{settingsStatus}</span>}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 6: ACTIVITY LOGS */}
            {activeTab === 'logs' && (
              <div className="admin-tab-content">
                <div className="table-controls-bar">
                  <div>
                    <h3>Activity Log</h3>
                    <p className="subtext">Recent logins, games played, and changes made in the admin panel.</p>
                  </div>
                  <button className="admin-btn secondary" onClick={() => setRefreshKey(k => k + 1)}>
                    🔄 Refresh Log
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>ACTION</th>
                        <th>USER</th>
                        <th>DETAILS</th>
                        <th>DATE & TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, i) => (
                        <tr key={i}>
                          <td>
                            <span className="log-action-pill">{log.action}</span>
                          </td>
                          <td><strong>{log.actor || 'SYSTEM'}</strong></td>
                          <td className="mono-cell">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                          </td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="table-empty-cell">
                            No logs yet. Activity will show here automatically.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="admin-modal-form">
              <div className="form-group">
                <label>Player Username</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Alex" 
                  value={newUserData.username}
                  onChange={e => setNewUserData({ ...newUserData, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="user@example.com" 
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Minimum 6 characters" 
                  value={newUserData.password}
                  onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={newUserData.role}
                  onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                >
                  <option value="user">Regular Player</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="modal-actions-row">
                <button type="button" className="admin-btn secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SCENARIO */}
      {showAddScenarioModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddScenarioModal(false)}>
          <div className="admin-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Custom Question</h3>
              <button className="close-btn" onClick={() => setShowAddScenarioModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddScenarioSubmit} className="admin-modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newScenario.caseId}
                    onChange={e => setNewScenario({ ...newScenario, caseId: e.target.value })}
                  >
                    <option value="phishing">Challenge 1 · Fake Emails</option>
                    <option value="passwords">Challenge 2 · Weak Passwords</option>
                    <option value="qr">Challenge 3 · Fake QR Codes</option>
                    <option value="scams">Challenge 4 · Scam Text Messages</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Format</label>
                  <select 
                    value={newScenario.type}
                    onChange={e => setNewScenario({ ...newScenario, type: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="password">Password</option>
                    <option value="qr">QR Code</option>
                    <option value="sms">Text Message</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Question Title or Subject</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. URGENT: Fake Bank Notification" 
                  value={newScenario.subject}
                  onChange={e => setNewScenario({ ...newScenario, subject: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Sender Display Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bank Customer Care" 
                    value={newScenario.senderName}
                    onChange={e => setNewScenario({ ...newScenario, senderName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sender Email or Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. alert@fake-bank.net" 
                    value={newScenario.senderEmail}
                    onChange={e => setNewScenario({ ...newScenario, senderEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea 
                  rows="3" 
                  placeholder="The message text that the player will read..."
                  value={newScenario.bodyText}
                  onChange={e => setNewScenario({ ...newScenario, bodyText: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select 
                    value={newScenario.correctAction}
                    onChange={e => setNewScenario({ ...newScenario, correctAction: e.target.value })}
                  >
                    <option value="block">FAKE / SCAM (Player should BLOCK)</option>
                    <option value="trust">SAFE / REAL (Player should TRUST)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Points</label>
                  <input 
                    type="number" 
                    min="50" 
                    max="500" 
                    value={newScenario.points}
                    onChange={e => setNewScenario({ ...newScenario, points: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Explanation Clue (Shown after answer)</label>
                <input 
                  type="text" 
                  placeholder="What should the player notice about this message?" 
                  value={newScenario.signal}
                  onChange={e => setNewScenario({ ...newScenario, signal: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="admin-btn secondary" onClick={() => setShowAddScenarioModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
