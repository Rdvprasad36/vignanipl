'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToLeaderboard, getTeamDetails } from '@/lib/firestore';
import Link from 'next/link';

export default function ResultsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);


  useEffect(() => {
    const unsub = subscribeToLeaderboard(setTeams);
    return () => unsub();
  }, []);

  const ranked = [...teams].sort((a, b) =>
    (b.finalStars || b.currentStars || 0) - (a.finalStars || a.currentStars || 0) ||
    (b.finalCoins || b.totalCoins || 0) - (a.finalCoins || a.totalCoins || 0)
  );

  const winner = ranked[0];
  const isTie  = ranked.length > 1 && (ranked[0]?.finalStars || ranked[0]?.currentStars) === (ranked[1]?.finalStars || ranked[1]?.currentStars);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #001f40, #004182, #1565c0)',
          borderRadius: 24, padding: '40px 32px', color: '#fff',
          textAlign: 'center', marginBottom: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.07 }}>🏆</div>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🏆</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>Final Standings</h1>
          <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>Ranked by Final Star Rating · Tie-break: Highest Remaining Coins</p>

          {winner && (
            <div style={{
              marginTop: 24, background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)',
              borderRadius: 16, padding: '16px 24px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' }}>🥇 Champion</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{winner.teamName}</div>
              <div style={{ color: '#FFD700', fontWeight: 700 }}>⭐ {(winner.finalStars || winner.currentStars || 0).toFixed(2)} Stars</div>
            </div>
          )}

          {isTie && (
            <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 20px', display: 'inline-block', border: '1px solid rgba(239,68,68,0.4)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>⚡ TIE DETECTED! Rapid Fire will determine the Champion!</span>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="card" style={{ overflowX: 'auto', marginBottom: 24 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
            📊 Complete Rankings
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>Updates in real-time</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                {['Rank', 'Team Name', 'Players', 'Coins Left', 'Current ⭐', 'Final ⭐'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((team, i) => (
                <tr key={team.uid || i} style={{
                  background: i === 0 ? 'rgba(255,215,0,0.05)' : i === 1 ? 'rgba(192,192,192,0.03)' : i === 2 ? 'rgba(205,127,50,0.03)' : 'transparent',
                }}>
                  <td style={{ padding: '12px 16px', fontSize: '1.2rem' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {team.teamName}
                    {team.uid === user?.uid && <span style={{ marginLeft: 6, fontSize: '0.72rem', background: 'var(--vignan-blue)', color: '#fff', borderRadius: 99, padding: '1px 6px' }}>You</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{team.teamPlayers?.length || 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="coin-pill" style={{ fontSize: '0.8rem' }}>💰 {(team.finalCoins ?? team.totalCoins ?? 0).toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--vignan-blue)' }}>⭐ {(team.currentStars || 0).toFixed(1)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: team.finalStars ? '#f59e0b' : 'var(--text-muted)', fontSize: '1rem' }}>
                    {team.finalStars ? `⭐ ${team.finalStars.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
              {ranked.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No results yet. Waiting for teams to submit.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '12px 28px' }}>← Back to Dashboard</Link>
          {isTie && (
            <button className="btn btn-gold" onClick={() => setRapidFire(true)} style={{ padding: '12px 28px', fontWeight: 800 }}>
              ⚡ Rapid Fire Tie-Break!
            </button>
          )}
        </div>
      </div>

      {/* Rapid Fire Modal */}
      {rapidFire && <RapidFireModal onClose={() => setRapidFire(false)} />}
    </div>
  );
}

function RapidFireModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card bounce-in" style={{ maxWidth: 500, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Rapid Fire!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          Sudden-death quiz to break the tie. The first team to answer correctly wins! Admin will initiate this separately.
        </p>
        <button className="btn btn-gold" onClick={onClose} style={{ width: '100%', padding: '12px' }}>Got it!</button>
      </div>
    </div>
  );
}
