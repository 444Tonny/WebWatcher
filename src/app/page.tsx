import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  title: "WebWatcher · Surveillance de sites web",
  description:
    "Surveillez la disponibilité de vos sites web en temps réel : statut, temps de réponse, historique des vérifications et alertes Telegram.",
  openGraph: {
    title: "WebWatcher",
    description: "Surveillez la disponibilité de vos sites web en temps réel.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24">
      {/* Formes abstraites, purement décoratives */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-zinc-700/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">WebWatcher</h1>
        <p className="mt-4 text-lg text-balance text-zinc-400">
          Surveillez la disponibilité de vos sites web : statut, temps de réponse et historique des
          vérifications, en un coup d’œil.
        </p>
        <div className="mt-8">
          <Link href="/dashboard" className={buttonClasses("primary")}>
            Commencer
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
