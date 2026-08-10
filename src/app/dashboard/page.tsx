import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "WebWatcher · Dashboard",
  description: "Liste et gestion des sites surveillés",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
