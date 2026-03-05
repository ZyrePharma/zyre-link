import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex light text-foreground">
      <Sidebar userRole={(session.user as any).role} />
      <div className="flex-1 md:pl-64 flex flex-col">
        <Navbar userName={session.user.name} userImage={session.user.image} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
