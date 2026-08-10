export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400",
  secondary: "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  // Bordure visible mais fond transparent : délimite clairement le bouton sans le charger autant que "secondary"
  outline: "border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white",
  ghost: "text-zinc-300 hover:bg-zinc-800 hover:text-white",
  danger: "text-red-400 hover:bg-red-500/10 hover:text-red-300",
};

// Classes partagées entre <Button> et les <Link> stylés comme des boutons (ex: lien Paramètres)
export function buttonClasses(variant: ButtonVariant = "secondary", className = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}
