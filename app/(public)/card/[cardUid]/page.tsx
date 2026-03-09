import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function CardRedirectPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ cardUid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { cardUid } = await params;
  const resolvedSearchParams = await searchParams;
  const source = resolvedSearchParams.source as string | undefined;

  const card = await prisma.nfcCard.findUnique({
    where: { cardUid },
    include: {
      profile: true,
      user: {
        select: {
          isActive: true,
          inviteToken: true,
        }
      }
    },
  });

  if (!card) {
    notFound();
  }

  // If card is linked to a user who hasn't accepted their invite yet
  if (card.user && !card.user.isActive && card.user.inviteToken) {
    redirect(`/invite/accept?token=${card.user.inviteToken}`);
  }


  // If card is linked to a profile, record view and redirect
  if (card.profile) {
    // Record the view directly here
    try {
      let sourceType: "QR" | "NFC" | "LINK" = "LINK";
      if (source === "qr") sourceType = "QR";
      else if (source === "nfc") sourceType = "NFC";

      await prisma.profileView.create({
        data: {
          profileId: card.profile.id,
          sourceType,
        },
      });
    } catch (error) {
      console.error("Failed to record profile view:", error);
    }

    redirect(`/profile/${card.profile.username}?skip_track=true`);
  }

  // Fallback
  notFound();
}
