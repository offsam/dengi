import { messages } from "./messages/index";
import type { AppLang } from "./types";

type MessageParams = Record<string, string | number>;

function lookup(tree: Record<string, unknown>, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, tree);

  return typeof value === "string" ? value : undefined;
}

export function createTranslator(lang: AppLang) {
  const tree = messages[lang] as Record<string, unknown>;

  return function t(key: string, params?: MessageParams) {
    const template = lookup(tree, key) ?? lookup(messages.ru as Record<string, unknown>, key) ?? key;

    if (!params) {
      return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, token: string) =>
      String(params[token] ?? `{${token}}`)
    );
  };
}

export type Translator = ReturnType<typeof createTranslator>;

export function getMessage(lang: AppLang, key: string, params?: MessageParams) {
  return createTranslator(lang)(key, params);
}
