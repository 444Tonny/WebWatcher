"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { buttonClasses, type ButtonVariant } from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
};

// Bouton générique de l'application : variantes de couleur, icône optionnelle, état de chargement.
export function Button({
  variant = "secondary",
  icon: Icon,
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} disabled={disabled || loading} {...props}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
