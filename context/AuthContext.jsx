'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserDoc } from '@/lib/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth State Changed:', firebaseUser?.email || 'Logged Out');
      if (firebaseUser) {
        setUser(firebaseUser);
        // Safety timeout for Firestore fetching
        const fetchTimeout = setTimeout(() => {
          if (loading) {
            console.warn('Profile fetch taking too long, proceeding...');
            setLoading(false);
          }
        }, 5000);

        try {
          const doc = await getUserDoc(firebaseUser.uid);
          console.log('Profile Loaded:', doc?.role || 'No Profile');
          setProfile(doc);
          if (doc) localStorage.setItem('userProfile', JSON.stringify(doc));
        } catch (err) {
          console.error('Error fetching profile:', err);
        } finally {
          clearTimeout(fetchTimeout);
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('userProfile');
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [loading]);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    console.warn('AuthContext is null. Returning default values.');
    return { user: null, profile: null, loading: true, logout: () => {}, setProfile: () => {} };
  }
  return context;
};
