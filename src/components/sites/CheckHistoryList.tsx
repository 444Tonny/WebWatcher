"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatCheckTimestamp } from "@/lib/format-date";
import { translateErrorType } from "@/lib/error-type";
import type { CheckHistoryPage } from "@/lib/types";

type CheckHistoryListProps = { siteId: string };

// Historique paginé (30/page) des vérifications d'un site, avec le détail complet de l'erreur
// en cas d'échec. Mise en page en flexbox (pas de CSS grid), largeur fixe sur la colonne date
// pour un alignement uniforme d'une ligne à l'autre.
export function CheckHistoryList({ siteId }: CheckHistoryListProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CheckHistoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);

      try {
        const response = await fetch(`/api/sites/${siteId}/checks?page=${targetPage}`);
        if (!response.ok) throw new Error("Failed to load check history. Please try again.");

        setData(await response.json());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load check history. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [siteId]
  );

  useEffect(() => {
    const handle = setTimeout(() => fetchPage(page), 0);
    return () => clearTimeout(handle);
  }, [page, fetchPage]);

  if (loading && !data) {
    return <div className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-10 text-center">
        <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
        <p className="text-sm text-zinc-400">{error}</p>
        <Button variant="secondary" icon={RefreshCw} onClick={() => fetchPage(page)}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!data || data.checks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center text-sm text-zinc-400">
        Aucune vérification enregistrée pour ce site.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
      <ul className={`flex flex-col transition-opacity ${loading ? "opacity-60" : ""}`}>
        {data.checks.map((check) => (
          <li key={check.id} className="flex flex-col gap-6 border-b border-zinc-800/80 pt-6 pb-6 last:border-b-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm whitespace-nowrap text-zinc-200 sm:w-44 sm:shrink-0">
                {formatCheckTimestamp(check.timestamp)}
              </span>
              <StatusBadge status={check.status} />
              <span className="text-sm text-zinc-400">
                {check.responseTime !== null ? `${check.responseTime} ms` : "—"}
              </span>
              {check.httpCode !== null && <span className="text-sm text-zinc-500">HTTP {check.httpCode}</span>}
            </div>

            {check.error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                <span className="font-medium">{translateErrorType(check.error.type)}</span> — {check.error.message}
              </p>
            )}
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
}
