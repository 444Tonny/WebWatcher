import Link from "next/link";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/button-styles";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AvailabilityChart } from "@/components/dashboard/AvailabilityChart";
import { formatCheckTimestamp } from "@/lib/format-date";
import type { SiteRecord } from "@/lib/types";

type SiteCardProps = {
  site: SiteRecord;
  checking: boolean;
  onVerify: (site: SiteRecord) => void;
  onEdit: (site: SiteRecord) => void;
  onDelete: (site: SiteRecord) => void;
};

// Une carte = 2 lignes : infos + actions (alignées en colonnes, comme un tableau, à partir de lg),
// puis le graphique de disponibilité + le bouton de vérification.
export function SiteCard({ site, checking, onVerify, onEdit, onDelete }: SiteCardProps) {
  return (
    <li className="rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-4">
        <div className="min-w-0 lg:flex-1">
          <p className="truncate font-semibold text-zinc-50">{site.name}</p>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            title={site.url}
            className="block truncate text-sm text-zinc-400 hover:text-indigo-400 hover:underline"
          >
            {site.url}
          </a>
        </div>

        <div className="lg:w-26 lg:shrink-0">
          <StatusBadge status={site.status} />
        </div>

        <div className="text-sm lg:w-22 lg:shrink-0 lg:whitespace-nowrap">
          <span className="text-zinc-500 lg:hidden">Temps de réponse : </span>
          <span className="text-zinc-200">{site.responseTime !== null ? `${site.responseTime} ms` : "—"}</span>
        </div>

        <div className="text-sm lg:w-50 lg:shrink-0 lg:whitespace-nowrap">
          <span className="text-zinc-500 lg:hidden">Dernière vérification : </span>
          <span className="text-zinc-200">{formatCheckTimestamp(site.lastCheck)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
          <Link href={`/sites/${site.id}`} className={buttonClasses("outline")}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Détails
          </Link>
          <Button variant="outline" icon={Pencil} onClick={() => onEdit(site)}>
            Modifier
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            aria-label={`Supprimer ${site.name}`}
            onClick={() => onDelete(site)}
            className="px-2.5"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-800/80 px-4 py-3 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
        
        <Button variant="secondary" icon={RefreshCw} loading={checking} onClick={() => onVerify(site)}>
          Vérifier
        </Button>

        <AvailabilityChart checks={site.checks} />
      </div>
    </li>
  );
}
