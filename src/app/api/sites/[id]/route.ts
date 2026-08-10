import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-response";
import { parseUpdateSiteInput } from "@/lib/site-input";
import { HttpError } from "@/lib/http-error";

type RouteParams = { params: Promise<{ id: string }> };

// Nombre de vérifications récentes renvoyées avec le site (graphique de disponibilité de la page détails)
const RECENT_CHECKS_LIMIT = 100;

// GET /api/sites/[id] — récupère un site précis
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        checks: {
          orderBy: { timestamp: "desc" },
          take: RECENT_CHECKS_LIMIT,
          select: { status: true, responseTime: true, timestamp: true },
        },
      },
    });
    if (!site) {
      throw new HttpError(404, "Site not found");
    }

    return NextResponse.json(site);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// PUT /api/sites/[id] — modifie le nom et/ou l'URL d'un site
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const input = parseUpdateSiteInput(await request.json());

    const site = await prisma.site.update({ where: { id }, data: input });
    return NextResponse.json(site);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// DELETE /api/sites/[id] — supprime un site (les CheckResult/SiteError liés partent en cascade)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.site.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
