'use client';

export default function GameHeader({ game, coins, stars }) {
  const difficultyDetails = [
    { d: 'Easy', time: '15s', pts: '+100', pen: '-20',  color: '#16a34a' },
    { d: 'Medium', time: '30s', pts: '+200', pen: '-50',  color: '#d97706' },
    { d: 'Hard',   time: '45s', pts: '+300', pen: '-100', color: '#dc2626' },
  ];

  const statusLabel = { waiting: 'Waiting', quiz: 'Quiz Active', auction: 'Auction', finished: 'Game Over' };

  return (
    <div style={{
      position: 'relative', zIndex: 10,
      background: 'var(--glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        {/* Round */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: 'var(--gradient)',
            color: '#fff', borderRadius: 8, padding: '4px 12px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            Round {game?.currentRound || 0} / 13
          </div>
          <div style={{
            fontSize: '0.75rem', padding: '3px 10px', borderRadius: 99,
            background: game?.status === 'quiz' ? '#dbeafe' : game?.status === 'auction' ? '#ede9fe' : '#f3f4f6',
            color: game?.status === 'quiz' ? '#1e40af' : game?.status === 'auction' ? '#5b21b6' : '#374151',
            fontWeight: 600,
          }}>
            {statusLabel[game?.status] || 'Waiting'}
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', display: 'none', '@media(minWidth:640px)': { display: 'block' } }} />

        {/* Points rules */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {difficultyDetails.map(d => (
            <div key={d.d} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '3px 10px',
              fontSize: '0.72rem', fontWeight: 600,
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              <span style={{ color: d.color }}>{d.d}</span>
              <span style={{ color: 'var(--text-muted)' }}>{d.time}</span>
              <span style={{ color: '#16a34a' }}>{d.pts}</span>
              <span style={{ color: '#dc2626' }}>{d.pen}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Coins + Stars */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="coin-pill" id="header-coins">💰 {coins?.toLocaleString()}</span>
          <div style={{
            background: 'linear-gradient(135deg,#1e3a5f,#004182)',
            color: '#FFD700', borderRadius: 99, padding: '4px 14px',
            fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ⭐ {stars?.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
