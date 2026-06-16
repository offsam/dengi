import { NextResponse } from "next/server";
import { BANKS, type BankId } from "@/lib/bank-logos";
import { createEmptyCreditCardDraft } from "@/lib/credit-cards/defaults";
import type { AppCatalog, CatalogEntityKind } from "@/lib/assistant/catalog";
import type { AssistantAction } from "@/lib/assistant/types";

export const runtime = "nodejs";

type ParseRequest = {
  text: string;
  catalog: AppCatalog;
};

type LlmIntent = {
  action:
    | "add_card"
    | "add_credit_card_transaction"
    | "unsupported"
    | "unknown";
  targetKind?: CatalogEntityKind;
  targetId?: string;
  bankId?: string;
  limit?: number;
  amount?: number;
  transactionType?: "purchase" | "payment";
  description?: string;
  reason?: string;
};

function buildSystemPrompt(catalog: AppCatalog) {
  const entities = catalog.entities.map((entity) => ({
    kind: entity.kind,
    id: entity.id,
    label: entity.label,
    aliases: entity.aliases,
  }));

  return `You convert finance app voice/chat commands into JSON only.
Available entities:
${JSON.stringify(entities)}

Supported actions:
- add_card: create a new credit card (bankId optional, limit optional)
- add_credit_card_transaction: purchase or payment on an existing credit_card only
- unsupported: user wants debit account, cash wallet, auto loan, or bill action (not implemented yet)
- unknown: cannot understand

Bank ids: chase, discover, americanexpress, bankofamerica, wellsfargo, citibank

Return JSON:
{
  "action": "...",
  "targetKind": "...",
  "targetId": "...",
  "bankId": "...",
  "limit": 0,
  "amount": 0,
  "transactionType": "purchase|payment",
  "description": "...",
  "reason": "..."
}`;
}

function resolveBankId(value?: string): BankId {
  if (value && value in BANKS) {
    return value as BankId;
  }

  return createEmptyCreditCardDraft().bankId;
}

function toAssistantAction(payload: LlmIntent, catalog: AppCatalog): AssistantAction {
  if (payload.action === "unknown") {
    return { type: "unknown", raw: "" };
  }

  if (payload.action === "add_card") {
    const bankId = resolveBankId(payload.bankId);
    return {
      type: "add_card",
      draft: {
        ...createEmptyCreditCardDraft(),
        bankId,
        name: `${BANKS[bankId].name} card`,
        limit: payload.limit ?? 0,
      },
    };
  }

  const entity =
    catalog.entities.find(
      (item) => item.id === payload.targetId && item.kind === payload.targetKind
    ) ?? null;

  if (payload.action === "add_credit_card_transaction" && entity?.kind === "credit_card") {
    return {
      type: "add_credit_card_transaction",
      cardId: entity.id,
      cardLabel: entity.label,
      transactionType: payload.transactionType ?? "purchase",
      amount: payload.amount ?? 0,
      description: payload.description?.trim() || "Запись помощника",
    };
  }

  if (entity && payload.action === "unsupported") {
    return {
      type: "unsupported",
      targetKind: entity.kind,
      targetLabel: entity.label,
      message:
        payload.reason ??
        `Понял запрос для «${entity.label}», но это действие пока не подключено.`,
    };
  }

  return { type: "unknown", raw: "" };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Assistant LLM is not configured." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as ParseRequest;
  if (!body.text?.trim() || !body.catalog?.entities?.length) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(body.catalog) },
        { role: "user", content: body.text.trim() },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Assistant parse failed." }, { status: 502 });
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ action: { type: "unknown", raw: body.text } });
  }

  try {
    const parsed = JSON.parse(content) as LlmIntent;
    const action = toAssistantAction(parsed, body.catalog);

    if (
      action.type === "add_credit_card_transaction" &&
      (!action.amount || action.amount <= 0)
    ) {
      return NextResponse.json({ action: { type: "unknown", raw: body.text } });
    }

    return NextResponse.json({ action });
  } catch {
    return NextResponse.json({ action: { type: "unknown", raw: body.text } });
  }
}
