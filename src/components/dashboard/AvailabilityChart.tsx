import type { RecentCheck } from "@/lib/types";

const DEFAULT_MAX_BARS = 50;
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
  // Nombre de créneaux affichés (60 sur le dashboard, 100 sur la page de détails d'un site)
  maxBars?: number;
};

// Graphique de disponibilité réutilisable : `maxBars` créneaux, du plus ancien (gauche) au plus
// récent (droite). Complété à gauche par des créneaux "pas vérifié" si l'historique est plus court.
// Le conteneur est en `overflow-hidden` avec les barres plaquées à droite (justify-end) : sur un
// écran étroit qui n'a pas la place pour tous les créneaux, ce sont les plus anciens (à gauche)
// qui disparaissent et les plus récents restent toujours visibles — pas de défilement horizontal.
export function AvailabilityChart({ checks, maxBars = DEFAULT_MAX_BARS }: AvailabilityChartProps) {
  const chronological = [...checks].reverse();
  const missingSlots = Math.max(0, maxBars - chronological.length);
  const bars: Array<RecentCheck | null> = [
    ...Array.from({ length: missingSlots }, () => null),
    ...chronological,
  ].slice(-maxBars);

  const onlineCount = checks.filter((check) => check.status === "online").length;
  const offlineCount = checks.filter((check) => check.status === "offline").length;

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div
        role="img"
        aria-label={`Disponibilité sur les ${maxBars} dernières vérifications : ${onlineCount} en ligne, ${offlineCount} hors ligne`}
        className="flex h-10 items-end justify-end gap-0.5"
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
