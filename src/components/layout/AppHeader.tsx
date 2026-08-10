import Link from "next/link";
import { Settings } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";

// En-tête global de l'application, affiché sur toutes les pages (voir layout.tsx).
// Ne contient volontairement qu'un seul bouton (Paramètres) : les actions propres
// à une page (rechercher, tracker un site, ...) vivent dans cette page, pas ici.
export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-zinc-50">
          WebWatcher
        </Link>
        <Link href="/settings" aria-label="Paramètres" className={buttonClasses("ghost", "px-2.5")}>
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
