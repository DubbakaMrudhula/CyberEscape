import React from 'react';

export default function StreakMeter({ streak }) {
  if (streak <= 1) return null;

  const title = 
    streak >= 6 ? '⚡ UNTOUCHABLE CYBER GHOST' :
    streak >= 4 ? '🔥 UNSTOPPABLE COMBO' :
    streak >= 3 ? '🎯 SHARP-EYED DETECTIVE' : '👀 ON A ROLL';

  return (
    <div className="streak-meter-pill">
      <span className="streak-flame">🔥</span>
      <strong className="streak-count">{streak}X COMBO</strong>
      <span className="streak-badge-title">{title}</span>
    </div>
  );
}
