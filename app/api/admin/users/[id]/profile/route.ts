import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContactType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      username, 
      firstName, 
      lastName, 
      jobTitle, 
      department, 
      bio, 
      officeLocation, 
      teamName, 
      extension,
      profilePhotoUrl,
      coverPhotoUrl,
      contactMethods,
      socialLinks,
      customLinks,
      autoDownloadVcf,
      layout
    } = body;

    // Check if username is already taken by another user
    if (username) {
      const existingProfile = await prisma.profile.findFirst({
        where: {
          username,
          NOT: {
            userId: userId
          }
        }
      });

      if (existingProfile) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        username,
        firstName,
        lastName,
        jobTitle,
        department,
        bio,
        officeLocation,
        teamName,
        extension,
        profilePhotoUrl,
        coverPhotoUrl,
        autoDownloadVcf,
        layout,
        contactMethods: {
          create: contactMethods?.map((m: any) => ({
            type: m.type,
            label: m.label,
            value: m.value,
            isPrimary: m.isPrimary
          })) || []
        },
        socialLinks: {
          create: socialLinks?.map((s: any) => ({
            platform: s.platform,
            url: s.url
          })) || []
        },
        customLinks: {
          create: customLinks?.map((c: any) => ({
            title: c.title,
            url: c.url,
            description: c.description
          })) || []
        }
      },
      update: {
        username,
        firstName,
        lastName,
        jobTitle,
        department,
        bio,
        officeLocation,
        teamName,
        extension,
        profilePhotoUrl,
        coverPhotoUrl,
        autoDownloadVcf,
        layout,
        contactMethods: {
          deleteMany: {},
          create: contactMethods?.map((m: any) => ({
            type: m.type,
            label: m.label,
            value: m.value,
            isPrimary: m.isPrimary
          })) || []
        },
        socialLinks: {
          deleteMany: {},
          create: socialLinks?.map((s: any) => ({
            platform: s.platform,
            url: s.url
          })) || []
        },
        customLinks: {
          deleteMany: {},
          create: customLinks?.map((c: any) => ({
            title: c.title,
            url: c.url,
            description: c.description
          })) || []
        }
      },
    });

    // Log the action
    await prisma.adminLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATED_USER_PROFILE",
        targetId: userId,
        details: { profileId: updatedProfile.id, ...body },
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[ADMIN_PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
