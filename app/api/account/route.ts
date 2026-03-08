import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, currentPassword, newPassword } = accountSchema.parse(body);

    // Get current user to verify password if they are trying to change it
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Check if email is being updated and verify it's not taken by another user
    if (email !== currentUser.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserWithEmail) {
        return NextResponse.json(
          { error: "Email already in use by another account" },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      // If the user doesn't have a password set (e.g. they sign in with OAuth) 
      // we might want to handle that differently but for now we expect a current password
      if (!currentUser.password) {
        return NextResponse.json(
          { error: "You cannot change your password because you do not have one set." },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }

      // Hash the new password and add to update data
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
      updateData.mustChangePassword = false;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("ACCOUNT_SETTINGS_PATCH_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
