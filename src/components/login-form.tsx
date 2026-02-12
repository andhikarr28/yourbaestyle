"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useFirestore, useAuth as useFirebaseAuth } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  const handleLoginOrSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!auth || !firestore) {
      setError("Firebase not initialized.");
      setLoading(false);
      return;
    }

    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (signInError: any) {
      // If sign-in fails because the user doesn't exist, try to sign them up.
      // 'auth/invalid-credential' can mean user not found or wrong password.
      if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Determine role based on email for the two test accounts
          const role = email === 'admin@gmail.com' ? 'Admin' : 'Pegawai';

          // Create user profile in Firestore
          const userDocRef = doc(firestore, "users", user.uid);
          const userProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.email, // Default displayName to email
            role: role,
          };
          
          // Wait for the user profile to be created before redirecting
          await setDoc(userDocRef, userProfile, { merge: true });

          router.push("/");
        } catch (signUpError: any) {
          // If sign up fails with 'email-already-in-use', it means the user exists
          // and the original error was a wrong password.
          if (signUpError.code === 'auth/email-already-in-use') {
            setError("Invalid credentials. Please check your password.");
          } else {
            setError(signUpError.message);
          }
        }
      } else {
        // Handle other sign-in errors
        setError(signInError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account. New accounts will be created automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLoginOrSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login / Sign Up"}
          </Button>
          <div className="text-center text-xs text-muted-foreground pt-2 space-y-1">
            <p>Use <code className="bg-muted p-1 rounded-sm">pegawai@gmail.com</code> / <code className="bg-muted p-1 rounded-sm">pegawai123</code></p>
            <p>or <code className="bg-muted p-1 rounded-sm">admin@gmail.com</code> / <code className="bg-muted p-1 rounded-sm">admin123</code></p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
