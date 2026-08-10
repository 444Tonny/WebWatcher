"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type ConfirmDeleteDialogProps = {
  siteName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

// Confirmation avant suppression définitive d'un site (et de tout son historique, via la cascade en base).
export function ConfirmDeleteDialog({ siteName, onClose, onConfirm }: ConfirmDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal onClose={onClose} title="Supprimer ce site ?">
      <p className="text-sm text-zinc-400">
        Le site <span className="font-medium text-zinc-200">{siteName}</span> et tout son historique de
        vérifications seront définitivement supprimés. Cette action est irréversible.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="danger" icon={Trash2} loading={deleting} onClick={handleConfirm}>
          Supprimer
        </Button>
      </div>
    </Modal>
  );
}
