import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { InviteEmailHtml } from "@/emails/invite-email";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, role, department, employeeId } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }

    // Generate a secure invite token (48h expiry)
    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create user and profile (no password – must be set via invite link)
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: role as UserRole,
        department,
        employeeId,
        isActive: false, // account inactive until invite is accepted
        inviteToken,
        inviteTokenExpiry,
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
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "INVITED_USER",
        targetId: newUser.id,
        details: { email, role, department },
      },
    });

    // Send invite email via Nodemailer
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite/accept?token=${inviteToken}`;
    const inviterName = session.user.name || "Admin";

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
        subject: `You're invited to Zyre Link`,
        html: InviteEmailHtml({ name, inviteUrl, inviterName }),
      });
      console.log("[NODEMAILER_EMAIL_SENT]", emailInfo.messageId);
    } catch (emailError: any) {
      console.error("[NODEMAILER_EMAIL_ERROR]", emailError);
      // Clean up user if email failed to send
      await prisma.user.delete({ where: { id: newUser.id } });
      return NextResponse.json({ message: `Failed to send invite email: ${emailError.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: "Invite sent successfully." }, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN_USERS_POST]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
