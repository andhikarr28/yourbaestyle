"use client";

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { useUser, useFirestore, useDoc, useAuth as useFirebaseAuth, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Skeleton } from './ui/skeleton';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const firebaseAuth = useFirebaseAuth();

  const userDocRef = useMemoFirebase(() => 
    (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, 
    [firestore, authUser]
  );
  
  const { data: userDoc, isLoading: isDocLoading, error: docError } = useDoc<Partial<Omit<UserProfile, 'uid' | 'email' | 'displayName'>>>(userDocRef);

  useEffect(() => {
    if (firestore && authUser && !userDoc && !isDocLoading && !docError) {
      console.log(`Creating user profile for ${authUser.uid}`);
      const newUserProfile = {
        email: authUser.email,
        displayName: authUser.displayName || authUser.email?.split('@')[0],
        role: authUser.email === 'admin@example.com' ? 'admin' : 'member',
      };
      setDoc(doc(firestore, 'users', authUser.uid), newUserProfile, { merge: true });
    }
  }, [firestore, authUser, userDoc, isDocLoading, docError]);

  const user = useMemo<UserProfile | null>(() => {
    if (authUser) {
      return {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        role: userDoc?.role || 'member', 
        ...userDoc
      };
    }
    return null;
  }, [authUser, userDoc]);
  
  const loading = isAuthLoading || (!!authUser && isDocLoading);

  const logout = async () => {
    await signOut(firebaseAuth);
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
