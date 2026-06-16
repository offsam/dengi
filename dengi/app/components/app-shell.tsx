"use client";

import { FloatingAssistant } from "@/app/components/floating-assistant";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingAssistant />
    </>
  );
}
