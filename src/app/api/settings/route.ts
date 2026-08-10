import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-response";
import { parseUpdateSettingsInput } from "@/lib/settings-input";

// Ligne unique de réglages globaux (voir le défaut du modèle Settings dans le schéma Prisma)
const SETTINGS_ID = "global";

// GET /api/settings — récupère les réglages globaux (créés avec les valeurs par défaut au premier appel)
export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// PUT /api/settings — met à jour un ou plusieurs réglages (fréquence de vérification, notifications Telegram)
export async function PUT(request: NextRequest) {
  try {
    const input = parseUpdateSettingsInput(await request.json());

    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: input,
      create: { id: SETTINGS_ID, ...input },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return toErrorResponse(error);
  }
}
