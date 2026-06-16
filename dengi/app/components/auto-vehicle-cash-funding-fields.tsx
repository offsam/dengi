"use client";

import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
import { FormRowEnd, UsdAmount, UsdAmountInput } from "@/app/components/usd-amount";
import { APP_BUBBLE_INSET_CONTROL } from "@/lib/app-theme";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import {
  createDefaultCashFunding,
  getVehicleCatalogEntry,
  getVehicleModelsForMake,
  normalizeCashFunding,
  VEHICLE_CATALOG_MAKES,
} from "@/lib/auto-vehicles";
import type {
  AutoVehicleCashFunding,
  AutoVehicleCashMethod,
  AutoVehicleTradePart,
} from "@/lib/auto-vehicles/vehicle";
import { getCreditCardBankName } from "@/lib/bank-logos";
import {
  DEBIT_CASH_ACCOUNTS,
  formatDebitCashAccountLabel,
} from "@/lib/dashboard/debit-accounts";
import { toAutoVehicleNumber } from "@/lib/auto-vehicles/form-utils";

const CASH_METHOD_OPTIONS: { id: AutoVehicleCashMethod; label: string }[] = [
  { id: "wallet", label: "Кошелёк" },
  { id: "credit_card", label: "Карта" },
  { id: "trade", label: "Трейд" },
];

const CASH_METHOD_LABELS: Record<AutoVehicleCashMethod, string> = {
  wallet: "Кошелёк",
  credit_card: "Карта",
  trade: "Трейд",
};

const TRADE_PART_LABELS: Record<AutoVehicleTradePart, string> = {
  cash: "Наличные",
  vehicle: "Другая машина",
  wallet: "Кошелёк",
};

const TRADE_PART_OPTIONS: { id: AutoVehicleTradePart; label: string }[] = [
  { id: "cash", label: TRADE_PART_LABELS.cash },
  { id: "vehicle", label: TRADE_PART_LABELS.vehicle },
  { id: "wallet", label: TRADE_PART_LABELS.wallet },
];

const fieldClassName =
  "w-full min-w-0 border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 placeholder:text-zinc-300 focus:ring-0 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const editableSelectClassName = `${fieldClassName} max-w-full truncate ${APP_BUBBLE_INSET_CONTROL}`;

const editableInputClassName = `${fieldClassName} ${APP_BUBBLE_INSET_CONTROL}`;

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 border-b border-white/35 px-4 py-2.5 transition-colors duration-200 last:border-b-0">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return (
    <ReadonlyFormValue>
      <span className="text-[15px] leading-none text-zinc-900">{children}</span>
    </ReadonlyFormValue>
  );
}

export function AutoVehicleCashFundingFields({
  funding,
  onPatch,
  readOnly = false,
}: {
  funding: AutoVehicleCashFunding | undefined;
  onPatch: (patch: AutoVehicleCashFunding) => void;
  readOnly?: boolean;
}) {
  const { cards } = useCreditCards();
  const state = normalizeCashFunding(funding);

  function replaceFunding(next: AutoVehicleCashFunding) {
    onPatch(normalizeCashFunding(next));
  }

  function patchMethod(method: AutoVehicleCashMethod) {
    if (method === "wallet") {
      replaceFunding({ method, walletId: state.walletId ?? "dc-3" });
      return;
    }

    if (method === "credit_card") {
      replaceFunding({
        method,
        creditCardId: state.creditCardId ?? cards[0]?.id,
      });
      return;
    }

    replaceFunding({
      method: "trade",
      tradePart: state.tradePart ?? "cash",
      tradeCashAmount: state.tradeCashAmount ?? 0,
      tradeVehicleCatalogId: state.tradeVehicleCatalogId,
      tradeVehicleYear: state.tradeVehicleYear,
      tradeVehicleValue: state.tradeVehicleValue ?? 0,
      tradeWalletId: state.tradeWalletId ?? "dc-3",
      tradeWalletAmount: state.tradeWalletAmount ?? 0,
    });
  }

  const tradeCatalogId = state.tradeVehicleCatalogId ?? "voltara-prism";
  const tradeEntry = getVehicleCatalogEntry(tradeCatalogId);
  const tradeMake = tradeEntry?.make ?? VEHICLE_CATALOG_MAKES[0];
  const tradeModels = getVehicleModelsForMake(tradeMake);
  const resolvedTradeCatalogId = tradeModels.some((item) => item.id === tradeCatalogId)
    ? tradeCatalogId
    : (tradeModels[0]?.id ?? tradeCatalogId);
  const tradeModelLabel = tradeEntry
    ? tradeEntry.trim
      ? `${tradeEntry.model} ${tradeEntry.trim}`
      : tradeEntry.model
    : "—";
  const walletAccount = DEBIT_CASH_ACCOUNTS.find((account) => account.id === state.walletId);
  const tradeWalletAccount = DEBIT_CASH_ACCOUNTS.find(
    (account) => account.id === state.tradeWalletId
  );
  const creditCard = cards.find((card) => card.id === state.creditCardId);

  if (readOnly) {
    return (
      <>
        <EditRow label="Источник оплаты">
          <InfoValue>{CASH_METHOD_LABELS[state.method]}</InfoValue>
        </EditRow>

        {state.method === "wallet" ? (
          <EditRow label="Счёт или кошелёк">
            <InfoValue>
              {walletAccount ? formatDebitCashAccountLabel(walletAccount) : "—"}
            </InfoValue>
          </EditRow>
        ) : null}

        {state.method === "credit_card" ? (
          <EditRow label="Кредитная карта">
            <InfoValue>
              {creditCard ? `${getCreditCardBankName(creditCard)} · ${creditCard.name}` : "—"}
            </InfoValue>
          </EditRow>
        ) : null}

        {state.method === "trade" ? (
          <>
            <EditRow label="Часть трейда">
              <InfoValue>{TRADE_PART_LABELS[state.tradePart ?? "cash"]}</InfoValue>
            </EditRow>

            {state.tradePart === "cash" ? (
              <EditRow label="Сумма наличными">
                <ReadonlyFormValue>
                  <UsdAmount amount={state.tradeCashAmount ?? 0} />
                </ReadonlyFormValue>
              </EditRow>
            ) : null}

            {state.tradePart === "vehicle" ? (
              <>
                <EditRow label="Марка">
                  <InfoValue>{tradeMake}</InfoValue>
                </EditRow>
                <EditRow label="Модель">
                  <InfoValue>{tradeModelLabel}</InfoValue>
                </EditRow>
                <EditRow label="Год">
                  <InfoValue>{state.tradeVehicleYear ?? "—"}</InfoValue>
                </EditRow>
                <EditRow label="Оценка стоимости">
                  <ReadonlyFormValue>
                    <UsdAmount amount={state.tradeVehicleValue ?? 0} />
                  </ReadonlyFormValue>
                </EditRow>
              </>
            ) : null}

            {state.tradePart === "wallet" ? (
              <>
                <EditRow label="Кошелёк">
                  <InfoValue>
                    {tradeWalletAccount
                      ? formatDebitCashAccountLabel(tradeWalletAccount)
                      : "—"}
                  </InfoValue>
                </EditRow>
                <EditRow label="Остаток доплатой">
                  <ReadonlyFormValue>
                    <UsdAmount amount={state.tradeWalletAmount ?? 0} />
                  </ReadonlyFormValue>
                </EditRow>
              </>
            ) : null}
          </>
        ) : null}
      </>
    );
  }

  return (
    <div className="space-y-2 border-b border-zinc-100 px-4 py-3">
      <p className="text-[13px] text-zinc-900">Источник оплаты</p>
      <BubbleSegmentedControl
        options={CASH_METHOD_OPTIONS}
        value={state.method}
        onChange={patchMethod}
        ariaLabel="Источник оплаты"
      />

      <div className="-mx-4 overflow-hidden border-t border-zinc-100">
        {state.method === "wallet" ? (
          <EditRow label="Счёт или кошелёк">
            <select
              className={editableSelectClassName}
              value={state.walletId ?? "dc-3"}
              onChange={(event) =>
                replaceFunding({ method: "wallet", walletId: event.target.value })
              }
            >
              {DEBIT_CASH_ACCOUNTS.map((account) => (
                <option key={account.id} value={account.id}>
                  {formatDebitCashAccountLabel(account)}
                </option>
              ))}
            </select>
          </EditRow>
        ) : null}

        {state.method === "credit_card" ? (
          <EditRow label="Кредитная карта">
            <select
              className={editableSelectClassName}
              value={state.creditCardId ?? cards[0]?.id ?? ""}
              onChange={(event) =>
                replaceFunding({
                  method: "credit_card",
                  creditCardId: event.target.value,
                })
              }
            >
              {cards.length === 0 ? (
                <option value="">Нет карт</option>
              ) : (
                cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {getCreditCardBankName(card)} · {card.name}
                  </option>
                ))
              )}
            </select>
          </EditRow>
        ) : null}

        {state.method === "trade" ? (
          <div className="space-y-2 px-0 py-2.5">
            <div className="px-4">
              <BubbleSegmentedControl
                options={TRADE_PART_OPTIONS}
                value={state.tradePart ?? "cash"}
                onChange={(tradePart) =>
                  replaceFunding({
                    ...state,
                    method: "trade",
                    tradePart,
                  })
                }
                ariaLabel="Часть трейда"
              />
            </div>

            {state.tradePart === "cash" ? (
              <EditRow label="Сумма наличными">
                <FormRowEnd>
                  <span className={APP_BUBBLE_INSET_CONTROL}>
                    <UsdAmountInput
                      value={state.tradeCashAmount ?? 0}
                      onChange={(tradeCashAmount) =>
                        replaceFunding({
                          ...state,
                          method: "trade",
                          tradePart: "cash",
                          tradeCashAmount,
                        })
                      }
                    />
                  </span>
                </FormRowEnd>
              </EditRow>
            ) : null}

            {state.tradePart === "vehicle" ? (
              <>
                <EditRow label="Марка">
                  <select
                    className={editableSelectClassName}
                    value={tradeMake}
                    onChange={(event) => {
                      const models = getVehicleModelsForMake(event.target.value);
                      replaceFunding({
                        ...state,
                        method: "trade",
                        tradePart: "vehicle",
                        tradeVehicleCatalogId: models[0]?.id,
                      });
                    }}
                  >
                    {VEHICLE_CATALOG_MAKES.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </EditRow>

                <EditRow label="Модель">
                  <select
                    className={editableSelectClassName}
                    value={resolvedTradeCatalogId}
                    onChange={(event) =>
                      replaceFunding({
                        ...state,
                        method: "trade",
                        tradePart: "vehicle",
                        tradeVehicleCatalogId: event.target.value,
                      })
                    }
                  >
                    {tradeModels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.trim ? `${item.model} ${item.trim}` : item.model}
                      </option>
                    ))}
                  </select>
                </EditRow>

                <EditRow label="Год">
                  <FormRowEnd>
                    <input
                      type="number"
                      className={`${editableInputClassName} w-[5.5rem]`}
                      value={state.tradeVehicleYear ?? new Date().getFullYear()}
                      min={1980}
                      max={2030}
                      onChange={(event) =>
                        replaceFunding({
                          ...state,
                          method: "trade",
                          tradePart: "vehicle",
                          tradeVehicleYear: toAutoVehicleNumber(
                            event.target.value,
                            state.tradeVehicleYear ?? new Date().getFullYear()
                          ),
                        })
                      }
                    />
                  </FormRowEnd>
                </EditRow>

                <EditRow label="Оценка стоимости">
                  <FormRowEnd>
                    <span className={APP_BUBBLE_INSET_CONTROL}>
                      <UsdAmountInput
                        value={state.tradeVehicleValue ?? 0}
                        onChange={(tradeVehicleValue) =>
                          replaceFunding({
                            ...state,
                            method: "trade",
                            tradePart: "vehicle",
                            tradeVehicleValue,
                          })
                        }
                      />
                    </span>
                  </FormRowEnd>
                </EditRow>
              </>
            ) : null}

            {state.tradePart === "wallet" ? (
              <>
                <EditRow label="Кошелёк">
                  <select
                    className={editableSelectClassName}
                    value={state.tradeWalletId ?? "dc-3"}
                    onChange={(event) =>
                      replaceFunding({
                        ...state,
                        method: "trade",
                        tradePart: "wallet",
                        tradeWalletId: event.target.value,
                      })
                    }
                  >
                    {DEBIT_CASH_ACCOUNTS.map((account) => (
                      <option key={account.id} value={account.id}>
                        {formatDebitCashAccountLabel(account)}
                      </option>
                    ))}
                  </select>
                </EditRow>

                <EditRow label="Остаток доплатой">
                  <FormRowEnd>
                    <span className={APP_BUBBLE_INSET_CONTROL}>
                      <UsdAmountInput
                        value={state.tradeWalletAmount ?? 0}
                        onChange={(tradeWalletAmount) =>
                          replaceFunding({
                            ...state,
                            method: "trade",
                            tradePart: "wallet",
                            tradeWalletAmount,
                          })
                        }
                      />
                    </span>
                  </FormRowEnd>
                </EditRow>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { createDefaultCashFunding };
