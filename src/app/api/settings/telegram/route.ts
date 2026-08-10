import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-response";

// Ligne unique de réglages globaux (voir le défaut du modèle Settings dans le schéma Prisma)
const SETTINGS_ID = "global";

// GET/POST /api/settings/telegram — utilisé par le workflow n8n pour savoir s'il doit notifier
// et vers quels Chat IDs. L'app ne parle jamais directement à Telegram : c'est n8n qui envoie
// le message, avec son propre bot token (voir CONTEXT.md).
async function getTelegramSettings() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });

    return NextResponse.json({
      notifyOnError: settings.notifyOnError,
      telegramChatIds: settings.telegramChatIds,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET() {
  return getTelegramSettings();
}

export async function POST() {
  return getTelegramSettings();
}
