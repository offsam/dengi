import type { AppCatalog } from "./catalog";
import { parseAssistantIntentRules } from "./parse-rules";
import type { AssistantAction } from "./types";

export async function resolveAssistantIntent(
  text: string,
  catalog: AppCatalog
): Promise<AssistantAction> {
  const ruleResult = parseAssistantIntentRules(text, catalog);
  if (ruleResult.type !== "unknown") {
    return ruleResult;
  }

  try {
    const response = await fetch("/api/assistant/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, catalog }),
    });

    if (response.status === 503) {
      return ruleResult;
    }

    if (!response.ok) {
      return ruleResult;
    }

    const payload = (await response.json()) as { action?: AssistantAction };
    if (payload.action && payload.action.type !== "unknown") {
      return payload.action;
    }
  } catch {
    return ruleResult;
  }

  return ruleResult;
}
