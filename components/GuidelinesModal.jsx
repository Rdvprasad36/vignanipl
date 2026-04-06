'use client';
import { useEffect } from 'react';

export default function GuidelinesModal({ open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card phase-enter"
        style={{
          maxWidth: 680, width: '100%', maxHeight: '88vh',
          overflowY: 'auto', padding: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            🏆 Official Guidelines
          </h2>
          <button
            id="close-guidelines-btn"
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
              fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <Section title="📌 General Rules">
          <Rule icon="📱" text="Single Device Policy: Each registered team is strictly allowed to use only ONE smartphone during the event. Multiple devices = immediate disqualification." />
          <Rule icon="🚫" text="No Refreshing: Do not refresh the browser during an active round. Doing so may forfeit your current question." />
        </Section>

        <Section title="🎯 Phase 1: The Quiz (Earning Phase)">
          <Rule icon="🔄" text="The game consists of 13 Rounds." />
          <Rule icon="❓" text="Each round has 3 questions: Easy (15s), Medium (30s), Hard (45s)." />
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', margin: '8px 0', fontSize: '0.88rem' }}>
            <strong>Points System:</strong>
            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Difficulty</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px' }}>Time</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px', color: '#16a34a' }}>Correct</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px', color: '#dc2626' }}>Wrong/Timeout</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '4px 8px' }}>Easy</td><td style={{ textAlign: 'center', padding: '4px 8px' }}>15s</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#16a34a', fontWeight: 700 }}>+100</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#dc2626', fontWeight: 700 }}>-20</td></tr>
                <tr><td style={{ padding: '4px 8px' }}>Medium</td><td style={{ textAlign: 'center', padding: '4px 8px' }}>30s</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#16a34a', fontWeight: 700 }}>+200</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#dc2626', fontWeight: 700 }}>-50</td></tr>
                <tr><td style={{ padding: '4px 8px' }}>Hard</td><td style={{ textAlign: 'center', padding: '4px 8px' }}>45s</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#16a34a', fontWeight: 700 }}>+300</td><td style={{ textAlign: 'center', padding: '4px 8px', color: '#dc2626', fontWeight: 700 }}>-100</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="🏏 Phase 2: The Auction (Bidding Phase)">
          <Rule icon="💰" text="After the 3 questions, your updated coin balance will be revealed." />
          <Rule icon="🛒" text="The Auction Window opens — choose 1 player from the available market." />
          <Rule icon="⭐" text="You must buy one player per round using your available coin balance." />
          <Rule icon="👁️" text="Your current squad and remaining budget are always visible on the right side." />
        </Section>

        <Section title="🏆 Phase 3: Final Submission">
          <Rule icon="⏱️" text="After 13 rounds, you have exactly 2 minutes to submit your final 12-man squad." />
          <Rule icon="📋" text="Mandatory structure: 1 Captain, 1 Wicketkeeper, 3+ Batsmen, 3+ Bowlers, 1+ All-Rounder." />
          <Rule icon="✨" text="Captain's star rating gets a 1.5× multiplier!" />
          <Rule icon="🥇" text="The team with the highest overall Star Rating WINS!" />
        </Section>

        <Section title="⚡ Tie-Breaker">
          <Rule icon="🎯" text="In case of equal star ratings, the team with the highest remaining coin balance wins." />
          <Rule icon="⚡" text="If still tied, a sudden-death Rapid Fire quiz determines the Ultimate Champion." />
        </Section>

        <button
          id="close-guidelines-btn-bottom"
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%', marginTop: 16 }}
        >
          Got it! Let's Play 🏏
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--vignan-blue)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function Rule({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-secondary)', fontSize: '0.88rem' }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}
