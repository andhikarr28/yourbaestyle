"use client";

import { useAuth } from "@/components/auth-provider";

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "Admin";
}
