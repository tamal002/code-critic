"use client"

import React from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FolderGit2,
  MessageSquare,
  CreditCard,
  Settings,
  Github,
} from "lucide-react"

import {useSession} from "@/lib/auth-client";

type AppSidebarProps = {
  user?: {
    name?: string
    email?: string
    avatarUrl?: string
  }
}

const AppSidebar: React.FC<AppSidebarProps> = () => {

    const { data: session } = useSession();
    // const [isLoading, setIsLoading] = React.useState(false);
    // Use session data directly for user info
    const user = {
        name: session?.user?.name,
        email: session?.user?.email,
        avatarUrl: session?.user?.image
    };
    

  return (
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg border bg-background p-3 flex items-center gap-3">
            <Github className="w-4 h-4" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Connected Account</p>
            </div>
            <Button size="sm" variant="outline">Manage</Button>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/repository">
                    <FolderGit2 />
                    <span>Repository</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/reviews">
                    <MessageSquare />
                    <span>Reviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/subscription">
                    <CreditCard />
                    <span>Subscription</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />
        </SidebarContent>

        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg border bg-background p-3 flex items-center gap-3">
            <Avatar>
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name ?? "User"} />
              ) : (
                <AvatarFallback className="bg-muted">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/settings">Profile</Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
  )
}

export default AppSidebar
