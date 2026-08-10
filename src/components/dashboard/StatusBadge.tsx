import { CheckCircle2, HelpCircle, XCircle, type LucideIcon } from "lucide-react";

type StatusConfig = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  online: {
    label: "Online",
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  offline: {
    label: "Offline",
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

const UNKNOWN_CONFIG: StatusConfig = {
  label: "Inconnu",
  icon: HelpCircle,
  className: "border-zinc-600/40 bg-zinc-700/20 text-zinc-400",
};

// Pastille de statut : la couleur seule ne porte jamais l'information (icône + libellé toujours présents)
export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? UNKNOWN_CONFIG;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
