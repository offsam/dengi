"use client";

import { SegmentedControl } from "@/app/components/segmented-control";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
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
import {
  POPULAR_BODY_COLORS,
  resolveVehicleBodyColor,
  type VehicleBodyColor,
} from "@/lib/auto-vehicles/colors";
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

const editableCardClassName =
  "overflow-hidden rounded-2xl bg-white shadow-sm shadow-[#16B0A6]/15 ring-2 ring-[#16B0A6]/60 transition-all duration-200";

const readonlyCardClassName =
  "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/60";

const editableRowClassName = "bg-[#16B0A6]/[0.12]";

const editableControlClassName =
  "rounded-lg bg-[#16B0A6]/15 px-2.5 py-1.5 ring-2 ring-[#16B0A6]/70";

const valueEditableControlClassName =
  "rounded-lg bg-[#16B0A6]/28 px-3 py-2 ring-2 ring-[#16B0A6] shadow-sm shadow-[#16B0A6]/35";

function FormSection({
  title,
  children,
  editable = false,
}: {
  title: string;
  children: React.ReactNode;
  editable?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      <div className={editable ? editableCardClassName : readonlyCardClassName}>{children}</div>
    </section>
  );
}

function EditRow({
  label,
  children,
  hint,
  editable = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  editable?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[48px] items-center gap-3 border-b border-zinc-100 px-4 py-2.5 transition-colors duration-200 last:border-b-0 ${
        editable ? editableRowClassName : ""
      }`}
    >
      <span
        className={`w-[42%] shrink-0 text-[15px] leading-tight ${
          editable ? "font-medium text-zinc-900" : "text-zinc-900"
        }`}
      >
        {label}
      </span>
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
  highlightClassName = editableControlClassName,
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

function DirectBodyColorPicker({
  value,
  onChange,
}: {
  value: VehicleBodyColor;
  onChange: (next: VehicleBodyColor) => void;
}) {
  const normalized = resolveVehicleBodyColor(value);
  const selectedHex = normalized.hex.toLowerCase();

  return (
    <FormRowEnd>
      <div
        className="flex max-w-[11rem] flex-wrap justify-end gap-1.5"
        role="listbox"
        aria-label="Цвет кузова"
      >
        {POPULAR_BODY_COLORS.map((color) => {
          const selected = color.hex.toLowerCase() === selectedHex;

          return (
            <button
              key={color.hex}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={color.label}
              title={color.label}
              className={`size-7 shrink-0 rounded-full transition-shadow ${
                selected
                  ? "ring-2 ring-zinc-900 ring-offset-1"
                  : "ring-1 ring-zinc-200/90 hover:ring-zinc-400"
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onChange(color)}
            />
          );
        })}
      </div>
    </FormRowEnd>
  );
}

export function AutoVehicleFormFields({
  draft,
  onPatch,
  showFinancingPicker = false,
  readOnly = false,
  valueHighlightOnly = false,
}: {
  draft: AutoVehicle;
  onPatch: (patch: Partial<AutoVehicle>) => void;
  /** Кредит / лизинг / наличные — только при добавлении новой машины */
  showFinancingPicker?: boolean;
  /** Только просмотр — без селектов и полей ввода */
  readOnly?: boolean;
  /** Подсветка только у редактируемых значений, без рамки всей таблицы */
  valueHighlightOnly?: boolean;
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
  const bodyColor = resolveVehicleBodyColor({
    label: draft.bodyColorLabel,
    hex: draft.bodyColorHex,
  });

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
  const rowHighlight = editable && !valueHighlightOnly;
  const controlHighlight = editable;
  const activeControlClassName = valueHighlightOnly
    ? valueEditableControlClassName
    : editableControlClassName;
  const activeSelectClassName = `${fieldClassName} max-w-full truncate ${
    controlHighlight ? activeControlClassName : ""
  }`;
  const activeDateClassName = `${dateInputClassName} ${
    controlHighlight ? activeControlClassName : ""
  }`;

  return (
    <div className="space-y-5">
      {editable && !valueHighlightOnly ? (
        <p className="px-1 text-xs font-medium text-[#16B0A6]">Можно редактировать поля ниже</p>
      ) : null}

      <FormSection title="Автомобиль" editable={rowHighlight}>
        <EditRow label="Марка" editable={rowHighlight}>
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

        <EditRow label="Модель" editable={rowHighlight}>
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

        <EditRow label="Год" editable={rowHighlight}>
          {readOnly ? (
            <InfoValue>{draft.year}</InfoValue>
          ) : (
            <DirectNumberInput
              value={draft.year}
              min={1980}
              max={2030}
              highlighted={controlHighlight}
              highlightClassName={activeControlClassName}
              onChange={(year) => onPatch({ year })}
            />
          )}
        </EditRow>

        <EditRow label="Пробег, mi" editable={rowHighlight}>
          {readOnly ? (
            <InfoValue>{draft.mileage} mi</InfoValue>
          ) : (
            <DirectNumberInput
              value={draft.mileage}
              min={0}
              suffix="mi"
              widthClassName="w-[7rem]"
              highlighted={controlHighlight}
              highlightClassName={activeControlClassName}
              onChange={(mileage) => onPatch({ mileage })}
            />
          )}
        </EditRow>

        <EditRow label="Цвет кузова" editable={rowHighlight}>
          {readOnly ? (
            <ReadonlyFormValue>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] leading-none text-zinc-900">
                <span
                  className="inline-block size-3.5 shrink-0 rounded-full ring-1 ring-zinc-200/80"
                  style={{ backgroundColor: bodyColor.hex }}
                  aria-hidden
                />
                {bodyColor.label}
              </span>
            </ReadonlyFormValue>
          ) : (
            <FormRowEnd>
              <span className={controlHighlight ? activeControlClassName : ""}>
                <DirectBodyColorPicker
                  value={{
                    label: draft.bodyColorLabel,
                    hex: draft.bodyColorHex,
                  }}
                  onChange={({ label: bodyColorLabel, hex: bodyColorHex }) =>
                    onPatch({ bodyColorLabel, bodyColorHex })
                  }
                />
              </span>
            </FormRowEnd>
          )}
        </EditRow>
      </FormSection>

      <section className="space-y-2">
        <div className="space-y-1">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {showFinancingPicker ? "Финансы" : FINANCING_TYPE_LABELS[financingType]}
          </h2>
          {showFinancingPicker ? (
            <SegmentedControl
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

        <div className={rowHighlight ? editableCardClassName : readonlyCardClassName}>
          <EditRow label="Цена покупки" editable={rowHighlight}>
            {readOnly ? (
              <ReadonlyFormValue>
                <UsdAmount amount={draft.purchasePrice} />
              </ReadonlyFormValue>
            ) : (
              <FormRowEnd>
                <span className={controlHighlight ? activeControlClassName : ""}>
                  <UsdAmountInput
                    value={draft.purchasePrice}
                    onChange={(purchasePrice) => patchWithFinancing({ purchasePrice })}
                  />
                </span>
              </FormRowEnd>
            )}
          </EditRow>

          <EditRow label="Дата покупки" editable={rowHighlight}>
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
              editableHighlight={controlHighlight && !valueHighlightOnly}
              onPatch={(cashFunding) =>
                onPatch({ cashFunding: normalizeCashFunding(cashFunding) })
              }
            />
          ) : null}

          {showFinancingTerms ? (
            <>
              <EditRow
                label={financingType === "leasing" ? "Срок лизинга" : "Срок кредита"}
                editable={rowHighlight}
              >
                {readOnly ? (
                  <InfoValue>{toLoanTermMonthsInput(draft.loanTermMonths) || "0"} мес</InfoValue>
                ) : (
                  <FormRowEnd>
                    <span className={controlHighlight ? activeControlClassName : ""}>
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
                editable={rowHighlight}
              >
                {readOnly ? (
                  <InfoValue>{toLoanAprInput(loanAprPercent) || "0"}%</InfoValue>
                ) : (
                  <FormRowEnd>
                    <span className={controlHighlight ? activeControlClassName : ""}>
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

              <EditRow label="День платежа" editable={rowHighlight}>
                {readOnly ? (
                  <InfoValue>{resolveLoanPaymentDay(draft)}</InfoValue>
                ) : (
                  <DirectNumberInput
                    value={resolveLoanPaymentDay(draft)}
                    min={1}
                    max={31}
                    widthClassName="w-[3.5rem]"
                    highlighted={controlHighlight}
                    highlightClassName={activeControlClassName}
                    onChange={(loanPaymentDay) => patchWithFinancing({ loanPaymentDay })}
                  />
                )}
              </EditRow>

              <EditRow label="Платёж в месяц" editable={rowHighlight}>
                {readOnly ? (
                  <ReadonlyFormValue>
                    <UsdAmount amount={draft.loanPayment} exact />
                  </ReadonlyFormValue>
                ) : (
                  <FormRowEnd>
                    <span className={controlHighlight ? activeControlClassName : ""}>
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
        </div>
      </section>
    </div>
  );
}
