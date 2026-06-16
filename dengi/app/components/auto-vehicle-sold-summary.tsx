"use client";

import { UsdAmount } from "@/app/components/usd-amount";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import {
  DEBIT_CASH_ACCOUNTS,
  formatDebitCashAccountLabel,
} from "@/lib/dashboard/debit-accounts";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 px-4 py-2.5 last:border-b-0">
      <span className="text-[15px] leading-tight text-zinc-900">{label}</span>
      <span className="text-right text-[15px] font-medium tabular-nums text-zinc-900">
        {value}
      </span>
    </div>
  );
}

export function AutoVehicleSoldSummary({ vehicle }: { vehicle: AutoVehicle }) {
  const wallet = DEBIT_CASH_ACCOUNTS.find((account) => account.id === vehicle.soldWalletId);
  const showUnpaidLoan = Boolean(vehicle.soldIgnoreLoanPayoff && vehicle.remaining > 0);

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Продажа
      </h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/60">
        <InfoRow
          label="Дата"
          value={vehicle.soldAt ? formatAppDateNumeric(vehicle.soldAt) : "—"}
        />
        <InfoRow label="Сумма продажи" value={<UsdAmount amount={vehicle.soldPrice ?? 0} exact />} />
        {(vehicle.soldLoanPayoff ?? 0) > 0 ? (
          <InfoRow
            label="На кредит"
            value={<UsdAmount amount={vehicle.soldLoanPayoff ?? 0} exact />}
          />
        ) : null}
        {showUnpaidLoan ? (
          <InfoRow
            label="Остаток в банке"
            value={<UsdAmount amount={vehicle.remaining} exact />}
          />
        ) : null}
        <InfoRow
          label="На счёт"
          value={<UsdAmount amount={vehicle.soldWalletAmount ?? 0} exact />}
        />
        <InfoRow
          label="Кошелёк"
          value={wallet ? formatDebitCashAccountLabel(wallet) : "—"}
        />
      </div>
      {vehicle.soldIgnoreLoanPayoff ? (
        <p className="px-1 text-xs leading-snug text-zinc-500">
          Кредит не погашался из выручки — вся сумма зачислена на счёт.
        </p>
      ) : null}
    </section>
  );
}
