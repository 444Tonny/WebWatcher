import type { Metadata } from "next";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "WebWatcher · Paramètres",
  description: "Fréquence de vérification et notifications Telegram",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
