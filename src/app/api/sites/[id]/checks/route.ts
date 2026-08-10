import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-response";
import { HttpError } from "@/lib/http-error";

const PAGE_SIZE = 30;

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/sites/[id]/checks?page=1 — historique paginé des vérifications d'un site,
// avec le détail de l'erreur associée (type + message complet) le cas échéant.
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const site = await prisma.site.findUnique({ where: { id }, select: { id: true } });
    if (!site) {
      throw new HttpError(404, "Site not found");
    }

    const pageParam = Number(request.nextUrl.searchParams.get("page"));
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const [checks, totalCount] = await Promise.all([
      prisma.checkResult.findMany({
        where: { siteId: id },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          timestamp: true,
          status: true,
          responseTime: true,
          httpCode: true,
          error: { select: { type: true, message: true } },
        },
      }),
      prisma.checkResult.count({ where: { siteId: id } }),
    ]);

    return NextResponse.json({
      checks,
      page,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
