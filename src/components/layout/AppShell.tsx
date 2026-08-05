import { Link, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  ScanSearch,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = { title: string; url: "/dashboard" | "/builder" | "/ats-checker" | "/jobs" | "/optimize"; icon: LucideIcon };

const items: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Resumes", url: "/builder", icon: FileText },
  { title: "ATS Checker", url: "/ats-checker", icon: ScanSearch },
  { title: "Optimizer", url: "/optimize", icon: Sparkles },
  { title: "Job Search", url: "/jobs", icon: Briefcase },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link to="/" className="font-semibold text-foreground">
              ResumeAI
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
            <SidebarTrigger />
            <h1 className="truncate text-sm font-semibold">{title}</h1>
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
