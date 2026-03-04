import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import vCard from "vcf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username, isActive: true },
    include: {
      contactMethods: true,
      socialLinks: true,
    },
  });

  if (!profile) {
    return new NextResponse("Profile not found", { status: 404 });
  }

  const card = new vCard();
  card.add("fn", `${profile.firstName} ${profile.lastName}`);
  card.add("n", `${profile.lastName};${profile.firstName}`);
  
  if (profile.jobTitle) card.add("title", profile.jobTitle);
  if (profile.department) card.add("org", profile.department);

  profile.contactMethods.forEach((method: any) => {
    if (method.type === "EMAIL") {
      card.add("email", method.value, { type: method.label || "work" });
    } else if (method.type === "PHONE") {
      card.add("tel", method.value, { type: method.label || "work" });
    }
  });

  profile.socialLinks.forEach((link: any) => {
    card.add("url", link.url, { type: link.platform });
  });


  const vcfData = card.toString();

  return new NextResponse(vcfData, {
    headers: {
      "Content-Type": "text/vcard",
      "Content-Disposition": `attachment; filename="${username}.vcf"`,
    },
  });
}
