import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/forms/account-form";
import { redirect } from "next/navigation";

export default async function AccountSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your login credentials and security settings.
        </p>
      </div>

      <AccountForm initialEmail={user.email} />
    </div>
  );
}
