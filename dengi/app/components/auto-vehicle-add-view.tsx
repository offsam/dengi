"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AutoVehicleAddedDialog } from "@/app/components/auto-vehicle-added-dialog";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { buildVehicleDisplayHeading, createEmptyAutoVehicleDraft, toAutoVehicleDraft } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

export function AutoVehicleAddView() {
  const router = useRouter();
  const { addVehicle } = useAutoVehicles();
  const [draft, setDraft] = useState<AutoVehicle>(() => ({
    ...createEmptyAutoVehicleDraft(),
    id: "new",
  }));
  const [addedVehicle, setAddedVehicle] = useState<AutoVehicle | null>(null);

  const heading = buildVehicleDisplayHeading(draft.catalogId, draft.year);

  function patchDraft(patch: Partial<AutoVehicle>) {
    setDraft((current) => ({ ...current, ...patch, id: current.id }));
  }

  const handleContinueToVehicle = useCallback(() => {
    setAddedVehicle((current) => {
      if (!current) {
        return null;
      }

      router.push(`/auto/${current.id}`);
      return null;
    });
  }, [router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = addVehicle(toAutoVehicleDraft(draft));

    if (!saved) {
      return;
    }

    setAddedVehicle(saved);
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Отмена
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              Новый автомобиль
            </p>
            {heading.secondary ? (
              <p className="truncate text-xs text-zinc-500">
                {heading.primary} · {heading.secondary}
              </p>
            ) : (
              <p className="truncate text-xs text-zinc-500">{heading.primary}</p>
            )}
          </div>
          <span className="w-[52px]" aria-hidden />
        </header>

        <AutoVehicleDetailHero vehicle={draft} />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <AutoVehicleFormFields draft={draft} onPatch={patchDraft} showFinancingPicker />

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Добавить автомобиль
          </button>
        </form>
      </main>

      <AutoVehicleAddedDialog
        open={addedVehicle != null}
        vehicle={addedVehicle}
        onContinue={handleContinueToVehicle}
      />
    </div>
  );
}
