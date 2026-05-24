import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { syncUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await syncUser({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
          setDbUser(res.data.user);
          localStorage.setItem('reviewai_user_id', res.data.user.id);
          localStorage.setItem('reviewai_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to sync user:', err);
        }
      } else {
        setDbUser(null);
        localStorage.removeItem('reviewai_user_id');
        localStorage.removeItem('reviewai_user');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to ReviewAI!');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Login failed. Please try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
