import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { cardUid, token } = await req.json();

    // Check if authenticated as admin
    const session = await auth();
    const isAdmin = session && (session.user as any).role === "ADMIN";

    // If not admin, check for valid scanner token
    if (!isAdmin) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const validToken = await prisma.verificationToken.findFirst({
        where: {
          token,
          identifier: "scanner_session",
          expires: { gt: new Date() }
        }
      });

      if (!validToken) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }
    }

    if (!cardUid) {
      return NextResponse.json({ error: "Serial number is required" }, { status: 400 });
    }

    // Check if card with this serial number already exists
    const existingCard = await prisma.nfcCard.findUnique({
      where: { cardUid }
    });

    if (existingCard) {
      return NextResponse.json({ error: "Card with this serial number already registered" }, { status: 400 });
    }

    const newCard = await prisma.nfcCard.create({
      data: {
        cardUid,
        isActivated: false,
        isLocked: false
      }
    });

    return NextResponse.json(newCard);
  } catch (error) {
    console.error("[ADMIN_CARD_REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
