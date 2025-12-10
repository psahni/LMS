"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/app/actions/auth-actions";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/author",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/author/courses",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/author/settings",
    icon: Settings,
  },
];

export const AuthorSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/author") {
      return pathname === "/author";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/logout";
  };

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <Link
          href="/author"
          className="flex items-center gap-2 font-semibold text-lg"
          aria-label="Go to Author Dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            LearnHub
          </span>
        </Link>
      </SidebarHeader>
      
      <Separator className="mx-4 w-auto" />
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className="transition-all duration-200"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3"
                      aria-label={item.title}
                      tabIndex={0}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3"
                aria-label="Sign out"
                tabIndex={0}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
