"use client";

import { useEffect } from "react";
import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function formatAddedVehicleLabel(vehicle: AutoVehicle) {
  return buildVehicleDisplayTitle(vehicle.catalogId, vehicle.year);
}

export function AutoVehicleAddedDialog({
  open,
  vehicle,
  onContinue,
}: {
  open: boolean;
  vehicle: AutoVehicle | null;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (!open || !vehicle) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter") {
        onContinue();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    const timer = window.setTimeout(onContinue, 2800);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, vehicle, onContinue]);

  if (!open || !vehicle) {
    return null;
  }

  const vehicleLabel = formatAddedVehicleLabel(vehicle);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auto-added-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Перейти к автомобилю"
        onClick={onContinue}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-50 px-5 py-5 shadow-xl ring-1 ring-zinc-200/60">
        <h2
          id="auto-added-title"
          className="text-center text-base font-semibold tracking-tight text-zinc-900"
        >
          Поздравляем!
        </h2>
        <p className="mt-3 text-center text-sm leading-snug text-zinc-600">
          Ваш{" "}
          <span className="font-semibold text-zinc-900">{vehicleLabel}</span> добавлен в гараж.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          onClick={onContinue}
        >
          Перейти к автомобилю
        </button>
      </div>
    </div>
  );
}
