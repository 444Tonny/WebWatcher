import type { RecentCheck } from "@/lib/types";

const MAX_BARS = 60;
const MAX_BAR_HEIGHT = 35;
const MIN_BAR_HEIGHT = 10;
// En dessous de ce temps de réponse, la barre est à sa hauteur max ; au-dessus, à sa hauteur min.
const FAST_RESPONSE_MS = 50;
const SLOW_RESPONSE_MS = 3000;

function getBarHeight(responseTime: number | null): number {
  if (responseTime === null) return MIN_BAR_HEIGHT;

  const clamped = Math.min(Math.max(responseTime, FAST_RESPONSE_MS), SLOW_RESPONSE_MS);
  const ratio = (clamped - FAST_RESPONSE_MS) / (SLOW_RESPONSE_MS - FAST_RESPONSE_MS);

  return Math.round(MAX_BAR_HEIGHT - ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
}

function getBarColor(status: string | undefined): string {
  if (status === "online") return "bg-emerald-500";
  if (status === "offline") return "bg-red-500";
  return "bg-zinc-600/70";
}

type AvailabilityChartProps = {
  // Du plus récent au plus ancien, comme renvoyé par l'API
  checks: RecentCheck[];
};

// Graphique de disponibilité : 60 créneaux, du plus ancien (gauche) au plus récent (droite).
// Complété à gauche par des créneaux "pas vérifié" si l'historique compte moins de 60 entrées.
export function AvailabilityChart({ checks }: AvailabilityChartProps) {
  const chronological = [...checks].reverse();
  const missingSlots = Math.max(0, MAX_BARS - chronological.length);
  const bars: Array<RecentCheck | null> = [
    ...Array.from({ length: missingSlots }, () => null),
    ...chronological,
  ].slice(-MAX_BARS);

  const onlineCount = checks.filter((check) => check.status === "online").length;
  const offlineCount = checks.filter((check) => check.status === "offline").length;

  return (
    <div className="w-full overflow-x-auto">
      <div
        role="img"
        aria-label={`Disponibilité sur les 60 dernières vérifications : ${onlineCount} en ligne, ${offlineCount} hors ligne`}
        className="flex h-10 w-max items-end gap-0.5"
      >
        {bars.map((check, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`w-1.25 shrink-0 rounded-sm ${getBarColor(check?.status)}`}
            style={{ height: `${getBarHeight(check?.responseTime ?? null)}px` }}
          />
        ))}
      </div>
    </div>
  );
}
