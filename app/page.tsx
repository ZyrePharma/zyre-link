import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    const userRole = (session.user as any)?.role;
    if (userRole === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium animate-pulse">Redirecting...</p>
    </div>
  );
}
