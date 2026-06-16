"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** true только после гидрации — одинаково на сервере и при первом клиентском рендере */
export function useClientMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
