import React from 'react';

export default function SwipeActionDeck({ onDecision, disabled = false }) {
  const handleSwipe = (action) => {
    if (disabled) return;
    onDecision(action);
  };

  return (
    <div className="swipe-action-deck">
      <div className="swipe-instructions">
        <span className="key-hint">⌨ Keyboard: <b>← Left Arrow</b> for FAKE or <b>→ Right Arrow</b> for SAFE</span>
      </div>

      <div className="swipe-buttons-row">
        <button 
          className="deck-action-btn shred-btn"
          disabled={disabled}
          onClick={() => handleSwipe('block')}
        >
          <div className="btn-glyph">🗑️</div>
          <div className="btn-labels">
            <b>BLOCK / FAKE</b>
            <small>DANGEROUS SCAM · REPORT IT</small>
          </div>
        </button>

        <div className="deck-divider">OR</div>

        <button 
          className="deck-action-btn trust-btn"
          disabled={disabled}
          onClick={() => handleSwipe('trust')}
        >
          <div className="btn-glyph">🛡️</div>
          <div className="btn-labels">
            <b>TRUST / SAFE</b>
            <small>GENUINE & SAFE TO OPEN</small>
          </div>
        </button>
      </div>
    </div>
  );
}
