import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = nanoid(32);
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: "scanner_session",
        token,
        expires,
      },
    });

    return NextResponse.json({ token, expires });
  } catch (error) {
    console.error("[ADMIN_SCANNER_TOKEN_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const validToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: "scanner_session",
        expires: { gt: new Date() }
      }
    });

    return NextResponse.json({ valid: !!validToken });
  } catch (error) {
    console.error("[ADMIN_SCANNER_TOKEN_VALIDATE_ERROR]", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
