import React, { useState } from 'react';

export default function ShareableDossier({ score, rank, rankTitle, mistakes, lives, alias }) {
  const [copied, setCopied] = useState(false);
  const totalMistakes = Object.values(mistakes).reduce((a, b) => a + b, 0);

  const shareText = `🔒 I played the Vault Breaker Escape Room with a score of ${score} and earned rank: [${rankTitle}]! Can you spot the online scams? Play now! #VaultBreaker #CyberSafety`;

  const copyDossier = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="shareable-card">
      <div className="shareable-top">
        <span className="badge-stamp">VAULT BREAKER DETECTIVE REPORT</span>
        <span className="dossier-id">SCORECARD #{Math.floor(100000 + Math.random() * 900000)}</span>
      </div>

      <div className="shareable-body">
        <div className="agent-avatar-box">
          <div className="agent-holo">🕵️‍♂️</div>
          <span className="agent-code-label">PLAYER:</span>
          <b>{alias || 'PLAYER'}</b>
        </div>

        <div className="dossier-stats-col">
          <div className="clearance-rank-stamp">
            <span className="stamp-sub">SCORE RANK</span>
            <h2 className="stamp-grade">{rank}</h2>
            <strong className="stamp-title">{rankTitle}</strong>
          </div>

          <div className="dossier-mini-grid">
            <div className="mini-stat">
              <span>SCORE</span>
              <strong>{score}</strong>
            </div>
            <div className="mini-stat">
              <span>LIVES LEFT</span>
              <strong className="lives-text">{'♥'.repeat(Math.max(0, lives))}</strong>
            </div>
            <div className="mini-stat">
              <span>MISTAKES</span>
              <strong>{totalMistakes}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="shareable-footer">
        <div className="meme-verdict">
          {totalMistakes === 0 
            ? "👑 100% UNTOUCHABLE DETECTIVE: You spotted every scam." 
            : totalMistakes <= 2 
            ? "🔥 SHARP INVESTIGATOR: Slipped a couple, but kept your accounts safe." 
            : "💀 NEEDS PRACTICE: Fell for too many tricks this time."}
        </div>
        <button className="copy-share-btn" onClick={copyDossier}>
          {copied ? '✓ COPIED TO CLIPBOARD!' : 'COPY RESULTS TO SHARE 📋'}
        </button>
      </div>
    </div>
  );
}
