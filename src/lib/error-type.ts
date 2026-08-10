const ERROR_TYPE_LABELS: Record<string, string> = {
  timeout: "Timeout",
  dns: "DNS",
  ssl: "SSL",
  connection: "Connexion",
  http: "HTTP",
  unknown: "Inconnue",
};

// Libellé affiché pour un type d'erreur de vérification (voir lib/checkSite.ts)
export function translateErrorType(type: string): string {
  return ERROR_TYPE_LABELS[type] ?? type;
}
