import React from 'react';

export default function CompanionBox({ feedback, mood = 'neutral' }) {
  // Companion states: neutral, happy, shocked, panic
  let avatarFace = '🤖';
  let avatarName = 'SARA (YOUR AI GUIDE)';
  let quote = "I'm right here with you. Take a close look before choosing!";
  let badgeClass = 'status-normal';

  if (feedback) {
    if (feedback.correct) {
      avatarFace = '😎';
      quote = feedback.reaction || "Great call! You stayed safe and protected your data.";
      badgeClass = 'status-hype';
    } else {
      avatarFace = '😱';
      quote = feedback.reaction || "Careful! Scammers use tricks like this every day.";
      badgeClass = 'status-ouch';
    }
  }

  return (
    <div className={`companion-card ${badgeClass}`}>
      <div className="companion-avatar-col">
        <div className="avatar-face-bubble">{avatarFace}</div>
        <div className="companion-wave-bars">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div className="companion-speech-col">
        <div className="companion-id-bar">
          <span className="ai-handle">{avatarName}</span>
          <span className="ai-live-tag">ONLINE</span>
        </div>
        <p className="companion-speech-text">"{quote}"</p>
      </div>
    </div>
  );
}
