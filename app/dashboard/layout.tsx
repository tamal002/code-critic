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
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="mr-1" />
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Image src="/cc_logo.png" alt="Code Critic Logo" width={128} height={128} />
          <div className="font-semibold">Code Critic</div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
          <LogoutButton />
        </header>
        <div className="p-4">{children}<Toaster/></div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
