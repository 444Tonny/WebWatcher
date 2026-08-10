"use client";

import { useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { SiteRecord } from "@/lib/types";

type SiteFormModalProps = {
  // null/undefined = mode création, sinon mode modification
  site?: SiteRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

// Formulaire de création/modification d'un site, utilisé à la fois par "Tracker un site" et "Modifier".
// N'est monté par le parent que lorsqu'il doit être affiché : les champs partent donc toujours vierges
// (ou pré-remplis pour une modification) sans avoir besoin d'un effet de réinitialisation.
export function SiteFormModal({ site, onClose, onSuccess }: SiteFormModalProps) {
  const isEdit = Boolean(site);
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(isEdit ? `/api/sites/${site!.id}` : "/api/sites", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} title={isEdit ? "Modifier le site" : "Tracker un site"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="site-name" className="text-sm font-medium text-zinc-300">
            Nom
          </label>
          <input
            id="site-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Mon site"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="site-url" className="text-sm font-medium text-zinc-300">
            URL
          </label>
          <input
            id="site-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://exemple.com"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" icon={isEdit ? Save : Plus} loading={submitting}>
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
