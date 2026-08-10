import { HttpError } from "@/lib/http-error";

// Fréquences de vérification proposées (en secondes) et leur libellé affiché.
export const CHECK_INTERVAL_OPTIONS = [
  { value: 60, label: "1 min" },
  { value: 300, label: "5 min" },
  { value: 900, label: "15 min" },
  { value: 1800, label: "30 min" },
] as const;

const ALLOWED_INTERVALS: readonly number[] = CHECK_INTERVAL_OPTIONS.map((option) => option.value);

// Un Chat ID Telegram est un entier, éventuellement négatif pour un chat de groupe.
export const CHAT_ID_PATTERN = /^-?\d+$/;

export type SettingsInput = {
  checkInterval: number;
  notifyOnError: boolean;
  telegramChatIds: string[];
};

// Vérifie et normalise le corps de la requête PUT /api/settings (mise à jour partielle).
export function parseUpdateSettingsInput(body: unknown): Partial<SettingsInput> {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const { checkInterval, notifyOnError, telegramChatIds } = body as Record<string, unknown>;
  const result: Partial<SettingsInput> = {};

  if (checkInterval !== undefined) {
    if (typeof checkInterval !== "number" || !ALLOWED_INTERVALS.includes(checkInterval)) {
      throw new HttpError(400, "Field 'checkInterval' must be one of 60, 300, 900, 1800 (seconds)");
    }
    result.checkInterval = checkInterval;
  }

  if (notifyOnError !== undefined) {
    if (typeof notifyOnError !== "boolean") {
      throw new HttpError(400, "Field 'notifyOnError' must be a boolean");
    }
    result.notifyOnError = notifyOnError;
  }

  if (telegramChatIds !== undefined) {
    if (!Array.isArray(telegramChatIds) || !telegramChatIds.every((id) => typeof id === "string")) {
      throw new HttpError(400, "Field 'telegramChatIds' must be an array of strings");
    }

    const trimmed = telegramChatIds.map((id) => id.trim());
    if (trimmed.some((id) => !CHAT_ID_PATTERN.test(id))) {
      throw new HttpError(400, "Each Telegram chat ID must contain only digits (optionally prefixed with '-')");
    }
    result.telegramChatIds = trimmed;
  }

  if (Object.keys(result).length === 0) {
    throw new HttpError(400, "At least one field must be provided");
  }

  return result;
}
