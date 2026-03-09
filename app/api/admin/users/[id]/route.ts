import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

// GET /api/admin/users/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_USER_GET]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, role, department, employeeId, companyId, isActive } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role: role as UserRole }),
        ...(department !== undefined && { department }),
        ...(employeeId !== undefined && { employeeId }),
        ...(companyId !== undefined && { companyId: companyId || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATED_USER",
        targetId: user.id,
        details: body,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[ADMIN_USER_PATCH]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Employee ID already in use." }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
    }

    const user = await prisma.user.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "DELETED_USER",
        targetId: id,
        details: { email: user.email },
      },
    });

    return NextResponse.json({ message: "User deleted." });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
