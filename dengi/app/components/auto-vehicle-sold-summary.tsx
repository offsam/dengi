"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmount } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import {
  DEBIT_CASH_ACCOUNTS,
  formatDebitCashAccountLabel,
} from "@/lib/dashboard/debit-accounts";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/40 px-4 py-2.5 last:border-b-0">
      <span className="text-[15px] leading-tight text-zinc-900">{label}</span>
      <span className="text-right text-[15px] font-medium tabular-nums text-zinc-900">
        {value}
      </span>
    </div>
  );
}

export function AutoVehicleSoldSummary({ vehicle }: { vehicle: AutoVehicle }) {
  const { lang, t } = useLocale();
  const wallet = DEBIT_CASH_ACCOUNTS.find((account) => account.id === vehicle.soldWalletId);
  const showUnpaidLoan = Boolean(vehicle.soldIgnoreLoanPayoff && vehicle.remaining > 0);

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {t("auto.soldSummary.sectionTitle")}
      </h2>
      <BubbleCard>
        <InfoRow
          label={t("auto.soldSummary.date")}
          value={vehicle.soldAt ? formatAppDateNumeric(vehicle.soldAt) : t("common.dash")}
        />
        <InfoRow
          label={t("auto.soldSummary.soldPrice")}
          value={<UsdAmount amount={vehicle.soldPrice ?? 0} exact />}
        />
        {(vehicle.soldLoanPayoff ?? 0) > 0 ? (
          <InfoRow
            label={t("auto.soldSummary.toLoan")}
            value={<UsdAmount amount={vehicle.soldLoanPayoff ?? 0} exact />}
          />
        ) : null}
        {showUnpaidLoan ? (
          <InfoRow
            label={t("auto.soldSummary.bankRemaining")}
            value={<UsdAmount amount={vehicle.remaining} exact />}
          />
        ) : null}
        <InfoRow
          label={t("auto.soldSummary.toAccount")}
          value={<UsdAmount amount={vehicle.soldWalletAmount ?? 0} exact />}
        />
        <InfoRow
          label={t("auto.soldSummary.wallet")}
          value={wallet ? formatDebitCashAccountLabel(wallet, lang) : t("common.dash")}
        />
      </BubbleCard>
      {vehicle.soldIgnoreLoanPayoff ? (
        <p className="px-1 text-xs leading-snug text-zinc-500">{t("auto.soldSummary.ignoreHint")}</p>
      ) : null}
    </section>
  );
}
