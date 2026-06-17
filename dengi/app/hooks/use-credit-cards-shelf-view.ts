"use client";

import { useHomeShelfView } from "@/app/hooks/use-home-shelf-view";

export function useCreditCardsShelfView() {
  return useHomeShelfView("creditCards");
}
