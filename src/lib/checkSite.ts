export type SiteCheckErrorType = "timeout" | "dns" | "ssl" | "connection" | "http" | "unknown";

export type SiteCheckResult = {
  status: "online" | "offline";
  responseTime: number | null;
  httpCode: number | null;
  errorType: SiteCheckErrorType | null;
  errorMessage: string | null;
};

const CHECK_TIMEOUT_MS = 10_000;

// Vérifie un site en effectuant une requête HTTP GET et catégorise l'erreur rencontrée, le cas échéant.
export async function checkSite(url: string): Promise<SiteCheckResult> {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    const responseTime = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      return {
        status: "offline",
        responseTime,
        httpCode: response.status,
        errorType: "http",
        errorMessage: `HTTP ${response.status} ${response.statusText}`.trim(),
      };
    }

    return {
      status: "online",
      responseTime,
      httpCode: response.status,
      errorType: null,
      errorMessage: null,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startedAt);
    const { errorType, errorMessage } = categorizeError(error);

    return {
      status: "offline",
      responseTime,
      httpCode: null,
      errorType,
      errorMessage,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// Déduit le type d'erreur (timeout, DNS, SSL, connexion, HTTP, inconnue) à partir de l'erreur levée par fetch.
// `fetch` (undici) enveloppe l'erreur réseau réelle dans `error.cause`.
function categorizeError(error: unknown): { errorType: SiteCheckErrorType; errorMessage: string } {
  if (error instanceof Error && error.name === "AbortError") {
    return {
      errorType: "timeout",
      errorMessage: `Request timed out after ${CHECK_TIMEOUT_MS}ms`,
    };
  }

  const cause =
    error instanceof Error && "cause" in error
      ? (error.cause as NodeJS.ErrnoException | undefined)
      : undefined;
  const code = cause?.code ?? "";
  const message = cause?.message ?? (error instanceof Error ? error.message : String(error));

  if (code === "ETIMEDOUT" || code.includes("TIMEOUT")) {
    return { errorType: "timeout", errorMessage: message };
  }

  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return { errorType: "dns", errorMessage: message };
  }

  if (code.includes("CERT") || code.includes("SSL") || code.includes("TLS")) {
    return { errorType: "ssl", errorMessage: message };
  }

  if (["ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH", "ENETUNREACH", "EPIPE"].includes(code)) {
    return { errorType: "connection", errorMessage: message };
  }

  return { errorType: "unknown", errorMessage: message };
}
