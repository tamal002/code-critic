import React, { Suspense } from "react";
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

async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <AuthGate>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 items-center gap-3 border-b bg-background/60 backdrop-blur-md px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center bg-zinc-950">
                  <Image 
                    src="/cc_logo_v2.png" 
                    alt="Code Critic Logo" 
                    width={40} 
                    height={40} 
                    className="object-cover"
                  />
                </div>
                <div className="font-bold text-lg tracking-tight">CodeCritic</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </header>
            <div className="p-4">{children}<Toaster/></div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGate>
    </Suspense>
  );
};

export default DashboardLayout;
