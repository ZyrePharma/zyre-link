import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function NfcHandlerPage({ params }: { params: Promise<{ cardUid: string }> }) {
  const { cardUid } = await params;

  const card = await prisma.nfcCard.findUnique({
    where: { cardUid },
    include: {
      profile: true,
    },
  });

  if (!card) {
    notFound();
  }

  // If card is not activated, redirect to activation page
  if (!card.isActivated) {
    redirect(`/n/activate?uid=${cardUid}&code=${card.activationCode}`);
  }

  // If card is linked to a profile, redirect to that profile
  if (card.profile) {
    // Track stats
    await prisma.profileView.create({
      data: {
        profileId: card.profileId!,
        sourceType: "NFC",
      },
    });

    redirect(`/profile/${card.profile.username}`);
  }

  // Fallback
  notFound();
}
