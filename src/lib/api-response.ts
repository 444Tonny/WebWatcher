import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { HttpError } from "@/lib/http-error";

// Transforme n'importe quelle erreur levée dans une route /api en réponse JSON adaptée.
// Tous les messages renvoyés au client sont en anglais (destinés à l'utilisateur final).
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A site with this URL already exists" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
