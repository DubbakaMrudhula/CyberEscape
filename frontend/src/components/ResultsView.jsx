import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';
import { API_BASE } from '../config';

export default function ResultsView({ score, lives, mistakes, challenges, onRestart, onOpenAuth }) {
  const { user } = useAuth();
  const [alias, setAlias] = useState(user ? user.username : '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [saveError, setSaveError] = useState('');

  const cleared = lives > 0;
  const totalMistakes = Object.values(mistakes).reduce((sum, v) => sum + v, 0);

  // Grade calculation
  const grade = score >= 1350 ? 'S' : score >= 1100 ? 'A' : score >= 800 ? 'B' : score >= 500 ? 'C' : 'F';
  const gradeTitle = 
    grade === 'S' ? 'MASTER CYBER DETECTIVE' :
    grade === 'A' ? 'SHARP INVESTIGATOR' :
    grade === 'B' ? 'SECURITY AWARE' :
    grade === 'C' ? 'NEEDS PRACTICE' : 'EASY TARGET FOR SCAMS';

  // Weakest category
  const sortedCategories = [...challenges].sort((a, b) => mistakes[b.id] - mistakes[a.id]);
  const primaryWeakness = sortedCategories[0];

  const handleSave = async (e) => {
    e.preventDefault();
    if (saved) return;
    const saveName = alias.trim() || (user ? user.username : 'PLAYER');
    setSaving(true);
    setSaveError('');
    sounds.playClick();

    try {
      const res = await fetch(`${API_BASE}/api/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('vb_token')}` } : {})
        },
        body: JSON.stringify({
          alias: saveName,
          score,
          cleared,
          livesRemaining: Math.max(0, lives),
          rankBadge: grade,
          mistakes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error saving score');
      setSaved(true);
      setLeaderboard(data.runs || []);
      sounds.playUnlock();
    } catch (err) {
      setSaveError(err.message || 'Failed to save score.');
      sounds.playMistake();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="results-screen">
      <div className="results-hero">
        <span className={`kicker ${cleared ? 'success' : 'alert'}`}>
          {cleared ? 'ALL LEVELS CLEARED · VAULT OPENED' : 'GAME OVER · YOU RAN OUT OF LIVES'}
        </span>
        <h1>
          {cleared ? (
            <>Vault<br /><em>opened!</em></>
          ) : (
            <>Game<br /><em>over.</em></>
          )}
        </h1>
        <p className="results-summary-text">
          {cleared 
            ? `Fantastic work! You completed all four challenges with ${lives} ${lives === 1 ? 'life' : 'lives'} remaining. You successfully distinguished genuine messages from clever online tricks.`
            : `All lives were used up. Online scammers use subtle tricks to catch people off-guard. Try again and see if you can spot all the traps!`
          }
        </p>

        <div className="badge-card">
          <div className={`badge-rank-box grade-${grade}`}>
            {grade}
          </div>
          <div className="badge-meta">
            <span className="badge-meta-label">YOUR DETECTIVE RANK</span>
            <b className="badge-title">{gradeTitle}</b>
            <small>{cleared ? '100% Challenges Completed' : 'Completed Part of the Challenges'}</small>
          </div>
        </div>

        <div className="action-buttons-stack">
          <button className="primary-action-btn" onClick={onRestart}>
            PLAY AGAIN <span>↻</span>
          </button>
          {!user && (
            <button className="secondary-action-btn" onClick={onOpenAuth}>
              🔑 LOG IN TO SAVE YOUR STATS
            </button>
          )}
        </div>
      </div>

      <div className="results-panel">
        <div className="score-display">
          <div className="score-main-group">
            <span className="stat-label">FINAL SCORE</span>
            <strong>{String(score).padStart(4, '0')}</strong>
          </div>
          <div className="score-sub-group">
            <span>MAX POSSIBLE: 1,400</span>
            <span className="lives-sub">LIVES LEFT: {'♥'.repeat(Math.max(0, lives))}</span>
          </div>
        </div>

        {/* Diagnostic Breakdown */}
        <div className="diagnostic-section">
          <div className="breakdown-header">
            <span>CHALLENGE BREAKDOWN</span>
            <span>MISTAKES: {totalMistakes}</span>
          </div>

          <div className="categories-list">
            {challenges.map(c => {
              const missCount = mistakes[c.id] || 0;
              return (
                <div key={c.id} className="category-row">
                  <div className="category-id-tag">
                    <span className={`cat-icon-badge ${c.color}`}>{c.icon}</span>
                    <span className="cat-name">{c.title}</span>
                  </div>
                  <div className="bar-visual-container">
                    <div 
                      className={`bar-fill ${missCount > 0 ? 'has-misses' : 'clean'}`}
                      style={{ width: `${Math.min(100, (missCount / c.scenarios.length) * 100)}%` }}
                    />
                  </div>
                  <div className="miss-count-tag">
                    {missCount === 0 ? (
                      <span className="clean-label">PERFECT</span>
                    ) : (
                      <span className="error-label">{missCount} MISSED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="coaching-takeaway">
            <div className="takeaway-icon">💡</div>
            <div className="takeaway-text">
              <b>TIP TO REMEMBER:</b>{' '}
              {mistakes[primaryWeakness.id] > 0 ? (
                <span>
                  Keep a close eye on <strong>{primaryWeakness.title}</strong>. Remember that scammers rely on rush tactics, lookalike spellings, and urgent threats to trick people.
                </span>
              ) : (
                <span>Incredible job across all challenges! You spotted every single trick, fake link, and scam message.</span>
              )}
            </div>
          </div>
        </div>

        {/* Save to Leaderboard Form */}
        <div className="leaderboard-submission-card">
          <div className="sub-header">
            <span>SAVE YOUR SCORE TO HIGH SCORES</span>
          </div>

          {saved ? (
            <div className="saved-success-pill">
              ✓ Score successfully saved to the global high scores!
            </div>
          ) : (
            <form onSubmit={handleSave} className="submit-run-form">
              <input 
                type="text"
                placeholder={user ? user.username : "Enter your name or nickname"}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                maxLength={20}
                required
                className="alias-input"
              />
              <button type="submit" disabled={saving} className="save-run-btn">
                {saving ? 'SAVING...' : 'SAVE SCORE ↗'}
              </button>
            </form>
          )}
          {saveError && <div className="save-error-text">⚠️ {saveError}</div>}
        </div>
      </div>
    </section>
  );
}
