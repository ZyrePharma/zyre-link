import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.companySettings.findFirst();

    if (!settings) {
       settings = await prisma.companySettings.create({
          data: {
              companyName: "Zyre",
              cardTemplateUrl: null
          }
       });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Assumes there is only ever one settings record for the company
    const settings = await prisma.companySettings.findFirst();

    if (!settings) {
      const newSettings = await prisma.companySettings.create({
        data: {
            ...data,
            companyName: data.companyName || "Zyre"
        }
      });
      return NextResponse.json(newSettings);
    }

    const updatedSettings = await prisma.companySettings.update({
      where: { id: settings.id },
      data,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
