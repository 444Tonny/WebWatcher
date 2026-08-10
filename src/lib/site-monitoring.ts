import { prisma } from "@/lib/prisma";
import { checkSite } from "@/lib/checkSite";
import type { Site } from "@/app/generated/prisma/client";

export type SiteCheckSummary = {
  siteId: string;
  status: string;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
  name: string;
  url: string;
};

const DEFAULT_CHECK_INTERVAL_SECONDS = 300;

// Lit l'intervalle de vérification configuré dans Settings (ligne unique "global"),
// avec repli sur la valeur par défaut du schéma si aucun réglage n'existe encore.
async function getCheckIntervalSeconds(): Promise<number> {
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });
  return settings?.checkInterval ?? DEFAULT_CHECK_INTERVAL_SECONDS;
}

// Sélectionne les sites à vérifier selon le mode demandé :
// - `siteId` : uniquement ce site, toujours vérifié immédiatement ;
// - `force`  : tous les sites, sans tenir compte de l'intervalle ;
// - sinon    : uniquement les sites dont l'intervalle est dépassé (ou jamais vérifiés).
export async function getSitesToCheck(options: {
  siteId?: string;
  force?: boolean;
}): Promise<Site[]> {
  if (options.siteId) {
    const site = await prisma.site.findUnique({ where: { id: options.siteId } });
    return site ? [site] : [];
  }

  if (options.force) {
    return prisma.site.findMany();
  }

  const intervalSeconds = await getCheckIntervalSeconds();
  const dueBefore = new Date(Date.now() - intervalSeconds * 1000);

  return prisma.site.findMany({
    where: {
      OR: [{ lastCheck: null }, { lastCheck: { lte: dueBefore } }],
    },
  });
}

// Vérifie un site, enregistre le résultat (CheckResult + SiteError en cas d'échec) et met à jour le site.
export async function runSiteCheck(site: Site): Promise<SiteCheckSummary> {
  const result = await checkSite(site.url);
  const now = new Date();

  const check = await prisma.checkResult.create({
    data: {
      siteId: site.id,
      timestamp: now,
      status: result.status,
      responseTime: result.responseTime,
      httpCode: result.httpCode,
    },
  });

  if (result.errorType) {
    await prisma.siteError.create({
      data: {
        checkId: check.id,
        siteId: site.id,
        timestamp: now,
        type: result.errorType,
        message: result.errorMessage ?? "Unknown error",
      },
    });
  }

  await prisma.site.update({
    where: { id: site.id },
    data: {
      status: result.status,
      responseTime: result.responseTime,
      lastCheck: now,
    },
  });

  return {
    siteId: site.id,
    status: result.status,
    responseTime: result.responseTime,
    errorType: result.errorType,
    errorMessage: result.errorMessage,
    name: site.name,
    url: site.url,
  };
}
