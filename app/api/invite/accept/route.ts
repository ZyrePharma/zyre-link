import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { inviteToken: token } });

    if (!user || !user.inviteTokenExpiry || user.inviteTokenExpiry < new Date()) {
      return NextResponse.json({ message: "Invite link is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        inviteToken: null,
        inviteTokenExpiry: null,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ message: "Account activated successfully." });
  } catch (error: any) {
    console.error("[ACCEPT_INVITE_POST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
