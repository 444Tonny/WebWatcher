"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

// Pagination simple (précédent/suivant), utilisée pour l'historique des vérifications.
// Empilée sur mobile (les deux boutons peuvent être trop larges côte à côte sur un petit écran).
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
      <span className="order-first text-sm text-zinc-400 sm:order-0">
        Page {page} sur {totalPages}
      </span>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <Button variant="outline" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Précédent
        </Button>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Suivant
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
