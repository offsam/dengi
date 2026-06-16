"use client";

import { BodyTypePickerRow } from "@/app/components/body-type-picker-dialog";
import { BubbleCard } from "@/app/components/bubble-card";
import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
import { APP_BUBBLE_INSET_CONTROL } from "@/lib/app-theme";
import {
  FormRowEnd,
  PercentAmountInput,
  TermMonthsInput,
  UsdAmount,
  UsdAmountInput,
} from "@/app/components/usd-amount";
import {
  AutoVehicleCashFundingFields,
  createDefaultCashFunding,
} from "@/app/components/auto-vehicle-cash-funding-fields";
import {
  getVehicleCatalogEntry,
  getVehicleModelsForMake,
  normalizeCashFunding,
  resolveLoanAprPercent,
  resolveLoanPaymentDay,
  syncFinancingFromLoanInputs,
  toLoanAprInput,
  toLoanTermMonthsInput,
  VEHICLE_CATALOG_MAKES,
} from "@/lib/auto-vehicles";
import { toAutoVehicleNumber } from "@/lib/auto-vehicles/form-utils";
import { resolveBodyTypeIcon } from "@/lib/car-icons";
import { CarIconImage } from "@/app/components/car-icon-image";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import type { AutoVehicle, AutoVehicleFinancingType } from "@/lib/auto-vehicles/vehicle";

const FINANCING_OPTIONS: { id: AutoVehicleFinancingType; label: string }[] = [
  { id: "credit", label: "Кредит" },
  { id: "leasing", label: "Лизинг" },
  { id: "cash", label: "Наличные" },
];

const FINANCING_TYPE_LABELS: Record<AutoVehicleFinancingType, string> = {
  credit: "Кредит",
  leasing: "Лизинг",
  cash: "Наличные",
};

const fieldClassName =
  "w-full min-w-0 border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 placeholder:text-zinc-300 focus:ring-0 tabular-nums";

const numberInputClassName = `${fieldClassName} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

const dateInputClassName =
  "w-auto max-w-full border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 tabular-nums focus:ring-0";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      <BubbleCard>{children}</BubbleCard>
    </section>
  );
}

function EditRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 border-b border-white/35 px-4 py-2.5 transition-colors duration-200 last:border-b-0">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
      {hint ? <span className="sr-only">{hint}</span> : null}
    </div>
  );
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return (
    <ReadonlyFormValue>
      <span className="text-[15px] leading-none text-zinc-700">{children}</span>
    </ReadonlyFormValue>
  );
}

function DirectNumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  widthClassName = "w-[5.5rem]",
  highlighted = false,
  highlightClassName = APP_BUBBLE_INSET_CONTROL,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  widthClassName?: string;
  highlighted?: boolean;
  highlightClassName?: string;
}) {
  return (
    <FormRowEnd>
      <span
        className={`inline-flex items-center tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900 ${
          highlighted ? highlightClassName : ""
        }`}
      >
        <input
          type="number"
          className={`${numberInputClassName} ${widthClassName}`}
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(toAutoVehicleNumber(event.target.value, value))}
        />
        {suffix ? (
          <span className="ml-0.5 shrink-0 text-zinc-400" aria-hidden>
            {suffix}
          </span>
        ) : null}
      </span>
    </FormRowEnd>
  );
}

export function AutoVehicleFormFields({
  draft,
  onPatch,
  showFinancingPicker = false,
  readOnly = false,
}: {
  draft: AutoVehicle;
  onPatch: (patch: Partial<AutoVehicle>) => void;
  /** Кредит / лизинг / наличные — только при добавлении новой машины */
  showFinancingPicker?: boolean;
  /** Только просмотр — без селектов и полей ввода */
  readOnly?: boolean;
}) {
  const catalogEntry = getVehicleCatalogEntry(draft.catalogId);
  const make = catalogEntry?.make ?? VEHICLE_CATALOG_MAKES[0];
  const models = getVehicleModelsForMake(make);
  const catalogId = models.some((item) => item.id === draft.catalogId)
    ? draft.catalogId
    : (models[0]?.id ?? draft.catalogId);
  const financingType = draft.financingType ?? "credit";
  const loanAprPercent = resolveLoanAprPercent(draft);
  const showFinancingTerms = financingType !== "cash";
  const modelLabel = catalogEntry
    ? catalogEntry.trim
      ? `${catalogEntry.model} ${catalogEntry.trim}`
      : catalogEntry.model
    : "—";
  const bodyTypeIcon = resolveBodyTypeIcon(draft.bodyIconId);

  function patchWithFinancing(patch: Partial<AutoVehicle>) {
    const next = { ...draft, ...patch };

    if ((next.financingType ?? "credit") === "cash") {
      onPatch(patch);
      return;
    }

    onPatch({
      ...patch,
      ...syncFinancingFromLoanInputs(next),
    });
  }

  const editable = !readOnly;
  const activeControlClassName = editable ? APP_BUBBLE_INSET_CONTROL : "";
  const activeSelectClassName = `${fieldClassName} max-w-full truncate ${
    editable ? activeControlClassName : ""
  }`;
  const activeDateClassName = `${dateInputClassName} ${editable ? activeControlClassName : ""}`;

  return (
    <div className="space-y-5">
      <FormSection title="Автомобиль">
        <EditRow label="Марка">
          {readOnly ? (
            <InfoValue>{make}</InfoValue>
          ) : (
            <FormRowEnd>
              <select
                className={activeSelectClassName}
                value={make}
                onChange={(event) => {
                  const nextMake = event.target.value;
                  const nextModels = getVehicleModelsForMake(nextMake);
                  const nextCatalogId = nextModels[0]?.id ?? draft.catalogId;

                  onPatch({ catalogId: nextCatalogId });
                }}
              >
                {VEHICLE_CATALOG_MAKES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormRowEnd>
          )}
        </EditRow>

        <EditRow label="Модель">
          {readOnly ? (
            <InfoValue>{modelLabel}</InfoValue>
          ) : (
            <FormRowEnd>
              <select
                className={activeSelectClassName}
                value={catalogId}
                onChange={(event) => onPatch({ catalogId: event.target.value })}
              >
                {models.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.trim ? `${item.model} ${item.trim}` : item.model}
                  </option>
                ))}
              </select>
            </FormRowEnd>
          )}
        </EditRow>

        <EditRow label="Год">
          {readOnly ? (
            <InfoValue>{draft.year}</InfoValue>
          ) : (
            <DirectNumberInput
              value={draft.year}
              min={1980}
              max={2030}
              highlighted={editable}
              highlightClassName={activeControlClassName}
              onChange={(year) => onPatch({ year })}
            />
          )}
        </EditRow>

        <EditRow label="Пробег, mi">
          {readOnly ? (
            <InfoValue>{draft.mileage} mi</InfoValue>
          ) : (
            <DirectNumberInput
              value={draft.mileage}
              min={0}
              suffix="mi"
              widthClassName="w-[7rem]"
              highlighted={editable}
              highlightClassName={activeControlClassName}
              onChange={(mileage) => onPatch({ mileage })}
            />
          )}
        </EditRow>

        <EditRow label="Тип кузова">
          {readOnly ? (
            <ReadonlyFormValue>
              <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] leading-none text-zinc-900">
                <CarIconImage
                  fileName={bodyTypeIcon.fileName}
                  className="h-6 w-10"
                  fallback={
                    <span className="inline-block h-6 w-10 rounded bg-zinc-200/60" aria-hidden />
                  }
                />
                {bodyTypeIcon.label}
              </span>
            </ReadonlyFormValue>
          ) : (
            <BodyTypePickerRow
              value={bodyTypeIcon.id}
              highlighted={editable}
              highlightClassName={activeControlClassName}
              onChange={(icon) => onPatch({ bodyIconId: icon.id })}
            />
          )}
        </EditRow>
      </FormSection>

      <section className="space-y-2">
        <div className="space-y-1">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {showFinancingPicker ? "Финансы" : FINANCING_TYPE_LABELS[financingType]}
          </h2>
          {showFinancingPicker ? (
            <BubbleSegmentedControl
              options={FINANCING_OPTIONS}
              value={financingType}
              onChange={(nextFinancingType) => {
                const patch: Partial<AutoVehicle> = { financingType: nextFinancingType };
                if (nextFinancingType === "cash" && !draft.cashFunding) {
                  patch.cashFunding = createDefaultCashFunding();
                }
                patchWithFinancing(patch);
              }}
              ariaLabel="Способ покупки"
            />
          ) : null}
        </div>

        <BubbleCard>
          <EditRow label="Цена покупки">
            {readOnly ? (
              <ReadonlyFormValue>
                <UsdAmount amount={draft.purchasePrice} />
              </ReadonlyFormValue>
            ) : (
              <FormRowEnd>
                <span className={editable ? activeControlClassName : ""}>
                  <UsdAmountInput
                    value={draft.purchasePrice}
                    onChange={(purchasePrice) => patchWithFinancing({ purchasePrice })}
                  />
                </span>
              </FormRowEnd>
            )}
          </EditRow>

          <EditRow label="Дата покупки">
            {readOnly ? (
              <InfoValue>
                {draft.purchaseDate ? formatAppDateNumeric(draft.purchaseDate) : "—"}
              </InfoValue>
            ) : (
              <FormRowEnd>
                <input
                  type="date"
                  className={activeDateClassName}
                  value={draft.purchaseDate}
                  onChange={(event) => patchWithFinancing({ purchaseDate: event.target.value })}
                />
              </FormRowEnd>
            )}
          </EditRow>

          {financingType === "cash" ? (
            <AutoVehicleCashFundingFields
              funding={draft.cashFunding}
              readOnly={readOnly}
              onPatch={(cashFunding) =>
                onPatch({ cashFunding: normalizeCashFunding(cashFunding) })
              }
            />
          ) : null}

          {showFinancingTerms ? (
            <>
              <EditRow
                label={financingType === "leasing" ? "Срок лизинга" : "Срок кредита"}
              >
                {readOnly ? (
                  <InfoValue>{toLoanTermMonthsInput(draft.loanTermMonths) || "0"} мес</InfoValue>
                ) : (
                  <FormRowEnd>
                    <span className={editable ? activeControlClassName : ""}>
                      <TermMonthsInput
                        value={toLoanTermMonthsInput(draft.loanTermMonths)}
                        fallback={draft.loanTermMonths}
                        parse={toAutoVehicleNumber}
                        onChange={(loanTermMonths) => patchWithFinancing({ loanTermMonths })}
                      />
                    </span>
                  </FormRowEnd>
                )}
              </EditRow>

              <EditRow
                label={
                  financingType === "leasing" ? "Процент по лизингу" : "Процент по кредиту"
                }
              >
                {readOnly ? (
                  <InfoValue>{toLoanAprInput(loanAprPercent) || "0"}%</InfoValue>
                ) : (
                  <FormRowEnd>
                    <span className={editable ? activeControlClassName : ""}>
                      <PercentAmountInput
                        value={toLoanAprInput(loanAprPercent)}
                        fallback={loanAprPercent}
                        parse={toAutoVehicleNumber}
                        onChange={(loanAprPercent) => patchWithFinancing({ loanAprPercent })}
                      />
                    </span>
                  </FormRowEnd>
                )}
              </EditRow>

              <EditRow label="День платежа">
                {readOnly ? (
                  <InfoValue>{resolveLoanPaymentDay(draft)}</InfoValue>
                ) : (
                  <DirectNumberInput
                    value={resolveLoanPaymentDay(draft)}
                    min={1}
                    max={31}
                    widthClassName="w-[3.5rem]"
                    highlighted={editable}
                    highlightClassName={activeControlClassName}
                    onChange={(loanPaymentDay) => patchWithFinancing({ loanPaymentDay })}
                  />
                )}
              </EditRow>

              <EditRow label="Платёж в месяц">
                {readOnly ? (
                  <ReadonlyFormValue>
                    <UsdAmount amount={draft.loanPayment} exact />
                  </ReadonlyFormValue>
                ) : (
                  <FormRowEnd>
                    <span className={editable ? activeControlClassName : ""}>
                      <UsdAmountInput
                        value={draft.loanPayment}
                        onChange={(loanPayment) => patchWithFinancing({ loanPayment })}
                      />
                    </span>
                  </FormRowEnd>
                )}
              </EditRow>
            </>
          ) : null}
        </BubbleCard>
      </section>
    </div>
  );
}
