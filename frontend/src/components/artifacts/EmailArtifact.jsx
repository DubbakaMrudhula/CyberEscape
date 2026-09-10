import React, { useState } from 'react';

export default function EmailArtifact({ scenario, onSpotTell }) {
  const [showUrlInspect, setShowUrlInspect] = useState(false);
  const [spottedPart, setSpottedPart] = useState(null);

  const handleSpot = (part) => {
    setSpottedPart(part);
    if (onSpotTell) onSpotTell(part);
  };

  return (
    <div className="artifact email-artifact">
      <div className="artifact-top">
        <span className="window-dots"><i></i><i></i><i></i></span>
        <span>INCOMING EMAIL</span>
        <span className="badge-pill">EVIDENCE</span>
      </div>

      <div className="email-meta">
        <div className="avatar">{scenario.senderName ? scenario.senderName[0] : 'S'}</div>
        <div className="email-sender-info">
          <div className="sender-row">
            <b>{scenario.senderName}</b>
            <span 
              className={`sender-email clickable-spot ${spottedPart === 'sender' ? 'spotted' : ''}`}
              onClick={() => handleSpot('sender')}
              title="Click to inspect sender address"
            >
              &lt;{scenario.senderEmail}&gt;
            </span>
          </div>
          <small className="recipient-label">{scenario.recipient}</small>
        </div>
        <div className="email-timestamp">TODAY · 10:42 AM</div>
      </div>

      <div className="email-subject">
        <span 
          className={`subject-tag clickable-spot ${spottedPart === 'subject' ? 'spotted' : ''}`}
          onClick={() => handleSpot('subject')}
        >
          [ALERT]
        </span>{' '}
        {scenario.subject}
      </div>

      <div className="email-body">
        {scenario.bodyText.split('\n').map((line, i) => {
          if (!line) return <br key={i} />;
          return <p key={i}>{line}</p>;
        })}

        {scenario.actionBtnText && (
          <div className="email-action-box">
            <button 
              className={`mock-email-action-btn ${showUrlInspect ? 'active-inspect' : ''}`}
              onMouseEnter={() => setShowUrlInspect(true)}
              onMouseLeave={() => setShowUrlInspect(false)}
              onClick={(e) => { e.preventDefault(); setShowUrlInspect(prev => !prev); }}
            >
              {scenario.actionBtnText} <span>↗</span>
            </button>
            <div className="hover-tip">🔍 Hover or tap to see where this button really takes you</div>
          </div>
        )}
      </div>

      {scenario.destinationUrl && (
        <div className={`url-inspector ${showUrlInspect ? 'visible' : ''}`}>
          <span className="inspect-label">REAL WEBSITE ADDRESS:</span>
          <code className="inspect-url">{scenario.destinationUrl}</code>
        </div>
      )}
    </div>
  );
}
