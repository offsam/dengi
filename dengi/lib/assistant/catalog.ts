import { getCreditCardBankName } from "@/lib/bank-logos";
import { DASHBOARD_DEBIT_CASH, DASHBOARD_HOUSING_BILLS } from "@/lib/dashboard/seed";
import { getAutoVehicleTitle } from "@/lib/dashboard/auto";
import { getVehicleCatalogEntry } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import type { CreditCard } from "@/lib/credit-cards/types";

export type CatalogEntityKind =
  | "credit_card"
  | "debit_account"
  | "cash_wallet"
  | "auto_loan"
  | "bill";

export type CatalogEntity = {
  kind: CatalogEntityKind;
  id: string;
  label: string;
  aliases: string[];
};

export type AppCatalog = {
  entities: CatalogEntity[];
};

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function buildAppCatalog(creditCards: CreditCard[], autoVehicles: AutoVehicle[]): AppCatalog {
  const entities: CatalogEntity[] = [];

  for (const card of creditCards) {
    const bankName = getCreditCardBankName(card);
    entities.push({
      kind: "credit_card",
      id: card.id,
      label: card.name,
      aliases: normalizeAliases([
        card.name,
        bankName,
        `${bankName} card`,
        card.name.split(" ")[0] ?? card.name,
      ]),
    });
  }

  for (const account of DASHBOARD_DEBIT_CASH) {
    entities.push({
      kind: account.bank === "Наличные" ? "cash_wallet" : "debit_account",
      id: account.id,
      label: account.name,
      aliases: normalizeAliases([
        account.name,
        account.bank,
        `${account.bank} ${account.name}`,
        account.bank === "Наличные" ? "cash" : account.name,
        account.bank === "Наличные" ? "кэш" : "",
        account.bank === "Наличные" ? "наличные" : "",
      ]),
    });
  }

  for (const vehicle of autoVehicles) {
    const title = getAutoVehicleTitle(vehicle);
    const catalog = getVehicleCatalogEntry(vehicle.catalogId);
    entities.push({
      kind: "auto_loan",
      id: vehicle.id,
      label: title,
      aliases: normalizeAliases([
        title,
        catalog ? `${catalog.make} ${catalog.model}` : "",
        catalog?.model ?? "",
        catalog?.make ?? "",
        "авто",
        "машина",
        ...(catalog?.aliases ?? []),
      ]),
    });
  }

  for (const bill of DASHBOARD_HOUSING_BILLS) {
    entities.push({
      kind: "bill",
      id: bill.id,
      label: bill.name,
      aliases: normalizeAliases([bill.name, `${bill.name} bill`]),
    });
  }

  return { entities };
}

function normalizeAliases(values: string[]) {
  return [...new Set(values.map(normalizeAlias).filter(Boolean))];
}

export function findCatalogEntity(catalog: AppCatalog, text: string) {
  const haystack = normalizeAlias(text);
  let best: { entity: CatalogEntity; score: number } | null = null;

  for (const entity of catalog.entities) {
    for (const alias of entity.aliases) {
      if (!alias) {
        continue;
      }

      if (haystack.includes(alias)) {
        const score = alias.length;
        if (!best || score > best.score) {
          best = { entity, score };
        }
      }
    }
  }

  return best?.entity ?? null;
}

export function catalogEntityById(catalog: AppCatalog, kind: CatalogEntityKind, id: string) {
  return catalog.entities.find((entity) => entity.kind === kind && entity.id === id) ?? null;
}
