"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AutoVehicleAddDialog } from "@/app/components/auto-vehicle-add-dialog";
import { AutoVehicleAddedDialog } from "@/app/components/auto-vehicle-added-dialog";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { AutoVehiclesCarousel } from "@/app/components/auto-vehicles-carousel";
import { ShelfViewToggle } from "@/app/components/shelf-view-toggle";
import { useLocale } from "@/app/components/locale-provider";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useHomeItemOrder } from "@/app/hooks/use-home-item-order";
import { useHomeShelfView } from "@/app/hooks/use-home-shelf-view";
import { useShelfViewFade } from "@/app/hooks/use-shelf-view-fade";
import type { AutoVehicle, AutoVehicleDraft } from "@/lib/auto-vehicles/vehicle";
import type { HomeShelfView } from "@/lib/home/shelf-view";

function Shelf({
  title,
  onAddLabel,
  onAdd,
  editOrder,
  headerAction,
  headerTrailing,
  children,
}: {
  title: string;
  onAddLabel: string;
  onAdd: () => void;
  editOrder: boolean;
  headerAction?: React.ReactNode;
  headerTrailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
          {!editOrder ? headerAction : null}
        </div>
        {!editOrder ? (
          <div className="flex shrink-0 items-center gap-2">
            {headerTrailing}
            <BubbleAddButton ariaLabel={onAddLabel} onClick={onAdd} />
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AutoVehiclesShelf({ editOrder = false }: { editOrder?: boolean }) {
  const { t } = useLocale();
  const router = useRouter();
  const { activeVehicles, addVehicle } = useAutoVehicles();
  const { orderedItems, moveItem } = useHomeItemOrder("autoVehicles", activeVehicles);
  const { view, setView } = useHomeShelfView("autoVehicles");
  const { displayView, visible, switchView } = useShelfViewFade(view);
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);
  const [addedVehicle, setAddedVehicle] = useState<AutoVehicle | null>(null);

  const handleViewChange = useCallback(
    (next: HomeShelfView) => {
      switchView(next, setView);
    },
    [setView, switchView]
  );

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
        title={t("shelf.auto")}
        onAddLabel={t("shelf.addAuto")}
        editOrder={editOrder}
        onAdd={() => {
          setAddSession((current) => current + 1);
          setAddOpen(true);
        }}
        headerAction={
          <Link
            href="/auto/archive"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {t("common.archive")}
          </Link>
        }
        headerTrailing={
          !editOrder ? <ShelfViewToggle view={view} onChange={handleViewChange} /> : null
        }
      >
        <div
          className={`transition-opacity duration-150 ease-out ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <AutoVehiclesCarousel
            vehicles={orderedItems}
            density={displayView === "minimal" ? "minimal" : "full"}
            editOrder={editOrder}
            onMoveItem={moveItem}
          />
        </div>
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
