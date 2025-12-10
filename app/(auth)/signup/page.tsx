import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const user = await getCurrentUser();
  
  // If already logged in, redirect to dashboard
  if (user) {
    redirect("/author");
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
            Create your author account
          </p>
        </div>
        
        <SignupForm />
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


