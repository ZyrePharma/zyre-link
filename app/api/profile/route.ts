import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
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
      customLinks
    } = body;

    // Check if username is already taken by another user
    if (username) {
      const existingProfile = await prisma.profile.findFirst({
        where: {
          username,
          NOT: {
            userId: session.user.id
          }
        }
      });

      if (existingProfile) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
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

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
