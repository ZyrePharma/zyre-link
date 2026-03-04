import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-600">ZYRE LINK</h1>
          <p className="mt-2 text-sm text-gray-600">Digital Business Card Management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
