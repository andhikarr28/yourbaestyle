"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { Skeleton } from './ui/skeleton';

// A mock function to get user profile, including role.
// In a real app, this would fetch from Firestore.
const getMockUserProfile = (user: User): UserProfile => {
  // For demonstration, we'll assign roles based on email.
  if (user.email === 'admin@example.com') {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Admin User',
      role: 'admin',
    };
  }
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Employee',
    role: 'member',
  };
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // In a real app, you'd fetch the user's profile and role from Firestore here.
        const userProfile = getMockUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (firebaseUser: User) => {
    const userProfile = getMockUserProfile(firebaseUser);
    setUser(userProfile);
  };
  
  const logout = () => {
    auth.signOut().then(() => setUser(null));
  };

  const value = { user, loading, login, logout };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-64 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
