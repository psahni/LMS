import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const user = await getCurrentUser();
  const { returnTo } = await searchParams;
  
  // If already logged in, redirect to dashboard
  if (user) {
    redirect(returnTo || "/author");
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              LearnHub
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            Welcome back! Sign in to continue.
          </p>
        </div>
        
        <LoginForm returnTo={returnTo} />
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}


