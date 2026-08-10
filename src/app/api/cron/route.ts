import { NextRequest, NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api-response";
import { HttpError } from "@/lib/http-error";
import { getSitesToCheck, runSiteCheck } from "@/lib/site-monitoring";

// Appelé par le scheduler (n8n) pour déclencher les vérifications de sites.
// - sans paramètre       → uniquement les sites dont l'intervalle est dépassé ;
// - ?force=true          → tous les sites, sans tenir compte de l'intervalle ;
// - ?siteId=xxx          → un seul site, toujours vérifié immédiatement.
async function handleCron(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId") ?? undefined;
    const force = searchParams.get("force") === "true";

    const sites = await getSitesToCheck({ siteId, force });

    if (siteId && sites.length === 0) {
      throw new HttpError(404, "Site not found");
    }

    const results = await Promise.all(sites.map(runSiteCheck));

    return NextResponse.json(results);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
