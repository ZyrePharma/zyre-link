import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/profile-form";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          contactMethods: true,
          socialLinks: true,
          customLinks: true,
        }
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        
      </div>

      <ProfileForm initialData={user.profile} userEmail={user.email} />
    </div>
  );
}
