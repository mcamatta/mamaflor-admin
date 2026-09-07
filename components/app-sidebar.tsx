"use client";

import * as React from "react";
import {
  IconDashboard,
  IconHome,
  IconLayoutDashboard,
  IconSettings,
  IconUserShield,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AppUser } from "@/lib/types";

const navigation = {
  main: [
    { title: "Visão geral", url: "/dashboard", icon: IconDashboard },
    { title: "Pessoas", url: "/dashboard/pessoas", icon: IconUsers },
    { title: "Usuários", url: "/dashboard/usuarios", icon: IconUserShield },
  ],
  secondary: [
    {
      title: "Configurações",
      url: "/dashboard/setting",
      icon: IconSettings,
    },
    { title: "Voltar ao site", url: "/", icon: IconHome },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AppUser;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="!p-1.5">
              <Link href="/dashboard">
                <IconLayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">Associação</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
        <NavSecondary items={navigation.secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
