import type { Metadata } from "next";
import { SiteDetailClient } from "./SiteDetailClient";

export const metadata: Metadata = {
  title: "WebWatcher · Détails du site",
};

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <SiteDetailClient siteId={id} />;
}
