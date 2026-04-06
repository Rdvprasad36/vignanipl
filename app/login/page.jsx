'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserDoc } from '@/lib/firestore';
import { Suspense } from 'react';

function LoginForm() {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminHint = searchParams.get('admin') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, teamName, password);
      const profile = await getUserDoc(cred.user.uid);
      if (profile?.role === 'admin') router.push('/admin');
      else router.push('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('Account not found. New teams must register first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Check your credentials.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px 40px',
    }}>
      <div className="card phase-enter" style={{ width: '100%', maxWidth: 440, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>
            {isAdminHint ? 'Admin Login' : 'Team Login'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdminHint ? 'Access the admin control panel' : 'Welcome back! Sign in to your team.'}
          </p>
        </div>

        {isAdminHint && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,65,130,0.15), rgba(66,165,245,0.1))', 
            borderRadius: 12, padding: '16px 20px',
            marginBottom: 24, fontSize: '0.9rem', color: '#1e3a8a', 
            border: '2px solid rgba(0,65,130,0.3)', boxShadow: '0 4px 12px rgba(0,65,130,0.15)',
            fontWeight: 600
          }}>
            🔐 <strong>ADMIN LOGIN</strong><br/>
            📧 Use your admin email / password<br/>
            💡 First admin: /setup-admin | Additional: /new-admin
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>📧 Email / Team Name</label>
            <input
              id="login-teamname"
              type="text"
              className="input"
              placeholder="Your Team Name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 8, padding: '13px', fontSize: '0.95rem', width: '100%' }}
          >
            {loading ? 'Signing in…' : '🏏 Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          New team?{' '}
          <Link href="/register" style={{ color: 'var(--vignan-blue)', fontWeight: 600, textDecoration: 'none' }}>
            Register here →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
