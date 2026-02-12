"use client";

import LoginForm from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
            <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
