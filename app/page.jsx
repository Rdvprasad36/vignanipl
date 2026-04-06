'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && user && profile) {
      router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, profile, loading, router]);

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #001f40 0%, #004182 45%, #1565c0 80%, #0d47a1 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px 40px',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
            top: `${Math.random() * 80 + 5}%`,
            left: `${Math.random() * 80 + 5}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }} />
        ))}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(65,133,255,0.12) 0%, transparent 70%)' }} />
      </div>

      <div className="phase-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', maxWidth: 600, textAlign: 'center', position: 'relative' }}>
        {/* Logo + Cricket Ball */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div className="float" style={{
            fontSize: '5rem', lineHeight: 1,
            filter: 'drop-shadow(0 8px 32px rgba(255,215,0,0.5))',
          }}>🏏</div>
          <div style={{
            position: 'absolute', top: -8, right: -16,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--gradient-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: '#1a0a00',
            boxShadow: '0 2px 8px rgba(255,215,0,0.5)',
            animation: 'bounceIn 0.5s 0.5s both',
          }}>★</div>
        </div>

        {/* Title */}
        <div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            Vignan's Institute of Information & Technology Presents
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1,
            textShadow: '0 4px 32px rgba(0,0,0,0.3)',
          }}>
            IPL Quiz &<br />
            <span style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Auction 2026
            </span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', marginTop: 16, lineHeight: 1.6, maxWidth: 480, margin: '16px auto 0' }}>
            Answer IPL trivia, earn virtual coins, and bid on your favourite superstars. Build the ultimate squad to win!
          </p>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '🔄', label: '13 Rounds' },
            { icon: '🏆', label: '30 Players' },
            { icon: '💰', label: '2,000 Starting Coins' },
            { icon: '⭐', label: 'Star Ratings' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
              fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {icon} {label}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/register"
            id="register-btn"
            className="btn btn-gold pulse-glow"
            style={{ fontSize: '1rem', padding: '14px 36px', fontWeight: 800 }}
          >
            🚀 Register Team
          </Link>
          <Link
            href="/login"
            id="login-btn"
            className="btn"
            style={{
              fontSize: '1rem', padding: '14px 36px', fontWeight: 700,
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '2px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            🔐 Login
          </Link>
          <Link
            href="/login?admin=true"
            id="admin-login-btn"
            className="btn"
            style={{
              fontSize: '0.88rem', padding: '12px 24px', fontWeight: 600,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            ⚙️ Admin
          </Link>
        </div>

        {/* Bottom card */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 24px',
          border: '1px solid rgba(255,255,255,0.15)', marginTop: 8,
          fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)',
        }}>
          🏏 Max Earnings per Round: <strong style={{ color: '#FFD700' }}>600 Coins</strong> &nbsp;|&nbsp;
          🎯 Max across 13 rounds: <strong style={{ color: '#FFD700' }}>7,800 Coins</strong> &nbsp;|&nbsp;
          📋 Final squad: 11 + 1 Impact
        </div>
      </div>

      {/* Wave bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, overflow: 'hidden' }}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" fill="var(--bg-primary)" />
        </svg>
      </div>
    </div>
  );
}
