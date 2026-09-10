import React from 'react';

export default function SMSArtifact({ scenario }) {
  return (
    <div className="artifact sms-artifact-wrapper">
      <div className="artifact-top">
        <span className="window-dots"><i></i><i></i><i></i></span>
        <span>PHONE TEXT MESSAGE</span>
        <span className="badge-pill">MESSAGE</span>
      </div>

      <div className="phone-device-frame">
        <div className="phone-notch">
          <div className="phone-camera"></div>
          <div className="phone-speaker"></div>
        </div>

        <div className="phone-header">
          <div className="caller-avatar">{scenario.sender[0]}</div>
          <div className="caller-meta">
            <b className="caller-name">{scenario.sender}</b>
            <span className="caller-tag">{scenario.senderLabel}</span>
          </div>
          <div className="phone-info-icon">ℹ</div>
        </div>

        <div className="sms-thread-body">
          <div className="time-divider">Today · 10:48 AM</div>

          {scenario.messages.map((text, idx) => (
            <div key={idx} className="sms-bubble-row incoming">
              <div className="sms-bubble">
                <p>{text}</p>
                <span className="sms-time">10:48 AM</span>
              </div>
            </div>
          ))}

          {scenario.destinationUrl && (
            <div className="link-preview-card">
              <div className="preview-domain-tag">WEBSITE LINK IN MESSAGE</div>
              <code className="preview-url">{scenario.destinationUrl}</code>
            </div>
          )}
        </div>

        <div className="phone-input-bar">
          <span className="add-btn">+</span>
          <div className="mock-input-field">Text Message</div>
          <span className="send-arrow">↑</span>
        </div>
      </div>
    </div>
  );
}
