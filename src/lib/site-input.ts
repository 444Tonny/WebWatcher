import { HttpError } from "@/lib/http-error";

export type SiteInput = {
  name: string;
  url: string;
};

// Valide le format de l'URL (doit être http/https) et la normalise
function normalizeUrl(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "Field 'url' must be a non-empty string");
  }

  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new HttpError(400, "Field 'url' must be a valid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new HttpError(400, "Field 'url' must use the http or https protocol");
  }

  return parsed.toString();
}

// Vérifie et normalise le corps de la requête pour créer ou modifier un site.
// `partial: true` (PUT) autorise à n'envoyer qu'un sous-ensemble des champs.
function parseSiteBody(body: unknown, options: { partial: boolean }): Partial<SiteInput> {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const { name, url } = body as Record<string, unknown>;
  const result: Partial<SiteInput> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new HttpError(400, "Field 'name' must be a non-empty string");
    }
    result.name = name.trim();
  } else if (!options.partial) {
    throw new HttpError(400, "Field 'name' is required");
  }

  if (url !== undefined) {
    result.url = normalizeUrl(url);
  } else if (!options.partial) {
    throw new HttpError(400, "Field 'url' is required");
  }

  return result;
}

export function parseCreateSiteInput(body: unknown): SiteInput {
  return parseSiteBody(body, { partial: false }) as SiteInput;
}

export function parseUpdateSiteInput(body: unknown): Partial<SiteInput> {
  const input = parseSiteBody(body, { partial: true });

  if (Object.keys(input).length === 0) {
    throw new HttpError(400, "At least one field ('name' or 'url') must be provided");
  }

  return input;
}
