import React from 'react';

export default function VaultProgress({ challenges, activeChallengeIndex, currentScenarioIndex, totalCleared }) {
  const activeChallenge = challenges[activeChallengeIndex];
  const totalScenarios = challenges.reduce((sum, c) => sum + c.scenarios.length, 0);
  const currentOverallProgress = challenges
    .slice(0, activeChallengeIndex)
    .reduce((sum, c) => sum + c.scenarios.length, 0) + currentScenarioIndex;

  const pct = Math.round((currentOverallProgress / totalScenarios) * 100);

  return (
    <div className="progress-row">
      <div className="progress-copy">
        <span className="progress-eyebrow">CHALLENGE PROGRESS</span>
        <b>
          LEVEL {activeChallengeIndex + 1} OF 4 · {activeChallenge?.title.toUpperCase()}
        </b>
      </div>

      <div className="locks">
        {challenges.map((c, i) => {
          const isCleared = i < activeChallengeIndex || totalCleared;
          const isActive = i === activeChallengeIndex && !totalCleared;
          return (
            <div 
              key={c.id} 
              className={`lock-bolt ${isCleared ? 'cleared' : isActive ? 'active' : ''}`}
              title={`${c.title} - ${isCleared ? 'COMPLETED' : isActive ? 'IN PROGRESS' : 'LOCKED'}`}
            >
              <span className="lock-icon">{isCleared ? '🔓' : '🔒'}</span>
              <span className="lock-label">LEVEL {i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="progress-track-wrapper">
        <div className="progress-percentage-label">{pct}% COMPLETED</div>
        <div className="progress-line">
          <span style={{ width: `${pct}%` }}></span>
        </div>
      </div>
    </div>
  );
}
