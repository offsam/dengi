"use client";

import { useMemo } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { CarIconImage } from "@/app/components/car-icon-image";
import { UsdAmount } from "@/app/components/usd-amount";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { resolveBodyTypeIcon } from "@/lib/car-icons";
import { computeAutoVehicleLoanStats } from "@/lib/auto-vehicles/records/loan-stats";
import { CREDIT_STATS_PROGRESS_CAR_OFFSET_Y_PX } from "@/lib/auto-vehicles/credit-stats-layout";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import { FictionalCarSilhouette } from "@/lib/auto-vehicles/fictional-car";

function resolveLoanPaidProgress(stats: ReturnType<typeof computeAutoVehicleLoanStats>) {
  if (stats.paymentsTotal <= 0) {
    return null;
  }

  const paymentsDone = Math.max(0, Math.min(stats.paymentsTotal, stats.loanPaymentsCount));
  const percent = Math.min(100, (paymentsDone / stats.paymentsTotal) * 100);

  return {
    loanTotal: stats.loanAmount,
    paidPrincipal: stats.paidPrincipal,
    percent,
  };
}

function formatProgressPercent(value: number) {
  return `${Math.round(value)}%`;
}

const carThumbClassName =
  "relative z-[1] block h-[53px] w-[69px] shrink-0 object-contain object-bottom opacity-100";

/** Дорожка progress bar — стеклянный пузырь, оставшийся путь читается лучше */
const progressTrackClassName =
  "h-3 overflow-hidden rounded-full border border-white/90 bg-white/30 shadow-[0_4px_14px_-8px_rgba(90,80,65,0.28),inset_0_1px_5px_rgba(55,50,45,0.14),inset_0_-1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl backdrop-saturate-150";

/** Зелёное заполнение — такой же пузырь с бликом и объёмом */
const progressFillClassName =
  "absolute inset-y-[1px] left-[1px] overflow-hidden border border-white/55 bg-gradient-to-b from-[#7BCFB0] via-[#5DAA8C] to-[#48946F] shadow-[inset_0_1px_4px_rgba(255,255,255,0.45),inset_0_-1px_3px_rgba(36,72,58,0.28),0_1px_4px_-2px_rgba(93,170,140,0.45)]";

function progressFillRadius(trailWidth: number) {
  return trailWidth >= 100 ? "9999px" : "9999px 0 0 9999px";
}

/** Прогресс выплаты кредита — зелёный след слева, машина внутри полоски на границе */
export function AutoVehicleLoanPaidProgress({ vehicle }: { vehicle: AutoVehicle }) {
  const { t } = useLocale();
  const { allVehicleRecords } = useAutoVehicleRecords(vehicle.id);
  const bodyTypeIcon = resolveBodyTypeIcon(vehicle.bodyIconId);

  const progress = useMemo(() => {
    const stats = computeAutoVehicleLoanStats(vehicle, allVehicleRecords);
    const showLoan =
      vehicle.financingType !== "cash" &&
      (stats.loanAmount > 0 || stats.monthlyPayment > 0 || stats.paymentsTotal > 0);

    if (!showLoan) {
      return null;
    }

    return resolveLoanPaidProgress(stats);
  }, [vehicle, allVehicleRecords]);

  if (!progress) {
    return null;
  }

  const { loanTotal, paidPrincipal, percent } = progress;
  const carLeft = percent <= 0 ? 0 : percent >= 100 ? 100 : percent;
  const trailWidth = percent >= 100 ? 100 : Math.max(percent, 0);

  const carThumb = (
    <CarIconImage
      fileName={bodyTypeIcon.fileName}
      variant="progress"
      align="bottom"
      className={carThumbClassName}
      fallback={
        <FictionalCarSilhouette
          bodyColorHex={vehicle.bodyColorHex}
          wheelColorHex={vehicle.wheelColorHex}
          className={carThumbClassName}
        />
      }
    />
  );

  return (
    <div
      className="px-1"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("auto.loanProgress.ariaLabel")}
    >
      <div className="relative h-[54px] w-full overflow-visible">
        <div
          className={`absolute inset-x-0 top-[34px] -translate-y-1/2 ${progressTrackClassName}`}
        >
          <div
            className="pointer-events-none absolute inset-x-[8%] top-0 h-[45%] rounded-full bg-gradient-to-b from-white/55 to-transparent"
            aria-hidden
          />
          {trailWidth > 0 ? (
            <div
              className={progressFillClassName}
              style={{
                width: trailWidth >= 100 ? "calc(100% - 2px)" : `calc(${trailWidth}% - 1px)`,
                borderRadius: progressFillRadius(trailWidth),
              }}
            >
              <div
                className="pointer-events-none absolute inset-x-[8%] top-0 h-[45%] rounded-full bg-gradient-to-b from-white/55 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-[18%] top-[-10%] h-[38%] rounded-[50%] bg-gradient-to-b from-white/35 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/[0.1] to-transparent"
                aria-hidden
              />
            </div>
          ) : null}
        </div>

        <div
          className="pointer-events-none absolute top-[34px] z-[2] -translate-x-[38%] -translate-y-1/2"
          style={{ left: `${carLeft}%` }}
        >
          <div className="relative">
            <span className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 translate-y-[10px] whitespace-nowrap text-[13px] font-semibold tabular-nums leading-none text-[#5DAA8C]">
              {formatProgressPercent(percent)}
            </span>
            <div style={{ transform: `translateY(${CREDIT_STATS_PROGRESS_CAR_OFFSET_Y_PX}px)` }}>
              {carThumb}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-10 flex items-baseline justify-between gap-2 text-[14px] leading-tight text-zinc-500">
          <span>
            <UsdAmount
              amount={paidPrincipal}
              exact
              className="text-[14px] font-semibold leading-none tracking-tight tabular-nums text-[#5DAA8C]"
            />{" "}
            {t("auto.loanProgress.paid")}
          </span>
          <span>
            {t("auto.loanProgress.of")}{" "}
            <UsdAmount amount={loanTotal} exact className="text-[14px] font-medium text-zinc-900" />
          </span>
        </div>
      </div>
    </div>
  );
}
