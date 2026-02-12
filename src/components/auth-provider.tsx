"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import type { UserProfile } from '@/types';
import { useUser as useAuthUser, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from './ui/skeleton';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useAuthUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemo(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  
  const { data: userProfileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const user = useMemo<UserProfile | null>(() => {
    if (authUser && userProfileData) {
      return {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        role: userProfileData.role,
      };
    }
    return null;
  }, [authUser, userProfileData]);

  const loading = isAuthLoading || (authUser && isProfileLoading);
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // If finished loading and no user is authenticated, redirect to login page.
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
    // If finished loading and a user is authenticated, but they are on the login page, redirect to home.
    if (!loading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, loading, router, isLoginPage]);

  // While loading, or if no user and not on login page, show a loader.
  // This prevents children from rendering prematurely.
  if (loading || (!user && !isLoginPage)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-64 space-y-4">
            <h1 className="text-2xl font-bold text-center">Loading...</h1>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }
  
  // If a user is logged in, or we are on the login page, render the children.
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
