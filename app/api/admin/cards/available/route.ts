import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.nfcCard.findMany({
      where: { 
        userId: null,
        isDeactivated: false 
      },
      select: { 
        id: true, 
        cardUid: true 
      },
      orderBy: { cardUid: "asc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("[ADMIN_CARDS_AVAILABLE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
