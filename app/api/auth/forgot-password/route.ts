import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log("[FORGOT_PASSWORD] Requested for:", email);

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("[FORGOT_PASSWORD] User not found:", email);
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry

    console.log("[FORGOT_PASSWORD] Generated token for:", email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    console.log("[FORGOT_PASSWORD] Database updated for:", email);

    // Send email
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const appUrl = `${protocol}://${host}`;
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    console.log("[FORGOT_PASSWORD] SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE
    });

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

    console.log("[FORGOT_PASSWORD] Attempting to send email to:", email);

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Password Reset Request - Zyre Link",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Password Reset</h2>
          <p>You requested a password reset for your Zyre Link account.</p>
          <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">Zyre Link - Digital Business Card Management</p>
        </div>
      `,
    });

    console.log("[FORGOT_PASSWORD] Email sent successfully to:", email);

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("[FORGOT_PASSWORD_ERROR] Stack:", error.stack || error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
