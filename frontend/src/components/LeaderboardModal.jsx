import React, { useState, useEffect } from 'react';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/runs')
      .then(res => res.json())
      .then(data => {
        setRuns(data.runs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card wide">
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="brand-mark-small">🏆</span>
            <h3>GLOBAL HIGH SCORES</h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="leaderboard-container">
          {loading ? (
            <div className="loading-state">LOADING HIGH SCORES...</div>
          ) : runs.length === 0 ? (
            <div className="empty-state">No scores recorded yet. Play the game to be the first!</div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PLAYER</th>
                  <th>SCORE</th>
                  <th>LIVES</th>
                  <th>GRADE</th>
                  <th>OUTCOME</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'top-rank' : ''}>
                    <td>
                      <span className="rank-num">#{String(i + 1).padStart(2, '0')}</span>
                    </td>
                    <td>
                      <strong className="agent-name">{r.alias}</strong>
                    </td>
                    <td>
                      <span className="score-badge">{r.score}</span>
                    </td>
                    <td>
                      <span className="lives-mini">{'♥'.repeat(r.livesRemaining || 0)}</span>
                    </td>
                    <td>
                      <span className="grade-badge">{r.rankBadge || 'A'}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${r.cleared ? 'cleared' : 'breached'}`}>
                        {r.cleared ? 'COMPLETED' : 'GAME OVER'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary-action-btn secondary" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
