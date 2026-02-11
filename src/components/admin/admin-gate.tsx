"use client";

import { useIsAdmin } from "@/hooks/use-is-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <div className="container mx-auto mt-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
