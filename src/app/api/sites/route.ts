import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-response";
import { parseCreateSiteInput } from "@/lib/site-input";

// GET /api/sites — liste les sites, avec recherche optionnelle sur le nom ou l'URL (?search=xxx)
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim();

    const sites = await prisma.site.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { url: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sites);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// POST /api/sites — ajoute un nouveau site à surveiller
export async function POST(request: NextRequest) {
  try {
    const input = parseCreateSiteInput(await request.json());
    const site = await prisma.site.create({ data: input });
    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
