import React, { useState } from 'react';

export default function QRArtifact({ scenario }) {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="artifact qr-artifact">
      <div className="artifact-top">
        <span className="window-dots"><i></i><i></i><i></i></span>
        <span>QR CODE CHECKER</span>
        <span className="badge-pill">CAMERA</span>
      </div>

      <div className="qr-main-layout">
        <div className="qr-context-side">
          <div className="location-stamp">
            <span className="location-pin">📍</span> {scenario.context}
          </div>
          <h3 className="qr-headline">{scenario.headline}</h3>
          <p className="qr-description">{scenario.copy}</p>

          <div className="forensic-notice">
            <b>WHAT YOU NOTICE:</b>
            <span>{scenario.warningSign}</span>
          </div>

          <div className="qr-actions">
            <button 
              className={`scan-button ${scanned ? 'active' : ''}`}
              onClick={() => setScanned(!scanned)}
            >
              {scanned ? 'HIDE SCANNED LINK' : 'SCAN WITH PHONE CAMERA'} <span>🔍</span>
            </button>
          </div>
        </div>

        <div className="qr-visual-container">
          <div className="qr-code-box">
            {/* QR pattern */}
            <div className="qr-grid">
              {Array.from({ length: 81 }, (_, i) => {
                const isCorner1 = (i < 3 || (i >= 9 && i < 12) || (i >= 18 && i < 21));
                const isCorner2 = ((i >= 6 && i < 9) || (i >= 15 && i < 18) || (i >= 24 && i < 27));
                const isCorner3 = ((i >= 54 && i < 57) || (i >= 63 && i < 66) || (i >= 72 && i < 75));
                const isFinder = isCorner1 || isCorner2 || isCorner3;
                const isMod = (i * 7 + 13) % 3 === 0;
                return (
                  <span 
                    key={i} 
                    className={`qr-dot ${isFinder || isMod ? 'dark' : 'light'}`} 
                  />
                );
              })}
            </div>
            <div className="scan-line-overlay"></div>
          </div>
          <span className="qr-caption">EVIDENCE PHOTO</span>
        </div>
      </div>

      {scanned && (
        <div className="scanned-destination-banner">
          <div className="dest-header">
            <span className="scanner-badge">SCANNED WEBSITE ADDRESS</span>
            <span className="status-label">LINK PREVIEW</span>
          </div>
          <div className="dest-url-row">
            <code>{scenario.destination}</code>
          </div>
        </div>
      )}
    </div>
  );
}
