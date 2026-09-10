import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';

export default function BlueprintPage({ onBack, onStartGame, onOpenAdmin }) {
  const { isAdmin } = useAuth();
  const [activeChallengeTab, setActiveChallengeTab] = useState('phishing');

  const challengesGuide = {
    phishing: {
      id: 'phishing',
      icon: '📧',
      tag: 'LEVEL 1',
      title: 'Fake Emails (Phishing)',
      desc: 'Criminals impersonate trusted companies like PayPal, Netflix, or your bank to trick you into revealing passwords or credit card details.',
      redFlags: [
        'Look at the sender email closely (e.g., support@paypa1-update.com instead of paypal.com)',
        'Artificial panic or urgency: "Account will be deleted in 24 hours!"',
        'Generic greetings like "Dear Customer" instead of your actual name',
        'Suspicious links pointing to unfamiliar website addresses'
      ],
      safeSigns: [
        'Sender email exactly matches the official domain (e.g. notifications@github.com)',
        'No pressure tactics or threats of immediate penalties',
        'Directs you to log into the official app or website directly'
      ],
      exampleRule: 'When in doubt: Never click email links to reset passwords. Always open your browser and type the official URL yourself.'
    },
    passwords: {
      id: 'passwords',
      icon: '🔑',
      tag: 'LEVEL 2',
      title: 'Weak Passwords',
      desc: 'Hackers use automated programs that test millions of common words, leaked passwords, and dates in seconds.',
      redFlags: [
        'Short passwords under 10 characters (e.g., "admin123", "letmein")',
        'Simple dictionary words, names of family or pets, or sequential numbers',
        'Reusing the exact same password across multiple online accounts'
      ],
      safeSigns: [
        'Long passphrases of 12-16+ characters combining random unrelated words',
        'Includes a healthy mix of uppercase, lowercase, numbers, and special symbols',
        'Using a dedicated password manager and enabling 2-Factor Authentication (2FA)'
      ],
      exampleRule: 'Best Practice: Passphrases like "Purple-Penguin-Dances-89!" are easy for humans to remember but nearly impossible for hacker bots to crack.'
    },
    qr: {
      id: 'qr',
      icon: '📱',
      tag: 'LEVEL 3',
      title: 'Scam QR Codes',
      desc: 'Criminals print fake QR code stickers and paste them over legitimate codes at parking meters, restaurant menus, and payment stands.',
      redFlags: [
        'A physical sticker pasted directly on top of another QR code or poster',
        'The scanned preview shows a suspicious shortened link or strange web address',
        'Scanning automatically initiates a payment or asks to install an unknown app'
      ],
      safeSigns: [
        'The QR code is printed directly into the official signage with no overlay sticker',
        'The destination URL clearly displays the verified, official company domain',
        'Prompts standard menu viewing without requiring your personal data'
      ],
      exampleRule: 'Rule of thumb: Always inspect the preview URL in your phone camera before tapping to open it.'
    },
    smishing: {
      id: 'smishing',
      icon: '💬',
      tag: 'LEVEL 4',
      title: 'Urgent Text Messages (Smishing)',
      desc: 'Fraudulent SMS text messages claiming you have an unpaid toll, a missed package delivery, or an emergency bank alert.',
      redFlags: [
        'Unsolicited texts with urgent demands: "Package delivery held, pay $2.50 fee now"',
        'Requests to tap a strange shortened link (e.g. bit.ly, tinyurl, or odd foreign domains)',
        'Anyone claiming to be your bank asking you to reply with your one-time verification code'
      ],
      safeSigns: [
        'Legitimate delivery notifications that reference an actual order tracking number you recognize',
        'Official short-code phone numbers with no requests for credit card information',
        'Advises you to check your official account portal rather than click links'
      ],
      exampleRule: 'Golden Rule: Your bank and genuine delivery services will NEVER text you asking for your password, PIN, or one-time verification code.'
    }
  };

  const currentTab = challengesGuide[activeChallengeTab];

  return (
    <section className="blueprint-page-screen">
      <div className="blueprint-page-container">
        
        {/* Top Header Banner */}
        <header className="blueprint-header">
          <div className="blueprint-header-lead">
            <div className="blueprint-tag">
              <span className="blueprint-dot"></span>
              <span>MISSION BLUEPRINT & RULES GUIDE</span>
            </div>
            <h1 className="blueprint-title">How to Play <em>Vault Breaker</em></h1>
            <p className="blueprint-subtitle">
              Learn the rules of engagement, understand how the scoring system works, 
              and discover the red-flag clues needed to crack the final vault.
            </p>
          </div>
          
          <div className="blueprint-header-actions">
            <button className="secondary-action-btn" onClick={onBack}>
              ← RETURN TO HQ
            </button>
            {isAdmin ? (
              <button className="primary-action-btn" onClick={onOpenAdmin}>
                OPEN ADMIN CONSOLE <span>🛡️</span>
              </button>
            ) : (
              <button className="primary-action-btn" onClick={() => { sounds.playClick(); onStartGame(); }}>
                START MISSION <span>🕵️‍♂️</span>
              </button>
            )}
          </div>
        </header>

        {/* 3 Step Quick Overview */}
        <div className="blueprint-steps-grid">
          <div className="blueprint-step-card">
            <div className="step-num-badge">01</div>
            <h3>Inspect the Evidence</h3>
            <p>
              In each level, you are presented with a real-world digital situation: a suspicious email, 
              a password attempt, a scanned QR code, or an urgent text message.
            </p>
            <div className="step-tag">READ CAREFULLY</div>
          </div>

          <div className="blueprint-step-card highlight">
            <div className="step-num-badge">02</div>
            <h3>Make Your Decision</h3>
            <p>
              Spot a threat? Tap <strong className="action-block-text">🚫 BLOCK</strong> to neutralize it. 
              Safe and authentic? Tap <strong className="action-trust-text">🛡️ TRUST</strong> to let it pass.
            </p>
            <div className="step-tag">BLOCK OR TRUST</div>
          </div>

          <div className="blueprint-step-card">
            <div className="step-num-badge">03</div>
            <h3>Keep Lives & Unlock Vault</h3>
            <p>
              You start with <strong>3 Lives</strong>. Every mistake costs a life and resets your score streak. 
              Clear all 4 levels to crack the vault and earn a Detective Rank!
            </p>
            <div className="step-tag">EARN RANK S</div>
          </div>
        </div>

        {/* Interactive Challenges Field Guide */}
        <div className="blueprint-guide-section">
          <div className="section-header-compact">
            <div>
              <span className="section-kicker">LEVEL BY LEVEL BRIEFING</span>
              <h2 className="section-title-clean">Threat Field Manual</h2>
            </div>
            <span className="guide-hint">Click a category below to explore its clues:</span>
          </div>

          {/* Category Tabs */}
          <div className="blueprint-tabs-bar">
            {Object.values(challengesGuide).map((ch) => (
              <button
                key={ch.id}
                className={`blueprint-tab-btn ${activeChallengeTab === ch.id ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setActiveChallengeTab(ch.id); }}
              >
                <span className="tab-icon">{ch.icon}</span>
                <span className="tab-text">{ch.title}</span>
              </button>
            ))}
          </div>

          {/* Active Briefing Card */}
          <div className="blueprint-briefing-card">
            <div className="briefing-card-top">
              <div className="briefing-badge-cluster">
                <span className="briefing-tag">{currentTab.tag}</span>
                <span className="briefing-icon">{currentTab.icon}</span>
                <h3>{currentTab.title}</h3>
              </div>
              <p className="briefing-desc">{currentTab.desc}</p>
            </div>

            <div className="briefing-columns">
              <div className="clues-column danger-column">
                <div className="column-heading">
                  <span className="column-dot red"></span>
                  <h4>⚠️ Red Flags (Tap BLOCK)</h4>
                </div>
                <ul className="clues-list">
                  {currentTab.redFlags.map((item, idx) => (
                    <li key={idx}>
                      <span className="clue-bullet red">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="clues-column safe-column">
                <div className="column-heading">
                  <span className="column-dot green"></span>
                  <h4>✓ Safe Signs (Tap TRUST)</h4>
                </div>
                <ul className="clues-list">
                  {currentTab.safeSigns.map((item, idx) => (
                    <li key={idx}>
                      <span className="clue-bullet green">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="briefing-rule-box">
              <span className="rule-icon">💡</span>
              <div>
                <strong>Detective Pro-Tip:</strong> {currentTab.exampleRule}
              </div>
            </div>
          </div>
        </div>

        {/* Scoring & Ranks Blueprint */}
        <div className="blueprint-scoring-grid">
          <div className="scoring-rules-card">
            <span className="section-kicker">SCORING SYSTEM</span>
            <h3>How Points Are Calculated</h3>
            <div className="scoring-item">
              <div className="score-val">+150 PTS</div>
              <div className="score-desc">
                <strong>Correct Decision:</strong> Successfully blocking a trick or trusting safe content.
              </div>
            </div>
            <div className="scoring-item">
              <div className="score-val">+50 PTS</div>
              <div className="score-desc">
                <strong>Streak Multiplier:</strong> Bonus added for every consecutive correct decision without mistakes.
              </div>
            </div>
            <div className="scoring-item">
              <div className="score-val">-1 LIFE</div>
              <div className="score-desc">
                <strong>Wrong Decision:</strong> Falling for a trap or blocking a safe message costs 1 heart and resets your streak.
              </div>
            </div>
          </div>

          <div className="ranks-guide-card">
            <span className="section-kicker">RANKS & BADGES</span>
            <h3>Detective Honor Roll</h3>
            <div className="ranks-row">
              <div className="rank-pill rank-s">
                <span className="rank-letter">S</span>
                <div className="rank-meta">
                  <b>1,350+ Points</b>
                  <small>Master Detective</small>
                </div>
              </div>
              <div className="rank-pill rank-a">
                <span className="rank-letter">A</span>
                <div className="rank-meta">
                  <b>1,050+ Points</b>
                  <small>Sharp Investigator</small>
                </div>
              </div>
              <div className="rank-pill rank-b">
                <span className="rank-letter">B</span>
                <div className="rank-meta">
                  <b>750+ Points</b>
                  <small>Security Aware</small>
                </div>
              </div>
              <div className="rank-pill rank-c">
                <span className="rank-letter">C</span>
                <div className="rank-meta">
                  <b>Under 750</b>
                  <small>Needs Practice</small>
                </div>
              </div>
            </div>
            <p className="rank-tip">
              Scores are recorded to the global High Scores Leaderboard so you can compete with other players!
            </p>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="blueprint-bottom-cta">
          <div className="cta-copy">
            <h3>Ready to test your instincts?</h3>
            <p>Step up to the vault, keep your lives, and prove your cyber detective skills.</p>
          </div>
          <div className="cta-actions">
            <button className="secondary-action-btn" onClick={onBack}>
              ← RETURN TO HQ
            </button>
            {isAdmin ? (
              <button className="primary-action-btn large" onClick={onOpenAdmin}>
                OPEN ADMIN CONSOLE <span>🛡️</span>
              </button>
            ) : (
              <button className="primary-action-btn large" onClick={() => { sounds.playClick(); onStartGame(); }}>
                START GAME NOW <span>🕵️‍♂️</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
