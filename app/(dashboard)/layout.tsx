import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole={(session.user as any).role} />
      <main className="flex-1 pl-64">
        {children}
      </main>
    </div>
  );
}
