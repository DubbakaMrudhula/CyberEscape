import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { cases as initialCases } from './data/cases';
import { sounds } from './utils/sound';

import Navbar from './components/Navbar';
import VaultProgress from './components/VaultProgress';
import AuthModal from './components/AuthModal';
import LeaderboardModal from './components/LeaderboardModal';
import ExplanationCard from './components/ExplanationCard';
import ResultsView from './components/ResultsView';
import CompanionBox from './components/CompanionBox';
import StreakMeter from './components/StreakMeter';
import SwipeActionDeck from './components/SwipeActionDeck';
import ShareableDossier from './components/ShareableDossier';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import BlueprintPage from './components/BlueprintPage';

import EmailArtifact from './components/artifacts/EmailArtifact';
import PasswordArtifact from './components/artifacts/PasswordArtifact';
import QRArtifact from './components/artifacts/QRArtifact';
import SMSArtifact from './components/artifacts/SMSArtifact';

import './style.css';
import { API_BASE } from './config';

function EscapeRoomApp() {
  const { user, isAdmin } = useAuth();

  // Screen State: 'intro', 'game', 'results', 'login', 'admin'
  const [screen, setScreen] = useState('intro');
  const [caseIndex, setCaseIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // Dynamic CMS Cases & Scenarios
  const [customScenarios, setCustomScenarios] = useState([]);
  const [engineSettings, setEngineSettings] = useState({
    startingLives: 3,
    streakBonus: 50,
    passScoreThreshold: 750,
    lockdownMode: false
  });

  // Fetch engine settings & custom scenarios
  useEffect(() => {
    async function loadEngineData() {
      try {
        const resSettings = await fetch(`${API_BASE}/api/admin/settings`);
        if (resSettings.ok) {
          const data = await resSettings.json();
          if (data.settings) setEngineSettings(data.settings);
        }

        const resScenarios = await fetch(`${API_BASE}/api/admin/scenarios`);
        if (resScenarios.ok) {
          const data = await resScenarios.json();
          if (data.scenarios) setCustomScenarios(data.scenarios);
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    loadEngineData();
  }, [screen]);

  // Combine initial cases with any custom scenarios created via Admin CMS
  const activeCases = useMemo(() => {
    if (!customScenarios.length) return initialCases;
    return initialCases.map(c => {
      const added = customScenarios.filter(cs => cs.caseId === c.id);
      if (!added.length) return c;
      const formattedAdded = added.map(cs => ({
        id: cs.scenarioId,
        type: cs.type,
        difficulty: cs.difficulty || 'BONUS CHALLENGE',
        subject: cs.title,
        senderName: cs.content?.senderName || 'Sender',
        senderEmail: cs.content?.senderEmail || 'info@notice.com',
        recipient: 'to: you@vault.net',
        destinationUrl: cs.content?.destinationUrl || null,
        bodyText: cs.content?.bodyText || cs.title,
        actionBtnText: cs.content?.actionBtnText || 'VIEW DETAILS',
        correctAction: cs.correctAction,
        points: cs.points || 150,
        suspectArea: 'custom',
        signal: cs.signal,
        companionReaction: cs.companionReaction || {
          correct: 'Great spotting!',
          wrong: 'Careful with unknown messages!'
        }
      }));
      return {
        ...c,
        scenarios: [...c.scenarios, ...formattedAdded]
      };
    });
  }, [customScenarios]);

  // Game Stats
  const [lives, setLives] = useState(engineSettings.startingLives || 3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState({
    phishing: 0,
    passwords: 0,
    qr: 0,
    scams: 0
  });

  // Consequence & Glitch State
  const [glitchActive, setGlitchActive] = useState(false);
  const [drainAmount, setDrainAmount] = useState(null);

  // Feedback State
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const currentCase = activeCases[caseIndex];
  const currentScenario = currentCase?.scenarios[scenarioIndex];
  const isLastScenario = caseIndex === activeCases.length - 1 && scenarioIndex === currentCase?.scenarios.length - 1;

  // Heartbeat sound if on last life
  useEffect(() => {
    if (screen === 'game' && lives === 1 && !feedback) {
      const timer = setInterval(() => {
        sounds.playHeartbeat();
      }, 1400);
      return () => clearInterval(timer);
    }
  }, [screen, lives, feedback]);

  // Ensure admin cannot be on game or results screen
  useEffect(() => {
    if (isAdmin && (screen === 'game' || screen === 'results')) {
      setScreen('admin');
    }
  }, [isAdmin, screen]);

  // If user is already logged in, do not allow staying on login screen
  useEffect(() => {
    if (user && screen === 'login') {
      setScreen(isAdmin ? 'admin' : 'intro');
    }
  }, [user, isAdmin, screen]);

  const startGame = () => {
    if (isAdmin) {
      setScreen('admin');
      return;
    }
    sounds.playClick();
    setScreen('game');
    setCaseIndex(0);
    setScenarioIndex(0);
    setLives(engineSettings.startingLives || 3);
    setScore(0);
    setStreak(0);
    setMistakes({ phishing: 0, passwords: 0, qr: 0, scams: 0 });
    setFeedback(null);
  };

  // Process Game Decision (either 'block' or 'trust')
  const handleDecision = useCallback((action) => {
    if (feedback || !currentScenario) return;

    sounds.playSwipe();
    const isCorrect = action === currentScenario.correctAction;

    if (isCorrect) {
      const bonus = streak >= 2 ? (engineSettings.streakBonus || 50) : 0;
      const earned = currentScenario.points + bonus;
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3) {
        sounds.playStreak();
      } else {
        sounds.playCorrect();
      }

      setScore(prev => prev + earned);
      setFeedback({
        correct: true,
        points: earned,
        reaction: currentScenario.companionReaction?.correct || 'Great call!'
      });
    } else {
      // Wrong answer consequence
      sounds.playMistake();
      setStreak(0);
      setLives(prev => Math.max(0, prev - 1));
      setMistakes(prev => ({
        ...prev,
        [currentCase.id]: (prev[currentCase.id] || 0) + 1
      }));

      // Trigger screen glitch and consequences
      setGlitchActive(true);
      setDrainAmount('-$500 FAKE SCAM CHARGE');
      setTimeout(() => {
        setGlitchActive(false);
        setDrainAmount(null);
      }, 1200);

      setFeedback({
        correct: false,
        points: 0,
        reaction: currentScenario.companionReaction?.wrong || 'That was a trap!'
      });
    }
  }, [feedback, currentScenario, currentCase, streak, engineSettings.streakBonus]);

  // Keyboard shortcut listener: Left Arrow = Block/Fake, Right Arrow = Trust/Safe
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen !== 'game' || feedback) return;
      if (e.key === 'ArrowLeft') {
        handleDecision('block');
      } else if (e.key === 'ArrowRight') {
        handleDecision('trust');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, feedback, handleDecision]);

  const handleNext = () => {
    sounds.playClick();
    if (lives === 0 || isLastScenario) {
      if (lives > 0) sounds.playUnlock();
      setScreen('results');
      setFeedback(null);
      return;
    }

    if (scenarioIndex < currentCase.scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
    } else {
      sounds.playUnlock();
      setCaseIndex(prev => prev + 1);
      setScenarioIndex(0);
    }
    setFeedback(null);
  };

  const renderArtifact = () => {
    if (!currentScenario) return null;
    switch (currentScenario.type) {
      case 'email':
        return <EmailArtifact scenario={currentScenario} />;
      case 'password':
        return <PasswordArtifact scenario={currentScenario} />;
      case 'qr':
        return <QRArtifact scenario={currentScenario} />;
      case 'sms':
        return <SMSArtifact scenario={currentScenario} />;
      default:
        return <EmailArtifact scenario={currentScenario} />;
    }
  };

  return (
    <div className={`app-shell ${glitchActive ? 'glitch-effect' : ''}`}>
      {/* Consequence Overlay */}
      {drainAmount && (
        <div className="consequence-floating-banner">
          <span className="consequence-icon">💸</span>
          <b>{drainAmount}</b>
          <small>You fell for a trick! Stay alert 👍</small>
        </div>
      )}

      {/* Navbar */}
      <Navbar 
        lives={lives} 
        score={score} 
        currentScreen={screen}
        onHome={() => setScreen('intro')} 
        onOpenAuth={() => setScreen('login')}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenBlueprint={() => setScreen('blueprint')}
        onOpenAdmin={() => {
          if (isAdmin) {
            setScreen('admin');
          }
        }}
      />

      {screen === 'game' && (
        <div className="game-status-subbar">
          <VaultProgress 
            challenges={activeCases} 
            activeChallengeIndex={caseIndex} 
            currentScenarioIndex={scenarioIndex} 
          />
          <StreakMeter streak={streak} />
        </div>
      )}

      <main>
        {/* SCREEN: BLUEPRINT / HOW TO PLAY */}
        {screen === 'blueprint' && (
          <BlueprintPage 
            onBack={() => setScreen('intro')} 
            onStartGame={startGame} 
            onOpenAdmin={() => setScreen('admin')} 
          />
        )}

        {/* SCREEN: ADMIN CONSOLE */}
        {screen === 'admin' && (
          isAdmin ? (
            <AdminDashboard onBackToGame={() => setScreen('intro')} />
          ) : (
            <LoginPage 
              onBack={() => setScreen('intro')} 
              onLoginSuccess={(target) => {
                if (target === 'admin') {
                  setScreen('admin');
                } else {
                  setScreen('intro');
                }
              }} 
            />
          )
        )}

        {/* SCREEN: LOGIN */}
        {screen === 'login' && (
          <LoginPage 
            onBack={() => setScreen('intro')} 
            onLoginSuccess={(target) => {
              if (target === 'admin') {
                setScreen('admin');
              } else {
                setScreen('intro');
              }
            }} 
          />
        )}

        {/* SCREEN: INTRO HQ */}
        {screen === 'intro' && (
          <>
            {/* System Lockdown Warning (if set by Admin) */}
            {engineSettings.lockdownMode && (
              <div className="system-lockdown-banner">
                <span className="lockdown-icon">🔒</span>
                <div>
                  <strong>MAINTENANCE MODE:</strong> The game is currently paused for scheduled maintenance.
                </div>
              </div>
            )}

            <section className="intro-screen">
              <div className="intro-copy reveal">
                <div className="detective-case-badge">
                  <span className="badge-dot"></span>
                  <span>ONLINE SAFETY ESCAPE ROOM</span>
                </div>
                <h1>Crack the<br /><em>vault.</em></h1>
                <p className="intro-lede">
                  Put your detective skills to the test! Learn how to spot real-world online dangers like 
                  <strong> fake emails, weak passwords, scam QR codes, and urgent text messages</strong>.
                  Make your choice: Tap <strong>BLOCK</strong> for dangerous scams, or tap <strong>TRUST</strong> for safe messages. 
                  Keep your lives and unlock the final vault!
                </p>

                <div className="intro-actions-row">
                  {isAdmin ? (
                    <>
                      <button className="primary-action-btn large" onClick={() => setScreen('admin')}>
                        OPEN ADMIN CONSOLE <span>🛡️</span>
                      </button>
                      <button className="secondary-action-btn" onClick={() => setShowLeaderboard(true)}>
                        HIGH SCORES <span>🏆</span>
                      </button>
                    </>
                  ) : user ? (
                    <>
                      <button className="primary-action-btn large" onClick={startGame}>
                        START GAME <span>🕵️‍♂️</span>
                      </button>
                      <button className="secondary-action-btn" onClick={() => setShowLeaderboard(true)}>
                        HIGH SCORES <span>🏆</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="primary-action-btn large" onClick={startGame}>
                        START GAME <span>🕵️‍♂️</span>
                      </button>
                      <button className="secondary-action-btn" onClick={() => setScreen('login')}>
                        LOG IN / SIGN UP <span>🔑</span>
                      </button>
                      <button className="secondary-action-btn" onClick={() => setShowLeaderboard(true)}>
                        HIGH SCORES <span>🏆</span>
                      </button>
                    </>
                  )}
                </div>

                {isAdmin && (
                  <div className="admin-status-note">
                    <span className="admin-note-icon">🛡️</span>
                    <div>
                      <strong>Administrator Session:</strong> You are logged in with administrator privileges. Admins manage challenge content, inspect scores, and configure settings. Gameplay is reserved for player accounts.
                    </div>
                  </div>
                )}

                <div className="microcopy">
                  <span className="pulse"></span> 4 FUN CHALLENGES <span className="divider"></span>
                  LEARN ONLINE SAFETY <span className="divider"></span> TEST YOUR INSTINCTS
                </div>
              </div>

              <div className="intro-visual reveal reveal-delay">
                <div className="visual-label">MISSION RADAR <span>4 CHALLENGES</span></div>
                <div className="vault-art">
                  <div className="vault-ring ring-outer"></div>
                  <div className="vault-ring ring-inner"></div>
                  <div className="vault-core">
                    <span>{activeCases.length}</span>
                    <small>LEVELS</small>
                  </div>
                  <div className="orbit orbit-one" title="Challenge 1: Fake Emails"><span>✉</span></div>
                  <div className="orbit orbit-two" title="Challenge 2: Weak Passwords"><span>✦</span></div>
                  <div className="orbit orbit-three" title="Challenge 3: Fake QR Codes"><span>▦</span></div>
                  <div className="orbit orbit-four" title="Challenge 4: Scam Texts"><span>◌</span></div>
                </div>
                <div className="visual-caption">
                  <b>FINAL VAULT LOCKED</b>
                  <span>Can you spot the difference between real messages and clever scams?</span>
                </div>
              </div>
            </section>

            <section className="challenge-strip">
              <span className="strip-title">THE 4 CHALLENGES:</span>
              {activeCases.map((c) => (
                <div key={c.id} className="challenge-tease">
                  <b className="tease-num">{c.caseNumber}</b>
                  <span className={`tease-icon ${c.color}`}>{c.icon}</span>
                  <div className="tease-info">
                    <strong className="tease-title">{c.title}</strong>
                    <small className="codename-tag">{c.codename}</small>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* SCREEN: GAMEPLAY */}
        {screen === 'game' && currentCase && currentScenario && (
          <section className={`game-screen ${currentCase.color}`}>
            <div className="case-briefing-header">
              <div className="case-title-box">
                <span className="kicker">{currentCase.caseNumber} · {currentCase.codename}</span>
                <h2>{currentCase.title}</h2>
                <p className="case-narrative-story">{currentCase.story}</p>
              </div>
              <div className="scenario-step-indicator">
                <b>{String(scenarioIndex + 1).padStart(2, '0')}</b>
                <span>/ {String(currentCase.scenarios.length).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="game-grid">
              {/* Left Column: AI Companion Box */}
              <div className="side-column">
                <CompanionBox feedback={feedback} />

                <div className="mechanic-tip-card">
                  <b>HOW TO PLAY:</b>
                  <p>Click the buttons below or use your keyboard arrow keys (<b>←</b> / <b>→</b>) to make your decision.</p>
                </div>
              </div>

              {/* Right Column: Case Artifact + Interactive Deck */}
              <div className="play-area">
                {renderArtifact()}

                {feedback ? (
                  <ExplanationCard 
                    feedback={feedback} 
                    scenario={currentScenario} 
                    isLastScenario={isLastScenario}
                    lives={lives}
                    onNext={handleNext}
                  />
                ) : (
                  <SwipeActionDeck 
                    onDecision={handleDecision}
                    disabled={Boolean(feedback)}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* SCREEN: RESULTS */}
        {screen === 'results' && (
          <div className="results-wrapper">
            <ResultsView 
              score={score} 
              lives={lives} 
              mistakes={mistakes} 
              challenges={activeCases} 
              onRestart={startGame}
              onOpenAuth={() => setShowAuth(true)}
            />

            <ShareableDossier 
              score={score}
              rank={score >= (engineSettings.passScoreThreshold || 750) ? (score >= 1350 ? 'S' : score >= 1050 ? 'A' : 'B') : (score >= 450 ? 'C' : 'F')}
              rankTitle={score >= 1350 ? 'MASTER CYBER DETECTIVE' : score >= 1050 ? 'SHARP INVESTIGATOR' : score >= 750 ? 'SECURITY AWARE' : 'NEEDS PRACTICE'}
              mistakes={mistakes}
              lives={lives}
              alias={user ? user.username : 'PLAYER'}
            />
          </div>
        )}
      </main>

      <footer className="footer-bar">
        <div className="footer-content">
          <span>VAULT BREAKER // CYBER SAFETY ESCAPE ROOM</span>
          <span className="footer-links">
            <button className="footer-link-btn" onClick={() => setScreen('blueprint')}>
              📖 How to Play
            </button>
            <span className="sep">·</span>
            {isAdmin && (
              <>
                <button className="footer-link-btn" onClick={() => setScreen('admin')}>
                  🛡️ Admin Panel
                </button>
                <span className="sep">·</span>
              </>
            )}
            <button className="footer-link-btn" onClick={() => setShowLeaderboard(true)}>
              🏆 High Scores
            </button>
          </span>
          <span className="footer-tech">LEARN TO PROTECT YOUR DATA & AVOID ONLINE SCAMS</span>
        </div>
      </footer>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EscapeRoomApp />
    </AuthProvider>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
