import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export default function LoginPage({ onBack, onLoginSuccess }) {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    sounds.playClick();

    try {
      if (isLoginTab) {
        const loggedUser = await login(email || username, password);
        sounds.playCorrect();
        if (loggedUser?.role === 'admin') {
          setSuccessMsg('Welcome, Administrator! Access granted.');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess('admin');
          }, 500);
        } else {
          setSuccessMsg('Welcome back! Loading game...');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess('intro');
          }, 500);
        }
      } else {
        await register(username, email, password);
        sounds.playUnlock();
        setSuccessMsg('Account created successfully! Loading game...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess('intro');
        }, 600);
      }
    } catch (err) {
      sounds.playMistake();
      setError(err.message || 'Error signing in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-page-screen">
      <div className="login-page-card">
        <div className="login-page-header">
          <div className="login-badge-row">
            <span className="brand-mark">VB</span>
            <div className="login-titles">
              <span className="kicker">VAULT BREAKER ACCOUNT</span>
              <h2>{isLoginTab ? 'LOG IN TO YOUR ACCOUNT' : 'CREATE A NEW ACCOUNT'}</h2>
            </div>
          </div>
          <button className="back-link-btn" onClick={onBack}>
            ← RETURN TO GAME
          </button>
        </div>

        <div className="mongo-database-indicator">
          <span className="mongo-leaf">🔒</span>
          <span className="mongo-text">ACCOUNTS & SCORES ARE SECURELY SAVED</span>
        </div>

        {error && <div className="auth-error-banner">⚠️ {error}</div>}
        {successMsg && <div className="auth-success-banner">✓ {successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form login-page-form">
          {!isLoginTab && (
            <div className="form-group">
              <label>YOUR NAME OR NICKNAME</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. CyberHero"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <small className="field-tip">This name will appear on the high score board</small>
            </div>
          )}

          <div className="form-group">
            <label>{isLoginTab ? 'USERNAME OR EMAIL ADDRESS' : 'EMAIL ADDRESS'}</label>
            <input 
              type="text" 
              required 
              placeholder={isLoginTab ? "Email address or username" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="field-tip">Minimum 6 characters</small>
          </div>

          <div className="login-actions-row">
            <button type="submit" disabled={submitting} className="primary-action-btn large full-width">
              {submitting ? 'LOGGING IN...' : isLoginTab ? 'LOG IN →' : 'SIGN UP →'}
            </button>
          </div>

          <div className="login-switch-prompt">
            {isLoginTab ? (
              <span>
                New user?{' '}
                <button 
                  type="button" 
                  className="inline-switch-link"
                  onClick={() => { setIsLoginTab(false); setError(''); setSuccessMsg(''); }}
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
                  onClick={() => { setIsLoginTab(true); setError(''); setSuccessMsg(''); }}
                >
                  Log in here
                </button>
              </span>
            )}
          </div>
        </form>

        <div className="login-page-footer-notes">
          <div className="security-bullet">
            <b>🔒 SECURE ACCOUNT:</b> Saves your progress and high scores across devices.
          </div>
          <div className="security-bullet">
            <b>🏆 DETECTIVE RANKS:</b> Track all-time personal bests, survived lives, and earned ranks.
          </div>
        </div>
      </div>
    </section>
  );
}
