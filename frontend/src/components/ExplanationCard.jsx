import React from 'react';

export default function ExplanationCard({ feedback, scenario, isLastScenario, lives, onNext }) {
  if (!feedback) return null;

  const isCorrect = feedback.correct;

  return (
    <div className={`feedback-container ${isCorrect ? 'feedback-success' : 'feedback-fail'}`}>
      <div className="feedback-banner">
        <div className="feedback-icon-box">
          {isCorrect ? '✓' : '⚠️'}
        </div>
        <div className="feedback-headline-group">
          <span className="feedback-tag">
            {isCorrect ? 'GREAT JOB! YOU SPOTTED IT' : 'CAREFUL! THAT WAS A TRICK'}
          </span>
          <h3>{isCorrect ? `+${feedback.points} POINTS EARNED` : 'YOU LOST 1 LIFE'}</h3>
        </div>
      </div>

      <div className="feedback-signal-body">
        <div className="signal-badge">WHAT TO REMEMBER:</div>
        <p className="signal-text">{scenario.signal}</p>
      </div>

      <div className="feedback-action-bar">
        <button className="next-scenario-btn" onClick={onNext}>
          {lives === 0 
            ? 'SEE YOUR FINAL SCORE →' 
            : isLastScenario 
            ? 'NEXT LEVEL →' 
            : 'NEXT QUESTION →'}
        </button>
      </div>
    </div>
  );
}
