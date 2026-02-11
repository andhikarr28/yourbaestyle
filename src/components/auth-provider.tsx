"use client";

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { signOut, signInAnonymously } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firebaseAuth = useFirebaseAuth();

  useEffect(() => {
    if (firebaseAuth && !isAuthLoading && !authUser) {
      signInAnonymously(firebaseAuth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
      });
    }
  }, [isAuthLoading, authUser, firebaseAuth]);

  const user = useMemo<UserProfile | null>(() => {
    if (authUser) {
      return {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      };
    }
    return null;
  }, [authUser]);
  
  const loading = isAuthLoading || !user;

  const logout = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
      // After signing out, a new anonymous user will be created by the useEffect hook.
    }
  };
  
  const value = { user, loading, logout };

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
