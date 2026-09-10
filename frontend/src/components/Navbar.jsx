import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export default function Navbar({ lives, score, onHome, onOpenAuth, onOpenLeaderboard, onOpenAdmin, onOpenBlueprint, currentScreen }) {
  const { user, logout, isAdmin } = useAuth();
  const [audioActive, setAudioActive] = useState(true);

  const toggleSound = () => {
    const state = sounds.toggle();
    setAudioActive(state);
    if (state) sounds.playClick();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="brand" onClick={onHome}>
          <span className="brand-mark">VB</span>
          <span className="brand-text">
            <span className="brand-lead">VAULT</span>
            <b className="brand-accent">BREAKER</b>
          </span>
        </button>
        <span className="brand-version-tag">SAFETY ESCAPE ROOM</span>
      </div>

      <div className="status-bar">
        {/* Blueprint / How to Play Button */}
        <button 
          className={`icon-tool-btn ${currentScreen === 'blueprint' ? 'active' : ''}`}
          onClick={onOpenBlueprint}
          title="Game Blueprint & How to Play Guide"
        >
          📖 HOW TO PLAY
        </button>

        {/* Admin Panel button is ONLY displayed if an admin account is logged in */}
        {isAdmin && (
          <button 
            className={`admin-nav-trigger ${currentScreen === 'admin' ? 'active' : ''}`}
            onClick={onOpenAdmin}
            title="Open Admin Management Panel"
          >
            <span className="admin-pulse-dot"></span>
            <span>🛡️ ADMIN PANEL</span>
          </button>
        )}

        {/* Global Leaderboard Button */}
        <button className="icon-tool-btn" onClick={onOpenLeaderboard}>
          🏆 HIGH SCORES
        </button>

        {/* Sound toggle */}
        <button 
          className="icon-tool-btn" 
          onClick={toggleSound} 
          title={audioActive ? 'Mute Sound' : 'Enable Sound'}
        >
          {audioActive ? '🔊 SOUND ON' : '🔇 MUTED'}
        </button>

        {/* Lives Counter (Only visible in game) */}
        {currentScreen === 'game' && (
          <div className="stat integrity-stat">
            <span className="stat-label">LIVES:</span>
            <span className="hearts">
              {'♥'.repeat(Math.max(0, lives))}
              <i>{'♥'.repeat(Math.max(0, 3 - lives))}</i>
            </span>
          </div>
        )}

        {/* Live Score */}
        {currentScreen === 'game' && (
          <div className="stat score-stat">
            <span className="stat-label">SCORE:</span>
            <strong>{String(score).padStart(4, '0')}</strong>
          </div>
        )}

        {/* Auth / Account status */}
        <div className="auth-status-container">
          {user ? (
            <div className="user-profile-badge">
              <span className={`user-dot ${isAdmin ? 'admin-dot' : ''}`}></span>
              <span className="user-name">{user.username} {isAdmin ? '(ADMIN)' : ''}</span>
              <button className="logout-btn" onClick={logout} title="Sign Out">
                ✕
              </button>
            </div>
          ) : (
            <button className="login-pill-btn" onClick={onOpenAuth}>
              🔑 LOG IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
