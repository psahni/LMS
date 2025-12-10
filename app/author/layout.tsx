import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthorSidebar } from "@/components/author/author-sidebar";
import { AuthorHeader } from "@/components/author/author-header";
import { getCurrentUser } from "@/app/actions/auth-actions";

interface AuthorLayoutProps {
  children: React.ReactNode;
}

export default async function AuthorLayout({ children }: AuthorLayoutProps) {
  const user = await getCurrentUser();
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect("/login");
  }
  
  // If not an author or admin, show error
  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }
  
  return (
    <SidebarProvider>
      <AuthorSidebar />
      <SidebarInset>
        <AuthorHeader user={{ name: user.name, email: user.email }} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
