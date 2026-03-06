import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/cards/[id]  - update card (lock/unlock, assign, notes, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cardUid, isLocked, isDeactivated, userId, profileId, notes } = body;

    // Check if new cardUid is already taken
    if (cardUid) {
      const existing = await prisma.nfcCard.findFirst({
        where: {
          cardUid,
          NOT: { id }
        }
      });
      if (existing) {
        return NextResponse.json({ message: "Card serial number already in use." }, { status: 400 });
      }
    }

    // If assigning to a user, verify user exists and get their profileId
    let resolvedProfileId = profileId;
    if (userId !== undefined) {
      if (userId === null) {
        resolvedProfileId = null;
      } else {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
        if (!user) {
          return NextResponse.json({ message: "User not found." }, { status: 404 });
        }
        resolvedProfileId = user.profile?.id ?? null;
      }
    }

    const card = await prisma.nfcCard.update({
      where: { id },
      data: {
        ...(cardUid !== undefined && { cardUid }),
        ...(isLocked !== undefined && { isLocked }),
        ...(isDeactivated !== undefined && { isDeactivated }),
        ...(notes !== undefined && { notes }),
        ...(userId !== undefined && {
          userId,
          profileId: resolvedProfileId,
          assignedAt: userId ? new Date() : null,
          isActivated: userId ? true : false,
          activatedAt: userId ? new Date() : null,
        }),
      },
      include: { user: true, profile: true },
    });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATED_CARD",
        targetId: card.id,
        details: body,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("[ADMIN_CARD_PATCH]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/cards/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.nfcCard.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "DELETED_CARD",
        targetId: id,
        details: {},
      },
    });

    return NextResponse.json({ message: "Card deleted." });
  } catch (error) {
    console.error("[ADMIN_CARD_DELETE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
