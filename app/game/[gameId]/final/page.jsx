'use client';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUser, submitFinalSquad } from '@/lib/firestore';
import Link from 'next/link';

const FINAL_DURATION = 120; // 2 minutes

export default function FinalPage({ params }) {
  const { gameId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [selected, setSelected] = useState([]); // array of player ids (max 11)
  const [impact, setImpact]     = useState(null);  // 1 impact player id
  const [captain, setCaptain]   = useState(null);  // 1 captain player id
  const [timeLeft, setTimeLeft] = useState(FINAL_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  useEffect(() => {
    if (!user) return;
    return subscribeToUser(user.uid, setUserData);
  }, [user]);

  // Countdown
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted]);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(s => s.filter(x => x !== id));
    } else if (selected.length < 11) {
      setSelected(s => [...s, id]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!userData) return;
    const players = (userData.teamPlayers || []);
    const squadPlayers = players.filter(p => selected.includes(p.id));

    // Validate constraints
    if (selected.length !== 11) { setError('Select exactly 11 players.'); return; }
    if (!impact) { setError('Choose 1 impact sub.'); return; }
    if (!captain) { setError('Choose a captain.'); return; }

    const roles = squadPlayers.reduce((acc, p) => { acc[p.role] = (acc[p.role] || 0) + 1; return acc; }, {});
    if (!roles.WK || roles.WK < 1) { setError('Squad must include at least 1 Wicketkeeper.'); return; }
    if ((!roles.BAT || roles.BAT < 3)) { setError('Squad must include at least 3 Batsmen.'); return; }
    if ((!roles.BOWL || roles.BOWL < 3)) { setError('Squad must include at least 3 Bowlers.'); return; }
    if (!roles.AR || roles.AR < 1) { setError('Squad must include at least 1 All-Rounder.'); return; }

    // Compute final stars (captain gets 1.5x)
    let finalStars = squadPlayers.reduce((s, p) => {
      return s + (p.id === captain ? p.stars * 1.5 : p.stars);
    }, 0);
    const impactPlayer = players.find(p => p.id === impact);
    if (impactPlayer) finalStars += impactPlayer.stars;
    finalStars = parseFloat(finalStars.toFixed(2));

    setSubmitting(true);
    try {
      await submitFinalSquad(user.uid, selected, captain, impact, finalStars, userData.totalCoins);
      setSubmitted(true);
    } catch (e) {
      setError('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !userData) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-dots">Loading</div></div>;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div className="card bounce-in" style={{ maxWidth: 480, width: '100%', padding: '48px 32px', textAlign: 'center', margin: '0 20px' }}>
          <div style={{ fontSize: '5rem', marginBottom: 16 }}>🏆</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Squad Submitted!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your final 12-man squad has been locked in. May the best team win!</p>
          <Link href="/results" className="btn btn-gold" style={{ padding: '14px 36px', fontSize: '1rem', fontWeight: 800 }}>
            View Results 🏆
          </Link>
        </div>
      </div>
    );
  }

  const players = userData.teamPlayers || [];
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const urgent = timeLeft <= 30;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        {/* Timer */}
        <div style={{
          background: urgent ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'var(--gradient)',
          borderRadius: 16, padding: '20px 28px', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
          boxShadow: urgent ? '0 4px 24px rgba(220,38,38,0.4)' : 'var(--shadow)',
          animation: urgent ? 'pulseGlow 1s infinite' : 'none',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>⏱️ Time Remaining</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: -1 }}>{mins}:{secs}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Squad Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selected.length}/11 playing</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{impact ? '1/1 Impact' : '0/1 Impact'} · {captain ? '1/1 Captain' : '0/1 Captain'}</div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>📋 Build Your Final Squad</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
          Select 11 players + 1 Impact Player (12th) + appoint a Captain. Constraints: 1 WK, 3+ BAT, 3+ BOWL, 1+ AR.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Player grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          {players.map(p => {
            const isSelected = selected.includes(p.id);
            const isImpact   = impact === p.id;
            const isCaptain  = captain === p.id;
            const canPick    = isSelected || selected.length < 11;

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
                  border: isCaptain ? '2px solid #FFD700' : isImpact ? '2px solid #7c3aed' : isSelected ? '2px solid var(--vignan-blue)' : '2px solid var(--border)',
                  background: isCaptain ? 'rgba(255,215,0,0.08)' : isImpact ? 'rgba(124,58,237,0.05)' : isSelected ? 'rgba(0,65,130,0.05)' : 'var(--bg-card)',
                  opacity: !canPick && !isSelected && !isImpact ? 0.45 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={p.photoUrl} alt={p.name} style={{ width: 48, height: 48, borderRadius: '50%', border: isCaptain ? '2px solid #FFD700' : '2px solid var(--border)' }} />
                  {isCaptain && <div style={{ position: 'absolute', top: -6, right: -6, background: '#FFD700', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>C</div>}
                  {isImpact && !isCaptain && <div style={{ position: 'absolute', top: -6, right: -6, background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>I</div>}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', marginTop: 6, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 4 }}>
                  <span className={`role-badge role-${p.role}`} style={{ fontSize: '0.6rem' }}>{p.role}</span>
                  <span style={{ fontSize: '0.65rem', color: '#FFD700' }}>⭐{p.stars}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
                  {/* Playing XI toggle */}
                  <button
                    onClick={() => { if (!isImpact) toggleSelect(p.id); }}
                    style={{
                      fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99, border: 'none', cursor: isImpact ? 'not-allowed' : 'pointer',
                      background: isSelected ? 'var(--vignan-blue)' : 'var(--bg-secondary)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)', fontWeight: 600,
                    }}
                    disabled={(!canPick && !isSelected) || isImpact}
                    id={`select-playing-${p.id}`}
                  >{isSelected ? '✓ XI' : '+ XI'}</button>
                  {/* Impact */}
                  <button
                    onClick={() => { if (!isSelected) setImpact(impact === p.id ? null : p.id); }}
                    style={{
                      fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99, border: 'none', cursor: isSelected ? 'not-allowed' : 'pointer',
                      background: isImpact ? '#7c3aed' : 'var(--bg-secondary)',
                      color: isImpact ? '#fff' : 'var(--text-secondary)', fontWeight: 600,
                    }}
                    disabled={isSelected}
                    id={`select-impact-${p.id}`}
                  >{isImpact ? '✓ Sub' : '+ Sub'}</button>
                  {/* Captain */}
                  {isSelected && (
                    <button
                      onClick={() => setCaptain(captain === p.id ? null : p.id)}
                      style={{
                        fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
                        background: isCaptain ? '#FFD700' : 'var(--bg-secondary)',
                        color: isCaptain ? '#1a0a00' : 'var(--text-secondary)', fontWeight: 700,
                      }}
                      id={`select-captain-${p.id}`}
                    >{isCaptain ? '★ C' : '☆ C'}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          <Tip color="#004182" icon="🏏" text="Select exactly 11 for Playing XI" />
          <Tip color="#7c3aed" icon="⚡" text="1 Impact Sub (from bench)" />
          <Tip color="#FFD700" text_color="#1a0a00" icon="★" text="1 Captain (1.5× stars bonus)" />
        </div>

        <button
          id="submit-squad-btn"
          className="btn btn-gold"
          style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 800 }}
          onClick={handleSubmit}
          disabled={submitting || timeLeft === 0}
        >
          {submitting ? 'Submitting…' : timeLeft === 0 ? '⏰ Time Up!' : '🏆 Submit Final Squad'}
        </button>
      </div>
    </div>
  );
}

function Tip({ color, text_color, icon, text }) {
  return (
    <div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 8, padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ color: color }}>{icon}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}
