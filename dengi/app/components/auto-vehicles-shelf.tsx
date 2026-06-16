"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AutoVehicleAddDialog } from "@/app/components/auto-vehicle-add-dialog";
import { AutoVehicleAddedDialog } from "@/app/components/auto-vehicle-added-dialog";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { AutoVehiclesCarousel } from "@/app/components/auto-vehicles-carousel";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import type { AutoVehicle, AutoVehicleDraft } from "@/lib/auto-vehicles/vehicle";

function Shelf({
  title,
  onAddLabel,
  onAdd,
  headerAction,
  children,
}: {
  title: string;
  onAddLabel: string;
  onAdd: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
          {headerAction}
        </div>
        <BubbleAddButton ariaLabel={onAddLabel} onClick={onAdd} />
      </div>
      {children}
    </section>
  );
}

export function AutoVehiclesShelf() {
  const router = useRouter();
  const { activeVehicles, addVehicle } = useAutoVehicles();
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);
  const [addedVehicle, setAddedVehicle] = useState<AutoVehicle | null>(null);

  const handleContinueToVehicle = useCallback(() => {
    setAddedVehicle((current) => {
      if (!current) {
        return null;
      }

      router.push(`/auto/${current.id}`);
      return null;
    });
  }, [router]);

  function handleAdd(draft: AutoVehicleDraft) {
    const saved = addVehicle(draft);

    if (!saved) {
      return;
    }

    setAddedVehicle(saved);
  }

  return (
    <>
      <Shelf
        title="Авто"
        onAddLabel="Добавить авто"
        onAdd={() => {
          setAddSession((current) => current + 1);
          setAddOpen(true);
        }}
        headerAction={
          <Link
            href="/auto/archive"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Архив
          </Link>
        }
      >
        <AutoVehiclesCarousel vehicles={activeVehicles} />
      </Shelf>

      <AutoVehicleAddDialog
        key={addSession}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      <AutoVehicleAddedDialog
        open={addedVehicle != null}
        vehicle={addedVehicle}
        onContinue={handleContinueToVehicle}
      />
    </>
  );
}
