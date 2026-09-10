import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    sounds.playClick();

    try {
      if (isLoginTab) {
        await login(email || username, password);
      } else {
        await register(username, email, password);
      }
      sounds.playCorrect();
      onClose();
    } catch (err) {
      sounds.playMistake();
      setError(err.message || 'Error signing in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="brand-mark-small">VB</span>
            <h3>{isLoginTab ? 'PLAYER LOG IN' : 'CREATE AN ACCOUNT'}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginTab && (
            <div className="form-group">
              <label>USERNAME / NICKNAME</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. CyberHero" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>{isLoginTab ? 'USERNAME OR EMAIL' : 'EMAIL ADDRESS'}</label>
            <input 
              type="text" 
              required 
              placeholder={isLoginTab ? "username or email" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="primary-action-btn full-width">
            {submitting ? 'CONNECTING...' : isLoginTab ? 'LOG IN →' : 'CREATE ACCOUNT →'}
          </button>

          <div className="login-switch-prompt" style={{ marginTop: '14px', textAlign: 'center' }}>
            {isLoginTab ? (
              <span>
                New user?{' '}
                <button 
                  type="button" 
                  className="inline-switch-link"
                  onClick={() => { setIsLoginTab(false); setError(''); }}
                >
                  Sign up here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button 
                  type="button" 
                  className="inline-switch-link"
                  onClick={() => { setIsLoginTab(true); setError(''); }}
                >
                  Log in here
                </button>
              </span>
            )}
          </div>
        </form>

        <p className="auth-disclaimer">
          🔒 Your account securely saves your high scores, ranks, and game progress across devices.
        </p>
      </div>
    </div>
  );
}
