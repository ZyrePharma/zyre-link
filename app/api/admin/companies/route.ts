import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ message: "Company name is required" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl || null,
        cardTemplateUrl: data.cardTemplateUrl || null,
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
