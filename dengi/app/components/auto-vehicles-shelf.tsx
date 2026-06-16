"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AutoVehiclesCarousel } from "@/app/components/auto-vehicles-carousel";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";

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
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          aria-label={onAddLabel}
        >
          Добавить
        </button>
      </div>
      {children}
    </section>
  );
}

export function AutoVehiclesShelf() {
  const router = useRouter();
  const { activeVehicles } = useAutoVehicles();

  return (
    <Shelf
      title="Авто"
      onAddLabel="Добавить авто"
      onAdd={() => router.push("/auto/new")}
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
  );
}
