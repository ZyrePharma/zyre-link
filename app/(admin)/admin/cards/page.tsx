import { prisma } from "@/lib/prisma";
import { RegisterCardDialog } from "@/components/admin/register-card-dialog";
import { DataTable } from "@/components/ui/data-table";
import { cardColumns } from "@/components/admin/cards-columns";

export default async function NfcCardsPage() {
  const cards = await prisma.nfcCard.findMany({
    include: { user: true, profile: true },
    orderBy: { createdAt: "desc" },
  });

  const data = cards.map((c) => ({
    id: c.id,
    cardUid: c.cardUid,
    activationCode: c.activationCode,
    cardType: c.cardType,
    isActivated: c.isActivated,
    isLocked: c.isLocked,
    isDeactivated: c.isDeactivated,
    notes: c.notes,
    assignedAt: c.assignedAt,
    createdAt: c.createdAt,
    user: c.user ? { id: c.user.id, name: c.user.name, email: c.user.email } : null,
    profile: c.profile ? { username: c.profile.username } : null,
  }));

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">NFC Card Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Monitor card inventory, assign to employees, and manage security.</p>
        </div>
        <RegisterCardDialog />
      </div>

      <DataTable
        columns={cardColumns}
        data={data}
        searchPlaceholder="Search by card UID, user, type..."
      />
    </div>
  );
}
