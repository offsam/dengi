"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  FormRowEnd,
  PercentAmountInput,
  TermMonthsInput,
  UsdAmount,
  UsdAmountInput,
} from "@/app/components/usd-amount";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import { toAutoVehicleNumber } from "@/lib/auto-vehicles/form-utils";
import { toLoanAprInput, toLoanTermMonthsInput } from "@/lib/auto-vehicles/loan";
import {
  POPULAR_BODY_COLORS,
  resolveVehicleBodyColor,
  type VehicleBodyColor,
} from "@/lib/auto-vehicles/colors";

const iconButtonClassName =
  "flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700";

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
      <path
        d="M13.5 3.5a1.8 1.8 0 0 1 2.5 2.5l-9 9-3.2.7.7-3.2 9-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
      <path
        d="m5 10 3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
      <path
        d="m6 6 8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

type EditableFormValueProps<T> = {
  value: T;
  display: (value: T) => React.ReactNode;
  edit: (value: T, onChange: (next: T) => void) => React.ReactNode;
  onSave: (value: T) => void;
};

/** Просмотр + карандаш; редактирование + галочка / крестик */
export function EditableFormValue<T>({
  value,
  display,
  edit,
  onSave,
}: EditableFormValueProps<T>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const editRegionRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!editing) {
      return;
    }

    const input = editRegionRef.current?.querySelector<HTMLElement>(
      "input, select, textarea"
    );
    input?.focus();
  }, [editing]);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function saveEditing() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <FormRowEnd>
      <div
        className="inline-flex max-w-full items-center gap-1"
        role="group"
        aria-labelledby={labelId}
      >
        <span id={labelId} className="sr-only">
          {editing ? "Редактирование значения" : "Значение поля"}
        </span>

        {editing ? (
          <>
            <div
              ref={editRegionRef}
              className="min-w-0"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveEditing();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelEditing();
                }
              }}
            >
              {edit(draft, setDraft)}
            </div>
            <button
              type="button"
              className={`${iconButtonClassName} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
              aria-label="Сохранить"
              onClick={saveEditing}
            >
              <CheckIcon />
            </button>
            <button
              type="button"
              className={iconButtonClassName}
              aria-label="Отменить"
              onClick={cancelEditing}
            >
              <CloseIcon />
            </button>
          </>
        ) : (
          <>
            <div className="min-w-0">{display(value)}</div>
            <button
              type="button"
              className={iconButtonClassName}
              aria-label="Изменить"
              onClick={startEditing}
            >
              <PencilIcon />
            </button>
          </>
        )}
      </div>
    </FormRowEnd>
  );
}

export function EditableUsdValue({
  value,
  exact = false,
  onSave,
}: {
  value: number;
  exact?: boolean;
  onSave: (value: number) => void;
}) {
  return (
    <EditableFormValue
      value={value}
      display={(amount) => <UsdAmount amount={amount} exact={exact} />}
      edit={(amount, onChange) => <UsdAmountInput value={amount} onChange={onChange} />}
      onSave={onSave}
    />
  );
}

export function EditablePercentValue({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => void;
}) {
  return (
    <EditableFormValue
      value={value}
      display={(percent) => (
        <span className="tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
          {toLoanAprInput(percent) || "0"}%
        </span>
      )}
      edit={(percent, onChange) => (
        <PercentAmountInput
          value={toLoanAprInput(percent)}
          fallback={percent}
          parse={toAutoVehicleNumber}
          onChange={onChange}
        />
      )}
      onSave={onSave}
    />
  );
}

export function EditableTermMonthsValue({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => void;
}) {
  return (
    <EditableFormValue
      value={value}
      display={(months) => (
        <span className="tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
          {toLoanTermMonthsInput(months) || "0"} мес
        </span>
      )}
      edit={(months, onChange) => (
        <TermMonthsInput
          value={toLoanTermMonthsInput(months)}
          fallback={months}
          parse={toAutoVehicleNumber}
          onChange={onChange}
        />
      )}
      onSave={onSave}
    />
  );
}

export function EditableDateValue({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) {
  const inputClassName =
    "w-auto max-w-full border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 tabular-nums focus:ring-0";

  return (
    <EditableFormValue
      value={value}
      display={(date) => (
        <span className="tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
          {date ? formatAppDateNumeric(date) : "—"}
        </span>
      )}
      edit={(date, onChange) => (
        <input
          type="date"
          className={inputClassName}
          value={date}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      onSave={onSave}
    />
  );
}

const inlineNumberInputClassName =
  "m-0 min-w-0 border-0 bg-transparent p-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function EditableNumberValue({
  value,
  onSave,
  suffix,
  widthClassName = "w-[5.5rem]",
  min,
  max,
}: {
  value: number;
  onSave: (value: number) => void;
  suffix?: string;
  widthClassName?: string;
  min?: number;
  max?: number;
}) {
  return (
    <EditableFormValue
      value={value}
      display={(number) => (
        <span className="tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
          {number}
          {suffix ? ` ${suffix}` : ""}
        </span>
      )}
      edit={(number, onChange) => (
        <span className="inline-flex items-center tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
          <input
            type="number"
            className={`${inlineNumberInputClassName} ${widthClassName}`}
            value={number}
            min={min}
            max={max}
            onChange={(event) => onChange(toAutoVehicleNumber(event.target.value, number))}
          />
          {suffix ? (
            <span className="ml-0.5 shrink-0 text-zinc-400" aria-hidden>
              {suffix}
            </span>
          ) : null}
        </span>
      )}
      onSave={onSave}
    />
  );
}

function BodyColorDot({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-full ring-1 ring-zinc-200/80"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  );
}

function BodyColorSwatches({
  value,
  onChange,
}: {
  value: VehicleBodyColor;
  onChange: (next: VehicleBodyColor) => void;
}) {
  const selectedHex = value.hex.toLowerCase();

  return (
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
                ? "ring-2 ring-zinc-500/80 ring-offset-1 ring-offset-white/60"
                : "ring-1 ring-white/90 hover:ring-zinc-300"
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onChange(color)}
          />
        );
      })}
    </div>
  );
}

export function EditableBodyColorValue({
  value,
  onSave,
}: {
  value: VehicleBodyColor;
  onSave: (value: VehicleBodyColor) => void;
}) {
  const normalized = resolveVehicleBodyColor(value);

  return (
    <EditableFormValue
      value={normalized}
      display={(color) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[15px] leading-none text-zinc-900">
          <BodyColorDot hex={color.hex} />
          {color.label}
        </span>
      )}
      edit={(color, onChange) => <BodyColorSwatches value={color} onChange={onChange} />}
      onSave={onSave}
    />
  );
}

export function EditableTextValue({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}) {
  const textInputClassName =
    "m-0 min-w-0 w-[8rem] max-w-full border-0 bg-transparent p-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 placeholder:text-zinc-300 focus:ring-0";

  return (
    <EditableFormValue
      value={value}
      display={(text) => (
        <span className="whitespace-nowrap text-[15px] leading-none text-zinc-900">
          {text || "—"}
        </span>
      )}
      edit={(text, onChange) => (
        <input
          type="text"
          className={textInputClassName}
          value={text}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      onSave={onSave}
    />
  );
}

/** Только просмотр — без карандаша (расчётные поля) */
export function ReadonlyFormValue({ children }: { children: React.ReactNode }) {
  return <FormRowEnd>{children}</FormRowEnd>;
}
