"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Plus, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { SiteFormModal } from "@/components/dashboard/SiteFormModal";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import type { SiteRecord } from "@/lib/types";

const SEARCH_DEBOUNCE_MS = 300;

export function DashboardClient() {
  const [sites, setSites] = useState<SiteRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const isFirstFetch = useRef(true);

  const [verifyingAll, setVerifyingAll] = useState(false);
  const [checkingSiteId, setCheckingSiteId] = useState<string | null>(null);

  const [formModal, setFormModal] = useState<{ open: boolean; site: SiteRecord | null }>({
    open: false,
    site: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<SiteRecord | null>(null);

  const fetchSites = useCallback(async (search: string, { silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/sites${query}`);
      if (!response.ok) throw new Error("Failed to load sites. Please try again.");

      const data: SiteRecord[] = await response.json();
      setSites(data);
      if (!silent) setLoadError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sites. Please try again.";
      if (silent) setBanner(message);
      else setLoadError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Chargement immédiat au montage, puis recherche différée (debounce) à chaque frappe
  useEffect(() => {
    const delay = isFirstFetch.current ? 0 : SEARCH_DEBOUNCE_MS;
    const silent = !isFirstFetch.current;

    const handle = setTimeout(() => {
      fetchSites(searchTerm, { silent });
      isFirstFetch.current = false;
    }, delay);

    return () => clearTimeout(handle);
  }, [searchTerm, fetchSites]);

  async function handleVerifySite(site: SiteRecord) {
    setCheckingSiteId(site.id);
    setBanner(null);

    try {
      const response = await fetch(`/api/cron?siteId=${site.id}`, { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to check this site. Please try again.");
      }
      await fetchSites(searchTerm, { silent: true });
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Failed to check this site. Please try again.");
    } finally {
      setCheckingSiteId(null);
    }
  }

  async function handleVerifyAll() {
    setVerifyingAll(true);
    setBanner(null);

    try {
      const response = await fetch("/api/cron?force=true", { method: "POST" });
      if (!response.ok) throw new Error("Failed to check sites. Please try again.");
      await fetchSites(searchTerm, { silent: true });
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Failed to check sites. Please try again.");
    } finally {
      setVerifyingAll(false);
    }
  }

  async function handleDeleteConfirm(site: SiteRecord) {
    const response = await fetch(`/api/sites/${site.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to delete this site. Please try again.");
    }
    await fetchSites(searchTerm, { silent: true });
  }

  const siteCount = sites?.length ?? 0;

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-50">Sites surveillés</h1>
            <p className="text-sm text-zinc-500">
              {siteCount} site{siteCount > 1 ? "s" : ""} suivi{siteCount > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un site par nom ou URL"
                aria-label="Rechercher un site"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" icon={Plus} onClick={() => setFormModal({ open: true, site: null })}>
                Tracker un site
              </Button>
              <Button variant="secondary" icon={RefreshCw} loading={verifyingAll} onClick={handleVerifyAll}>
                Vérifier tous les sites
              </Button>
            </div>
          </div>
        </div>

        {banner && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden="true" />
            <p className="flex-1">{banner}</p>
            <button
              type="button"
              onClick={() => setBanner(null)}
              aria-label="Fermer le message"
              className="rounded p-0.5 text-red-300 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {loading && sites === null ? (
          <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement des sites">
            {[0, 1, 2].map((key) => (
              <li key={key} className="h-32 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </ul>
        ) : loadError && sites === null ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
            <p className="text-sm text-zinc-400">{loadError}</p>
            <Button variant="secondary" icon={RefreshCw} onClick={() => fetchSites(searchTerm)}>
              Réessayer
            </Button>
          </div>
        ) : sites && sites.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">
              {searchTerm ? (
                <>Aucun site ne correspond à « {searchTerm} ».</>
              ) : (
                <>Aucun site suivi pour le moment.</>
              )}
            </p>
            {!searchTerm && (
              <Button variant="primary" icon={Plus} onClick={() => setFormModal({ open: true, site: null })}>
                Tracker un site
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden gap-4 pt-12 px-4 pb-4 text-xs font-medium tracking-wide text-zinc-500 uppercase sm:px-5 lg:flex">
              <span className="lg:w-86 lg:shrink-0">Site</span>
              <span className="lg:w-20 lg:shrink-0">Statut</span>
              <span className="lg:w-22 lg:shrink-0">Réponse</span>
              <span className="lg:w-50 lg:shrink-0">Dernière vérification</span>
              <span className="lg:w-32 lg:shrink-0 text-right">Actions</span>
            </div>

            <ul className={`flex flex-col gap-4 transition-opacity ${refreshing ? "opacity-70" : ""}`}>
              {sites?.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  checking={checkingSiteId === site.id}
                  onVerify={handleVerifySite}
                  onEdit={(target) => setFormModal({ open: true, site: target })}
                  onDelete={setDeleteTarget}
                />
              ))}
            </ul>
          </>
        )}
      </main>

      {formModal.open && (
        <SiteFormModal
          site={formModal.site}
          onClose={() => setFormModal({ open: false, site: null })}
          onSuccess={() => fetchSites(searchTerm, { silent: true })}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          siteName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteConfirm(deleteTarget)}
        />
      )}
    </>
  );
}
