import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { username: true }
  });

  return (
    <div className="min-h-screen bg-background flex light text-foreground">
      <Sidebar userRole={(session.user as any).role} />
      <div className="flex-1 md:pl-64 flex flex-col">
        <Navbar 
          userName={session.user.name} 
          userImage={session.user.image} 
          userRole={(session.user as any).role}
          username={profile?.username}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
