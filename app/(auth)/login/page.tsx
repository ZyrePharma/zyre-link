import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            ZYRE <span className="text-secondary">LINK</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Digital Business Card Management</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
