import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "../module/auth/components/logoutButton";
import { requireAuth } from "../module/auth/utils/auth-utils";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="mr-1" />
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="font-semibold">Dashboard</div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
          <LogoutButton />
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
