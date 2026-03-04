import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium animate-pulse">Redirecting...</p>
    </div>
  );
}
