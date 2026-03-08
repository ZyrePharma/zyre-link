import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { WelcomeEmailHtml } from "@/emails/welcome-email";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, role, department, employeeId, companyId, cardUid } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if card exists and is available if cardUid is provided
    let card = null;
    if (cardUid) {
      card = await prisma.nfcCard.findUnique({
        where: { cardUid },
      });
      if (!card) {
        return NextResponse.json({ message: "Card not found" }, { status: 400 });
      }
      if (card.userId) {
        return NextResponse.json({ message: "Card already assigned to another user" }, { status: 400 });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    // Default password: Zyre0211
    const hashedPassword = await bcrypt.hash("Zyre0211", 10);

    // Create user and profile (activated immediately with default password)
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: role as UserRole,
        department,
        employeeId,
        company: companyId ? { connect: { id: companyId } } : undefined,
        isActive: true,
        password: hashedPassword,
        mustChangePassword: true,
        profile: {
          create: {
            username: email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, ""),
            firstName: name.split(" ")[0] || "",
            lastName: name.split(" ").slice(1).join(" ") || "",
            jobTitle: "New Employee",
            department,
            contactMethods: {
              create: [
                { type: "EMAIL", value: email, label: "Work", isPrimary: true },
              ],
            },
          },
        },
      },
      include: {
        profile: true,
      }
    });

    // Link card to user if provided
    if (cardUid && card) {
      await prisma.nfcCard.update({
        where: { id: card.id },
        data: {
          userId: newUser.id,
          profileId: newUser.profile?.id,
          assignedAt: new Date(),
          isActivated: true, // Mark as activated for the user
          activatedAt: new Date(),
        },
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "CREATED_USER",
        targetId: newUser.id,
        details: { email, role, department, cardUid },
      },
    });

    // Send welcome email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const FROM_EMAIL = process.env.SMTP_FROM || '"Zyre Link" <noreply@zyre.link>';

    try {
      const emailInfo = await transporter.sendMail({
        from: FROM_EMAIL,
        to: email,
        subject: `Welcome to Zyre Link`,
        html: WelcomeEmailHtml({ name, email }),
      });
      console.log("[NODEMAILER_EMAIL_SENT]", emailInfo.messageId);
    } catch (emailError: any) {
      console.error("[NODEMAILER_EMAIL_ERROR]", emailError);
      // Clean up user if email failed to send (optional, but safer to let admin know)
      // await prisma.user.delete({ where: { id: newUser.id } }); 
      // return NextResponse.json({ message: `Failed to send welcome email: ${emailError.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "User created successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN_USERS_POST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
