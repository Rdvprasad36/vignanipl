'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GuidelinesModal from './GuidelinesModal';
import Image from 'next/image';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [dark]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-999 bg-(--bg-card) border-b border-(--border) transition-all duration-300 h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10`}
        style={{ 
          boxShadow: scrolled ? 'var(--shadow)' : 'none',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        {/* Logo + Title */}
        <div className="flex items-center gap-3 ml-4">
          <Link href="/" className="flex items-center gap-3 no-underline group">
          <div>          </div>
          <div>          </div>
          <div>          </div>
          <div>          </div>
          <div>          </div>
          <div>          </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Vignan_logo.png" 
                alt="Vignan Logo"
                className="w-full h-full object-contain"
                width={40}
                height={40}
              />
            </div>
          </Link>
          <div className="flex flex-col justify-center">
            <div className="hidden md:block text-[0.55rem] text-(--text-secondary) font-bold tracking-widest uppercase leading-none mb-0.5">Vignan&apos;s Institute of Information & Technology</div>
            <div className="text-sm sm:text-base md:text-lg font-black text-(--vignan-blue) leading-none">IPL Quiz & Auction</div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            id="guidelines-btn"
            className="btn btn-outline"
            onClick={() => setShowGuidelines(true)}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
             Rules
          </button>

          <button
            id="theme-toggle-btn"
            onClick={() => setDark(!dark)}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center text-lg cursor-pointer transition-all hover:bg-[var(--bg-secondary)]"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              {profile?.role === 'admin' ? (
                <Link href="/admin" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                   Admin Panel
                </Link>
              ) : (
                <Link href="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                   Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
               Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center text-lg"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          >
            <span className={`w-6 h-0.5 bg-[var(--vignan-blue)] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[var(--vignan-blue)] transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[var(--vignan-blue)] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`fixed left-0 right-0 top-16 bottom-0 bg-(--bg-primary) z-999 transition-transform duration-300 lg:hidden flex flex-col p-6 gap-6 ${menuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}
             style={{ 
               backgroundColor: 'var(--bg-primary)', // Ensure solid background
               height: 'calc(100vh - 64px)',
               overflowY: 'auto'
             }}>
          <div className="flex flex-col gap-5">
            <button
              className="btn btn-outline w-full py-4 text-center justify-center text-lg font-bold"
              onClick={() => { setShowGuidelines(true); setMenuOpen(false); }}
            >
               View Rules
            </button>

            {user ? (
              <>
                {profile?.role === 'admin' ? (
                  <Link href="/admin" className="btn btn-primary w-full py-4 text-center justify-center text-lg font-bold" onClick={() => setMenuOpen(false)}>
                     Admin Panel
                  </Link>
                ) : (
                  <Link href="/dashboard" className="btn btn-primary w-full py-4 text-center justify-center text-lg font-bold" onClick={() => setMenuOpen(false)}>
                     Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full py-4 text-center justify-center text-lg font-bold"
                >
                  Logout
                </button>
                
              </>
            ) : (
              <Link href="/login" className="btn btn-primary w-full py-4 text-center justify-center text-lg font-bold" onClick={() => setMenuOpen(false)}>
                 Login
              </Link>
              
            )}
            
          </div>
          
          <div className="mt-auto py-8 text-center border-t border-[var(--border)]">
            <div className="text-[0.65rem] text-[var(--text-secondary)] font-bold tracking-[0.2em] uppercase mb-1">Vignan&apos;s Institute of Information & Technology</div>
            <div className="text-xs text-[var(--text-muted)] italic">IPL Quiz & Auction 2026</div>
           
          </div>
        </div>
         
      </nav>

      <GuidelinesModal open={showGuidelines} onClose={() => setShowGuidelines(false)} />
    </>
    
  );
}

