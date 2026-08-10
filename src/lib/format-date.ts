const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Formate une date au format "09 Août 2026 - 09h30" (heure locale)
export function formatCheckTimestamp(value: string | Date | null): string {
  if (!value) return "Jamais vérifié";

  const date = typeof value === "string" ? new Date(value) : value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_FR[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${date.getFullYear()} - ${hours}h${minutes}`;
}
