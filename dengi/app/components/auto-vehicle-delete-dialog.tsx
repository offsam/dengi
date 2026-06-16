"use client";

import { useEffect, useState } from "react";
import { UsdAmount, UsdAmountInput } from "@/app/components/usd-amount";
import {
  DEBIT_CASH_ACCOUNTS,
  formatDebitCashAccountLabel,
} from "@/lib/dashboard/debit-accounts";
import type {
  AutoVehicle,
  AutoVehicleRemoveMode,
  AutoVehicleSoldDetails,
} from "@/lib/auto-vehicles/vehicle";

const OPTIONS: {
  mode: AutoVehicleRemoveMode;
  title: string;
  description: string;
  tone?: "danger";
}[] = [
  {
    mode: "with-records",
    title: "Удалить авто и все транзакции",
    description: "Машина, платежи и расходы по ней исчезнут без восстановления.",
    tone: "danger",
  },
  {
    mode: "sold",
    title: "Автомобиль продан",
    description: "Скрыть из гаража. История платежей и расходов сохранится.",
  },
  {
    mode: "vehicle-only",
    title: "Удалить только автомобиль",
    description: "Запись об авто удалится, транзакции останутся в данных.",
  },
];

const fieldClassName =
  "w-full min-w-0 border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 focus:ring-0";

function FormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 last:border-b-0">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 justify-end">{children}</div>
    </div>
  );
}

function hasLoanBalance(vehicle: AutoVehicle) {
  return (
    (vehicle.financingType === "credit" || vehicle.financingType === "leasing") &&
    vehicle.remaining > 0
  );
}

function clampLoanPayoff(price: number, payoff: number, remaining: number) {
  return Math.max(0, Math.min(payoff, price, remaining));
}

export function AutoVehicleDeleteDialog({
  open,
  vehicle,
  onClose,
  onConfirm,
}: {
  open: boolean;
  vehicle: AutoVehicle;
  onClose: () => void;
  onConfirm: (mode: AutoVehicleRemoveMode, sold?: AutoVehicleSoldDetails) => void;
}) {
  const [step, setStep] = useState<"choose" | "sold">("choose");
  const [soldPrice, setSoldPrice] = useState(0);
  const [soldLoanPayoff, setSoldLoanPayoff] = useState(0);
  const [soldWalletId, setSoldWalletId] = useState("dc-3");
  const [ignoreLoanPayoff, setIgnoreLoanPayoff] = useState(false);

  const showLoanFields = hasLoanBalance(vehicle);
  const effectiveLoanPayoff = showLoanFields && !ignoreLoanPayoff ? soldLoanPayoff : 0;
  const walletAmount = Math.max(0, soldPrice - effectiveLoanPayoff);

  function resetDialog() {
    setStep("choose");
    setSoldPrice(0);
    setSoldLoanPayoff(0);
    setSoldWalletId("dc-3");
    setIgnoreLoanPayoff(false);
  }

  function handleClose() {
    resetDialog();
    onClose();
  }

  function openSoldStep() {
    const initialPrice = Math.max(0, vehicle.marketPrice || 0);
    const initialPayoff = showLoanFields
      ? clampLoanPayoff(initialPrice, vehicle.remaining, vehicle.remaining)
      : 0;

    setSoldPrice(initialPrice);
    setSoldLoanPayoff(initialPayoff);
    setStep("sold");
  }

  function handleSoldPriceChange(nextPrice: number) {
    const price = Math.max(0, nextPrice);
    setSoldPrice(price);
    setSoldLoanPayoff((current) =>
      showLoanFields ? clampLoanPayoff(price, current, vehicle.remaining) : 0
    );
  }

  function handleSoldLoanPayoffChange(nextPayoff: number) {
    setSoldLoanPayoff(clampLoanPayoff(soldPrice, nextPayoff, vehicle.remaining));
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resetDialog();
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleChoose(mode: AutoVehicleRemoveMode) {
    if (mode === "sold") {
      openSoldStep();
      return;
    }

    onConfirm(mode);
    resetDialog();
  }

  function handleSoldConfirm() {
    onConfirm("sold", {
      soldPrice,
      soldLoanPayoff: effectiveLoanPayoff,
      soldWalletId,
      ignoreLoanPayoff: showLoanFields ? ignoreLoanPayoff : undefined,
    });
    resetDialog();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-auto-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-50 px-4 py-4 shadow-xl ring-1 ring-zinc-200/60">
        {step === "choose" ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="delete-auto-title"
                className="text-sm font-semibold tracking-tight text-zinc-900"
              >
                Убрать автомобиль
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Отмена
              </button>
            </div>

            <ul className="space-y-2">
              {OPTIONS.map((option) => (
                <li key={option.mode}>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-zinc-200/60 transition-colors hover:bg-zinc-50"
                    onClick={() => handleChoose(option.mode)}
                  >
                    <span
                      className={`block text-[14px] font-semibold leading-tight ${
                        option.tone === "danger" ? "text-rose-600" : "text-zinc-900"
                      }`}
                    >
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-zinc-500">
                      {option.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="delete-auto-title"
                className="text-sm font-semibold tracking-tight text-zinc-900"
              >
                Продажа автомобиля
              </h2>
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Назад
              </button>
            </div>

            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200/60">
              {showLoanFields ? (
                <>
                  <FormRow label="Остаток долга">
                    <UsdAmount amount={vehicle.remaining} exact />
                  </FormRow>
                  <div className="flex min-h-[48px] items-center gap-3 border-b border-zinc-100 px-4 py-2.5">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={ignoreLoanPayoff}
                        onChange={(event) => setIgnoreLoanPayoff(event.target.checked)}
                        className="size-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                      />
                      <span className="text-[15px] leading-tight text-zinc-900">
                        Игнорировать остаток в банке
                      </span>
                    </label>
                  </div>
                </>
              ) : null}

              <FormRow label="Сумма продажи">
                <UsdAmountInput value={soldPrice} onChange={handleSoldPriceChange} />
              </FormRow>

              {showLoanFields && !ignoreLoanPayoff ? (
                <FormRow label="На кредит">
                  <UsdAmountInput
                    value={soldLoanPayoff}
                    onChange={handleSoldLoanPayoffChange}
                  />
                </FormRow>
              ) : null}

              <FormRow label="На счёт">
                <UsdAmount amount={walletAmount} exact />
              </FormRow>

              <FormRow label="Кошелёк">
                <select
                  className={`${fieldClassName} max-w-full truncate`}
                  value={soldWalletId}
                  onChange={(event) => setSoldWalletId(event.target.value)}
                >
                  {DEBIT_CASH_ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.id}>
                      {formatDebitCashAccountLabel(account)}
                    </option>
                  ))}
                </select>
              </FormRow>
            </div>

            {showLoanFields ? (
              <p className="mt-2 px-1 text-xs leading-snug text-zinc-500">
                {ignoreLoanPayoff
                  ? "Вся выручка поступит на выбранный счёт. Остаток в банке останется без изменений."
                  : "Из выручки сначала погашается кредит, остаток поступает на выбранный счёт."}
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              <button
                type="button"
                className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                onClick={handleSoldConfirm}
              >
                Подтвердить продажу
              </button>
              <button
                type="button"
                className="w-full py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                onClick={handleClose}
              >
                Отмена
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
