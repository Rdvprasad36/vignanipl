'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getGames } from '@/lib/firestore';
import { subscribeToUser } from '@/lib/firestore';

export default function DashboardPage() {
  const { user, profile, loading, logout } = useAuth();
  const [games, setGames] = useState([]);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && profile?.role === 'admin') router.push('/admin');
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUser(user.uid, setUserData);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    getGames().then(setGames);
  }, []);

  if (loading || !profile) return <LoadingScreen />;

  const activeGames = games.filter(g => g.isActive);
  const data = userData || profile;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome Card */}
        <div style={{
          background: 'var(--gradient)', borderRadius: 20, padding: '28px 32px',
          color: '#fff', marginBottom: 28, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '6rem', opacity: 0.12 }}>🏏</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Team Dashboard</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>👋 Welcome, {data.teamName}!</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Stat icon="💰" label="Coins" value={data.totalCoins?.toLocaleString()} />
            <Stat icon="⭐" label="Stars" value={data.currentStars?.toFixed(1)} />
            <Stat icon="🏏" label="Players" value={data.teamPlayers?.length || 0} />
            <Stat icon="🔄" label="Round" value={`${data.currentRound || 0}/13`} />
          </div>
        </div>

        {/* Active Games */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Active Games</h2>
        {activeGames.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 600 }}>No active games yet</div>
            <div style={{ fontSize: '0.88rem', marginTop: 4 }}>Waiting for admin to create a game…</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeGames.map(game => (
              <div key={game.id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>🏆 {game.gameName || 'IPL Quiz Game'}</div>
                  <StatusBadge status={game.status} />
                  {game.status === 'quiz' || game.status === 'auction' ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Round {game.currentRound} of 13
                    </div>
                  ) : null}
                </div>
                {game.status === 'waiting' ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
                    Waiting for admin…
                  </div>
                ) : game.status === 'finished' ? (
                  <Link href="/results" className="btn btn-gold" style={{ padding: '8px 20px' }}>View Results 🏆</Link>
                ) : (
                  <Link href={`/game/${game.id}`} id={`join-game-${game.id}`} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    Join Game →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Team Roster Preview */}
        {data.teamPlayers?.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '28px 0 16px' }}>Your Squad ({data.teamPlayers.length}/13)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {data.teamPlayers.map((p, i) => (
                <div key={i} className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <img src={p.photoUrl} alt={p.name} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 6 }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`role-badge role-${p.role}`}>{p.role}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>⭐ {p.stars}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(8px)' }}>
      <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    waiting: { color: '#f59e0b', bg: '#fef3c7', label: '⏳ Waiting' },
    quiz:    { color: '#2563eb', bg: '#dbeafe', label: '❓ Quiz Active' },
    auction: { color: '#7c3aed', bg: '#ede9fe', label: '🛒 Auction' },
    finished:{ color: '#16a34a', bg: '#dcfce7', label: '✅ Finished' },
  };
  const s = map[status] || map.waiting;
  return (
    <span style={{ color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '2rem' }}>🏏</div>
      <div style={{ color: 'var(--text-secondary)' }} className="loading-dots">Loading</div>
    </div>
  );
}
