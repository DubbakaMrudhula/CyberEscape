import React, { useState } from 'react';

export default function PasswordArtifact({ scenario }) {
  const [revealed, setRevealed] = useState(true);

  return (
    <div className="artifact password-artifact">
      <div className="artifact-top">
        <span className="window-dots"><i></i><i></i><i></i></span>
        <span>PASSWORD STRENGTH CHECKER</span>
        <span className="badge-pill">PASSWORD TEST</span>
      </div>

      <div className="password-content">
        <div className="password-header-row">
          <span className="artifact-tag">{scenario.label}</span>
          <button className="toggle-vis-btn" onClick={() => setRevealed(!revealed)}>
            {revealed ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        <div className="password-display-box">
          <span className="pwd-value">
            {revealed ? (
              scenario.value.split('').map((char, index) => {
                const isSpecial = /[^a-zA-Z0-9]/.test(char);
                const isNum = /[0-9]/.test(char);
                return (
                  <span 
                    key={index} 
                    className={`pwd-char ${isSpecial ? 'char-special' : isNum ? 'char-num' : 'char-letter'}`}
                  >
                    {char}
                  </span>
                );
              })
            ) : (
              '••••••••••••••••'
            )}
          </span>
          <span className="pwd-length-badge">{scenario.value.length} CHARACTERS</span>
        </div>

        <div className="entropy-section">
          <div className="meter-header">
            <span>PASSWORD STRENGTH:</span>
            <strong>{scenario.entropy > 70 ? 'VERY STRONG' : scenario.entropy > 45 ? 'MODERATE' : 'WEAK'} ({scenario.entropy}/100)</strong>
          </div>
          <div className="meter-track">
            <div 
              className={`meter-fill ${scenario.entropy > 70 ? 'strong' : scenario.entropy > 45 ? 'moderate' : 'weak'}`}
              style={{ width: `${Math.min(100, (scenario.entropy / 100) * 100)}%` }}
            />
          </div>
          <div className="meter-labels">
            <span>WEAK</span>
            <span>MEDIUM</span>
            <span>VERY STRONG</span>
          </div>
        </div>

        <div className="crack-time-card">
          <span className="crack-label">TIME TO CRACK THIS PASSWORD:</span>
          <strong className="crack-val">{scenario.crackTime}</strong>
          <small className="crack-disclaimer">Estimated time using automated guessing programs</small>
        </div>
      </div>
    </div>
  );
}
