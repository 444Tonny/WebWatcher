"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AvailabilityChart } from "@/components/dashboard/AvailabilityChart";
import { SiteFormModal } from "@/components/dashboard/SiteFormModal";
import { CheckHistoryList } from "@/components/sites/CheckHistoryList";
import { formatCheckTimestamp } from "@/lib/format-date";
import type { SiteRecord } from "@/lib/types";

type SiteDetailClientProps = { siteId: string };

const CHART_MAX_BARS = 100;

// Un champ de la section "informations générales" : libellé + valeur, alignés en flexbox.
// min-w-[45%] tient sur deux colonnes en mobile sans déborder ; sm:min-w-40 donne plus d'air au-delà.
function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-[45%] flex-col gap-1 sm:min-w-40">
      <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{label}</span>
      <div className="text-sm text-zinc-200">{children}</div>
    </div>
  );
}

export function SiteDetailClient({ siteId }: SiteDetailClientProps) {
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchSite = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/sites/${siteId}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load this site. Please try again.");
      }
      setSite(await response.json());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load this site. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    const handle = setTimeout(fetchSite, 0);
    return () => clearTimeout(handle);
  }, [fetchSite]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au dashboard
      </Link>

      {loading && !site ? (
        <div className="mt-6 flex flex-col gap-4">
          <div className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
          <div className="h-28 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
          <div className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
        </div>
      ) : loadError && !site ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
          <p className="text-sm text-zinc-400">{loadError}</p>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchSite}>
            Réessayer
          </Button>
        </div>
      ) : site ? (
        <>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-zinc-50">{site.name}</h1>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                title={site.url}
                className="text-sm text-zinc-400 hover:text-indigo-400 hover:underline"
              >
                {site.url}
              </a>
            </div>
            <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>
              Modifier
            </Button>
          </div>

          <section className="mt-6 flex flex-wrap gap-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <InfoField label="Statut">
              <StatusBadge status={site.status} />
            </InfoField>
            <InfoField label="Temps de réponse">
              {site.responseTime !== null ? `${site.responseTime} ms` : "—"}
            </InfoField>
            <InfoField label="Dernière vérification">{formatCheckTimestamp(site.lastCheck)}</InfoField>
            <InfoField label="Suivi depuis">{formatCheckTimestamp(site.createdAt)}</InfoField>
          </section>

          <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Disponibilité ({CHART_MAX_BARS} dernières vérifications)
            </h2>
            <AvailabilityChart checks={site.checks} maxBars={CHART_MAX_BARS} />
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">Historique des vérifications</h2>
            <CheckHistoryList siteId={siteId} />
          </section>

          {editOpen && (
            <SiteFormModal site={site} onClose={() => setEditOpen(false)} onSuccess={fetchSite} />
          )}
        </>
      ) : null}
    </main>
  );
}
