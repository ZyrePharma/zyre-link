import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/profile-form";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: {
        include: {
          contactMethods: true,
          socialLinks: true,
          customLinks: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Editing profile for <span className="font-semibold text-foreground">{user.name || user.email}</span>
        </p>
      </div>

      <ProfileForm userId={user.id} initialData={user.profile} />
    </div>
  );
}
