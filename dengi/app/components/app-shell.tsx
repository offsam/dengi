"use client";

import { FloatingAssistant } from "@/app/components/floating-assistant";
import { LocaleProvider } from "@/app/components/locale-provider";
import { LocaleToggle } from "@/app/components/locale-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-3">
        <div className="pointer-events-auto flex w-full max-w-md justify-end">
          <LocaleToggle />
        </div>
      </div>
      <div className="pt-10">{children}</div>
      <FloatingAssistant />
    </LocaleProvider>
  );
}
