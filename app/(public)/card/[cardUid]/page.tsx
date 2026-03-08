import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function CardRedirectPage({ params }: { params: Promise<{ cardUid: string }> }) {
  const { cardUid } = await params;

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


  // If card is linked to a profile, redirect to that profile
  if (card.profile) {
    redirect(`/profile/${card.profile.username}?source=nfc`);
  }

  // Fallback
  notFound();
}
